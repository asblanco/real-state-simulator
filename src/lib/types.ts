export interface InputParams {
  precio: number;
  parking: number;
  entradaPct: number;
  interesPct: number;
  tilgungPct: number;
  alquilerInicialPiso: number;
  alquilerInicialParking: number;
  subidaPct: number;
  inflacionPct: number;
  afaYears: number;
  hausgeldTotal: number;
  useFlatRate: boolean;
  reservaImprevistos: number;
  extraMonthlyContribution: number;
  swrPct: number; // Safe withdrawal rate (e.g. 0.04 = 4% rule)
  targetWithdrawal: number;
  taxCountry: "de" | "es";
  years: number;
}

export interface YearData {
  year: number;
  factorSubida: number;
  mensualPiso: number;
  mensualParking: number;
  umlageMensual: number;
  ingresoWarmMensual: number;
  hipotecaMensual: number;
  interesesMensuales: number;
  amortizacionMensual: number;
  deudaRestante: number;
  cashflowPreTaxMensual: number;
  resultadoFiscalMensual: number;
  devolucionFiscalMensual: number;
  cashflowNetoPostTaxMensual: number;
  afaMensual: number;
}

export interface PurchaseCosts {
  capitalPropioEntrada: number;
  costeITP: number;
  costeNotario: number;
  costeAgencia: number;
  efectivoTotalNecesario: number;
  montoFinanciar: number;
  cuotaMensualHipoteca: number;
}

export interface SummaryData {
  valorPropiedadFutura: number;
  deudaRestanteFinal: number;
  netoDeLaVenta: number;
  totalCashflowAcumulado: number;
  gananciaNeta: number;
  capitalTotalFinal: number;
  totalCapitalAportado: number;
  roiAnualizado: number;
  costoAdquisicionTotal: number;
  afaAcumulada: number;
  gananciaVenta: number;
  gananciaFiscal: number;
  roiProyectoAnualizado: number;
  roiCapitalPropioTotal: number;
  roiProyectoTotal: number;
  apalancamiento: number;
}

export interface EtfYearData {
  year: number;
  etfValue: number;
  reTotalWealth: number;
  monthlyContribution: number;
  cumulativeContribution: number;
  sustainableWithdrawal: number;
  sustainableWithdrawalNet: number;
}

export interface EtfComparison {
  etfCagr: number;
  etfFinalValue: number;
  etfFinalValueNet: number;
  reFinalWealth: number;
  gap: number;
  breakevenCagr: number;
  crossoverYear: number | null;
  fiYear: number | null;
  fiMonthlyIncome: number;
  fiMonthlyIncomeNet: number;
  yearByYear: EtfYearData[];
  scenario5: number;
  scenario7: number;
  scenario10: number;
  avgMonthlyContribution: number;
}

export type Locale = "es" | "en" | "de";
