import { test, expect, describe } from "bun:test";
import { computePurchaseCosts, getRentFactor, calculateYear, calculateAllYears, computeSummary } from "../calculator";
import type { InputParams, PurchaseCosts } from "../types";

const defaultParams: InputParams = {
  precio: 340000,
  parking: 15000,
  entradaPct: 0.15,
  interesPct: 0.0422,
  tilgungPct: 0.01,
  alquilerInicialPiso: 1125,
  alquilerInicialParking: 80,
  subidaPct: 0.15,
  inflacionPct: 0.025,
  afaPct: 0.035,
};

describe("getRentFactor", () => {
  test("year 1-3 returns 1", () => {
    expect(getRentFactor(1, 0.15)).toBe(1);
    expect(getRentFactor(3, 0.15)).toBe(1);
  });
  test("year 4-6 applies first trienal increase", () => {
    expect(getRentFactor(4, 0.15)).toBe(1.15);
    expect(getRentFactor(6, 0.15)).toBe(1.15);
  });
  test("year 7-9 applies second trienal increase", () => {
    expect(getRentFactor(7, 0.15)).toBeCloseTo(1.3225);
    expect(getRentFactor(9, 0.15)).toBeCloseTo(1.3225);
  });
  test("year 10 applies third trienal increase", () => {
    expect(getRentFactor(10, 0.15)).toBeCloseTo(1.520875);
  });
  test("0% subida always returns 1", () => {
    for (let y = 1; y <= 10; y++) {
      expect(getRentFactor(y, 0)).toBe(1);
    }
  });
});

describe("computePurchaseCosts", () => {
  const costs = computePurchaseCosts(defaultParams);

  test("capital propio + monto financiar = total price", () => {
    expect(costs.capitalPropioEntrada + costs.montoFinanciar).toBe(355000);
  });

  test("entrada = 15% of total", () => {
    expect(costs.capitalPropioEntrada).toBe(355000 * 0.15);
  });

  test("ITP = 3.5%, Notario = 2%, Agencia = 3.57%", () => {
    const total = 355000;
    expect(costs.costeITP).toBe(total * 0.035);
    expect(costs.costeNotario).toBe(total * 0.02);
    expect(costs.costeAgencia).toBe(total * 0.0357);
  });

  test("monthly payment formula", () => {
    const monto = 355000 - 355000 * 0.15;
    expect(costs.cuotaMensualHipoteca).toBe((monto * (0.0422 + 0.01)) / 12);
  });
});

describe("calculateYear", () => {
  const costs = computePurchaseCosts(defaultParams);
  const year1 = calculateYear(defaultParams, 1, costs.montoFinanciar, costs.cuotaMensualHipoteca);

  test("year 1 rent = initial rent (factor 1)", () => {
    expect(year1.mensualPiso).toBe(1125);
    expect(year1.mensualParking).toBe(80);
    expect(year1.ingresoMensualTotal).toBe(1205);
  });

  test("year 1 interest calculated on full mortgage", () => {
    expect(year1.interesesAnuales).toBeCloseTo(costs.montoFinanciar * 0.0422, 1);
  });

  test("amortization = annual payment - interest", () => {
    const annualPayment = costs.cuotaMensualHipoteca * 12;
    expect(year1.amortizacionAnual).toBeCloseTo(annualPayment - year1.interesesAnuales, 1);
  });

  test("new debt = old debt - amortization", () => {
    expect(year1.deudaRestante).toBeCloseTo(costs.montoFinanciar - year1.amortizacionAnual, 1);
  });
});

describe("calculateAllYears", () => {
  const costs = computePurchaseCosts(defaultParams);
  const years = calculateAllYears(defaultParams, costs);

  test("returns 10 years", () => {
    expect(years).toHaveLength(10);
  });

  test("remaining debt decreases each year", () => {
    for (let i = 1; i < years.length; i++) {
      expect(years[i].deudaRestante).toBeLessThan(years[i - 1].deudaRestante);
    }
  });

  test("rent increases with trienal steps", () => {
    expect(years[0].ingresoMensualTotal).toBe(1205);
    expect(years[3].ingresoMensualTotal).toBeCloseTo(1205 * 1.15, 1);
    expect(years[6].ingresoMensualTotal).toBeCloseTo(1205 * 1.15 * 1.15, 1);
    expect(years[9].ingresoMensualTotal).toBeCloseTo(1205 * 1.15 * 1.15 * 1.15, 1);
  });
});

describe("computeSummary", () => {
  const costs = computePurchaseCosts(defaultParams);
  const years = calculateAllYears(defaultParams, costs);
  const summary = computeSummary(defaultParams, years, costs);

  test("future property value applies compound inflation", () => {
    const expected = 355000 * (1.025 ** 10);
    expect(summary.valorPropiedadFutura).toBeCloseTo(expected, 1);
  });

  test("net from sale is positive", () => {
    expect(summary.netoDeLaVenta).toBeGreaterThan(0);
  });

  test("total cashflow accumulated over 10 years", () => {
    const manualTotal = years.reduce((sum, y) => sum + y.cashflowNetoPostTaxMensual * 12, 0);
    expect(summary.totalCashflowAcumulado).toBeCloseTo(manualTotal, 1);
  });

  test("ROI is finite and reasonable", () => {
    expect(Number.isFinite(summary.roiAnualizado)).toBe(true);
    expect(summary.roiAnualizado).toBeGreaterThan(-1);
    expect(summary.roiAnualizado).toBeLessThan(1);
  });
});

describe("edge cases", () => {
  test("zero appreciation (inflacion = 0)", () => {
    const params: InputParams = { ...defaultParams, inflacionPct: 0 };
    const costs = computePurchaseCosts(params);
    const years = calculateAllYears(params, costs);
    const summary = computeSummary(params, years, costs);
    expect(summary.valorPropiedadFutura).toBeCloseTo(355000, 1);
  });

  test("no mortgage (100% equity)", () => {
    const params: InputParams = { ...defaultParams, entradaPct: 1.0 };
    const costs = computePurchaseCosts(params);
    expect(costs.montoFinanciar).toBe(0);
    expect(costs.cuotaMensualHipoteca).toBe(0);
    const years = calculateAllYears(params, costs);
    // No interest or amortization
    for (const y of years) {
      expect(y.interesesAnuales).toBe(0);
      expect(y.amortizacionAnual).toBe(0);
    }
  });

  test("no rent increase (subida = 0)", () => {
    const params: InputParams = { ...defaultParams, subidaPct: 0 };
    const costs = computePurchaseCosts(params);
    const years = calculateAllYears(params, costs);
    for (const y of years) {
      expect(y.ingresoMensualTotal).toBe(1205);
    }
  });

  test("fiscal result is negative when high interest", () => {
    const params: InputParams = { ...defaultParams, interesPct: 0.06, entradaPct: 0.05 };
    const costs = computePurchaseCosts(params);
    const years = calculateAllYears(params, costs);
    // Early years should have negative tax result due to high interest
    expect(years[0].resultadoFiscalAnual).toBeLessThan(0);
    expect(years[0].devolucionFiscalMensual).toBeGreaterThan(0);
  });
});
