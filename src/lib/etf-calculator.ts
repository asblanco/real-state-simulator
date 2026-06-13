import type { InputParams, YearData, SummaryData, PurchaseCosts, EtfComparison, EtfYearData } from "./types";
import { MONTHS_PER_YEAR } from "./constants";

function etfFutureValue(
  initialCapital: number,
  monthlyCashflows: number[],
  monthlyRate: number,
): number {
  let value = initialCapital;
  for (const cf of monthlyCashflows) {
    value = value * (1 + monthlyRate) + cf;
  }
  return value;
}

function computeMonthlyCashflows(
  params: InputParams,
  years: YearData[],
  purchaseCosts: PurchaseCosts,
): number[] {
  const cashflows: number[] = [];
  for (const y of years) {
    for (let m = 0; m < MONTHS_PER_YEAR; m++) {
      const ingresoAlquiler = y.mensualPiso + y.mensualParking + y.umlageMensual;
      const costePropietario = y.hipotecaMensual + params.hausgeldTotal + params.reservaImprevistos;
      const diff = costePropietario - ingresoAlquiler;
      cashflows.push(diff);
    }
  }
  return cashflows;
}

function computeReWealthAtYear(
  params: InputParams,
  years: YearData[],
  yearIndex: number,
): number {
  const precioTotal = params.precio + params.parking;
  const y = years[yearIndex];
  const propertyValue = precioTotal * ((1 + params.inflacionPct) ** y.year);
  const accumulatedCashflow = years
    .slice(0, yearIndex + 1)
    .reduce((sum, yr) => sum + yr.cashflowNetoPostTaxMensual * MONTHS_PER_YEAR, 0);
  const netEquity = propertyValue - y.deudaRestante;
  return Math.round(netEquity + accumulatedCashflow);
}

export function computeEtfComparison(
  params: InputParams,
  years: YearData[],
  _summary: SummaryData,
  purchaseCosts: PurchaseCosts,
  etfCagr: number,
): EtfComparison {
  const initialCapital = purchaseCosts.efectivoTotalNecesario;
  const monthlyRate = (1 + etfCagr) ** (1 / MONTHS_PER_YEAR) - 1;
  const monthlyCashflows = computeMonthlyCashflows(params, years, purchaseCosts);

  let etfValue = initialCapital;
  const yearByYear: EtfYearData[] = [];

  for (let m = 0; m < years.length * MONTHS_PER_YEAR; m++) {
    etfValue = etfValue * (1 + monthlyRate) + monthlyCashflows[m];
    if ((m + 1) % MONTHS_PER_YEAR === 0) {
      const yearIdx = (m + 1) / MONTHS_PER_YEAR - 1;
      yearByYear.push({
        year: yearIdx + 1,
        etfValue: Math.round(etfValue),
        reTotalWealth: computeReWealthAtYear(params, years, yearIdx),
        monthlyContribution: Math.round(monthlyCashflows[m]),
      });
    }
  }

  const reFinalWealth = yearByYear[yearByYear.length - 1]?.reTotalWealth ?? 0;
  const etfFinalValue = Math.round(etfValue);

  let crossoverYear: number | null = null;
  for (const yy of yearByYear) {
    if (yy.etfValue >= yy.reTotalWealth) {
      crossoverYear = yy.year;
      break;
    }
  }

  const avgMonthlyContribution = Math.round(
    monthlyCashflows.reduce((a, b) => a + b, 0) / monthlyCashflows.length,
  );

  let breakevenCagr = 0;
  const target = reFinalWealth;
  let lo = 0, hi = 0.5;
  for (let iter = 0; iter < 100; iter++) {
    const mid = (lo + hi) / 2;
    const mr = (1 + mid) ** (1 / MONTHS_PER_YEAR) - 1;
    const fv = etfFutureValue(initialCapital, monthlyCashflows, mr);
    if (fv < target) lo = mid;
    else hi = mid;
  }
  breakevenCagr = (lo + hi) / 2;

  const scenarioRate = (cagr: number) => {
    const mr = (1 + cagr) ** (1 / MONTHS_PER_YEAR) - 1;
    return Math.round(etfFutureValue(initialCapital, monthlyCashflows, mr));
  };

  return {
    etfCagr,
    etfFinalValue,
    reFinalWealth,
    gap: etfFinalValue - reFinalWealth,
    breakevenCagr,
    crossoverYear,
    yearByYear,
    scenario5: scenarioRate(0.05),
    scenario7: scenarioRate(0.07),
    scenario10: scenarioRate(0.10),
    avgMonthlyContribution,
  };
}
