import { test, expect, describe } from "bun:test";
import { computePurchaseCosts, getRentFactor, computeFlatRatePct, calculateYear, calculateAllYears, computeSummary } from "../calculator";
import type { InputParams, PurchaseCosts } from "../types";

const defaultParams: InputParams = {
  precio: 340000,
  parking: 15000,
  entradaPct: 0.15,
  interesPct: 0.0422,
  tilgungPct: 0.01,
  alquilerInicialPiso: 1125,
  alquilerInicialParking: 80,
  subidaPct: 0.02,
  inflacionPct: 0.025,
  afaYears: 28,
  useFlatRate: false,
  hausgeldTotal: 500,
  reservaImprevistos: 100,
  years: 10,
};

const KALT_INITIAL = 1125 + 80;
const UMLAGE = defaultParams.hausgeldTotal * 0.6;
const WARM_INITIAL = KALT_INITIAL + UMLAGE;

describe("getRentFactor", () => {
  test("year 1 = 1 (no increase)", () => {
    expect(getRentFactor(1, 0.02)).toBe(1);
  });
  test("year 2 = 1.02", () => {
    expect(getRentFactor(2, 0.02)).toBe(1.02);
  });
  test("year 5 = 1.02^4", () => {
    expect(getRentFactor(5, 0.02)).toBeCloseTo(1.0824, 4);
  });
  test("year 10 = 1.02^9", () => {
    expect(getRentFactor(10, 0.02)).toBeCloseTo(1.1951, 4);
  });
  test("0% subida always returns 1", () => {
    for (let y = 1; y <= 10; y++) {
      expect(getRentFactor(y, 0)).toBe(1);
    }
  });
});

