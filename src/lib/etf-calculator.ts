import type { InputParams, YearData, SummaryData, PurchaseCosts, EtfComparison, EtfYearData } from "./types";
import { MONTHS_PER_YEAR, TAX_COUNTRIES } from "./constants";

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
      cashflows.push(diff + params.extraMonthlyContribution);
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
  let cumulativeContribution = initialCapital;
  const yearByYear: EtfYearData[] = [];

  for (let m = 0; m < years.length * MONTHS_PER_YEAR; m++) {
    etfValue = etfValue * (1 + monthlyRate) + monthlyCashflows[m];
    cumulativeContribution += monthlyCashflows[m];
    if ((m + 1) % MONTHS_PER_YEAR === 0) {
      const yearIdx = (m + 1) / MONTHS_PER_YEAR - 1;
      const monthlyRentAtYear = years[yearIdx].ingresoWarmMensual;
      const sustainableWithdrawal = etfValue * params.swrPct / MONTHS_PER_YEAR;
      const cfg = TAX_COUNTRIES[params.taxCountry];
      const annualSW = sustainableWithdrawal * MONTHS_PER_YEAR;
      const gainRatio = Math.max(0, (etfValue - cumulativeContribution) / etfValue);
      const taxableGain = annualSW * gainRatio * cfg.taxableRatio;
      const taxableAfterAllowance = Math.max(0, taxableGain - cfg.allowance);
      const tax = taxableAfterAllowance * cfg.taxRate;
      const sustainableWithdrawalNet = (annualSW - tax) / MONTHS_PER_YEAR;
      yearByYear.push({
        year: yearIdx + 1,
        etfValue: Math.round(etfValue),
        reTotalWealth: computeReWealthAtYear(params, years, yearIdx),
        monthlyContribution: Math.round(monthlyCashflows[m]),
        cumulativeContribution: Math.round(cumulativeContribution),
        monthlyRentAtYear: Math.round(monthlyRentAtYear),
        sustainableWithdrawal: Math.round(sustainableWithdrawal),
        sustainableWithdrawalNet: Math.round(sustainableWithdrawalNet),
      });
    }
  }

  const reFinalWealth = yearByYear[yearByYear.length - 1]?.reTotalWealth ?? 0;
  const etfFinalValue = Math.round(etfValue);

  const cfg2 = TAX_COUNTRIES[params.taxCountry];
  const totalGain = Math.max(0, etfFinalValue - cumulativeContribution);
  const taxableGain = totalGain * cfg2.taxableRatio;
  const taxableAfterAllowance = Math.max(0, taxableGain - cfg2.allowance);
  const tax = taxableAfterAllowance * cfg2.taxRate;
  const etfFinalValueNet = Math.round(etfFinalValue - tax);

  let crossoverYear: number | null = null;
  for (const yy of yearByYear) {
    if (yy.etfValue >= yy.reTotalWealth) {
      crossoverYear = yy.year;
      break;
    }
  }

  let fiYear: number | null = null;
  let fiMonthlyIncome = 0;
  let fiMonthlyIncomeNet = 0;
  for (const yy of yearByYear) {
    if (yy.sustainableWithdrawal >= params.targetWithdrawal) {
      fiYear = yy.year;
      fiMonthlyIncome = yy.sustainableWithdrawal;
      fiMonthlyIncomeNet = yy.sustainableWithdrawalNet;
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
    etfFinalValueNet,
    reFinalWealth,
    gap: etfFinalValue - reFinalWealth,
    breakevenCagr,
    crossoverYear,
    fiYear,
    fiMonthlyIncome,
    fiMonthlyIncomeNet,
    yearByYear,
    scenario5: scenarioRate(0.05),
    scenario7: scenarioRate(0.07),
    scenario10: scenarioRate(0.10),
    avgMonthlyContribution,
  };
}
