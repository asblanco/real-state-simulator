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
  useFlatRate: boolean;
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
  roiAnualizado: number;
}