describe("computeFlatRatePct", () => {
  test("returns ~0.0211 for 2% compound on default rent", () => {
    const pct = computeFlatRatePct(defaultParams);
    expect(pct).toBeCloseTo(0.0211, 4);
  });
  test("returns 0 when subida is 0", () => {
    const pct = computeFlatRatePct({ ...defaultParams, subidaPct: 0 });
    expect(pct).toBe(0);
  });
  test("flat rate total over 10 years equals compound total", () => {
    const pct = computeFlatRatePct(defaultParams);
    let flatTotal = 0, compTotal = 0;
    const base = 1205, uml = 300;
    for (let y = 1; y <= 10; y++) {
      flatTotal += base * (1 + (y - 1) * pct) + uml;
      compTotal += base * (1.02 ** (y - 1)) + uml;
    }
    expect(flatTotal).toBeCloseTo(compTotal, 0);
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

  test("year 1 warm rent = kalt + parking + 300 umlage", () => {
    expect(year1.mensualPiso).toBe(1125);
    expect(year1.mensualParking).toBe(80);
    expect(year1.umlageMensual).toBe(300);
    expect(year1.ingresoWarmMensual).toBe(WARM_INITIAL);
  });

  test("year 1 monthly interest on full mortgage", () => {
    expect(year1.interesesMensuales).toBeCloseTo(costs.montoFinanciar * 0.0422 / 12, 1);
  });

  test("hipoteca total = interest + amortization", () => {
    expect(year1.hipotecaMensual).toBeCloseTo(year1.interesesMensuales + year1.amortizacionMensual, 1);
  });

  test("new debt = old debt - annual amortization", () => {
    const amortAnual = year1.amortizacionMensual * 12;
    expect(year1.deudaRestante).toBeCloseTo(costs.montoFinanciar - amortAnual, 1);
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

  test("warm rent increases with annual compound (umlage is fixed)", () => {
    expect(years[0].ingresoWarmMensual).toBe(KALT_INITIAL * 1 + UMLAGE);
    expect(years[3].ingresoWarmMensual).toBeCloseTo(KALT_INITIAL * 1.02 ** 3 + UMLAGE, 1);
    expect(years[6].ingresoWarmMensual).toBeCloseTo(KALT_INITIAL * 1.02 ** 6 + UMLAGE, 1);
    expect(years[9].ingresoWarmMensual).toBeCloseTo(KALT_INITIAL * 1.02 ** 9 + UMLAGE, 1);
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

  test("totalCapitalAportado includes initial plus negative cashflows", () => {
    const totalNegativo = years.reduce((sum, y) => {
      const annual = y.cashflowNetoPostTaxMensual * 12;
      return sum + (annual < 0 ? -annual : 0);
    }, 0);
    expect(summary.totalCapitalAportado).toBeCloseTo(costs.efectivoTotalNecesario + totalNegativo, 1);
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
    for (const y of years) {
      expect(y.interesesMensuales).toBe(0);
      expect(y.amortizacionMensual).toBe(0);
      expect(y.hipotecaMensual).toBe(0);
    }
    const summary = computeSummary(params, years, costs);
    expect(summary.totalCapitalAportado).toBeCloseTo(costs.efectivoTotalNecesario, 1);
  });

  test("no rent increase (subida = 0)", () => {
    const params: InputParams = { ...defaultParams, subidaPct: 0 };
    const costs = computePurchaseCosts(params);
    const years = calculateAllYears(params, costs);
    for (const y of years) {
      expect(y.ingresoWarmMensual).toBe(WARM_INITIAL);
    }
  });

  test("fiscal result is negative when high interest", () => {
    const params: InputParams = { ...defaultParams, interesPct: 0.06, entradaPct: 0.05 };
    const costs = computePurchaseCosts(params);
    const years = calculateAllYears(params, costs);
    expect(years[0].resultadoFiscalMensual).toBeLessThan(0);
    expect(years[0].devolucionFiscalMensual).toBeGreaterThan(0);
  });
});

describe("data consistency", () => {
  const scenarios = [
    { label: "default 15% entrada", params: defaultParams },
    { label: "10% entrada", params: { ...defaultParams, entradaPct: 0.10 } },
    { label: "0% entrada (100% financed)", params: { ...defaultParams, entradaPct: 0.0 } },
    { label: "40% entrada", params: { ...defaultParams, entradaPct: 0.40 } },
    { label: "different price & parking", params: { ...defaultParams, precio: 250000, parking: 20000 } },
    { label: "30 year horizon", params: { ...defaultParams, years: 30 } },
  ];

  for (const { label, params } of scenarios) {
    test(`[${label}] purchaseCosts components sum to efectivoTotalNecesario`, () => {
      const c = computePurchaseCosts(params);
      const sum = c.capitalPropioEntrada + c.costeITP + c.costeNotario + c.costeAgencia;
      expect(c.efectivoTotalNecesario).toBe(sum);
    });

    test(`[${label}] costoAdquisicionTotal matches card value`, () => {
      const c = computePurchaseCosts(params);
      const precioTotal = params.precio + params.parking;
      const costComponentsSum = precioTotal + c.costeITP + c.costeNotario + c.costeAgencia;
      const cardValue = c.efectivoTotalNecesario + c.montoFinanciar;
      expect(cardValue).toBe(costComponentsSum);
    });

    test(`[${label}] gananciaNeta matches breakdown`, () => {
      const c = computePurchaseCosts(params);
      const y = calculateAllYears(params, c);
      const s = computeSummary(params, y, c);
      const netoDeVenta = s.valorPropiedadFutura - s.deudaRestanteFinal;
      expect(netoDeVenta).toBeCloseTo(s.netoDeLaVenta, 2);
      const gananciaNeta = s.netoDeLaVenta - c.efectivoTotalNecesario + s.totalCashflowAcumulado;
      expect(gananciaNeta).toBeCloseTo(s.gananciaNeta, 2);
    });

    test(`[${label}] capitalTotalFinal = gananciaNeta + inversionInicial`, () => {
      const c = computePurchaseCosts(params);
      const y = calculateAllYears(params, c);
      const s = computeSummary(params, y, c);
      expect(s.capitalTotalFinal).toBeCloseTo(s.gananciaNeta + c.efectivoTotalNecesario, 2);
    });

    test(`[${label}] totalCapitalAportado >= efectivoTotalNecesario`, () => {
      const c = computePurchaseCosts(params);
      const y = calculateAllYears(params, c);
      const s = computeSummary(params, y, c);
      expect(s.totalCapitalAportado).toBeGreaterThanOrEqual(c.efectivoTotalNecesario);
    });
  }
});
