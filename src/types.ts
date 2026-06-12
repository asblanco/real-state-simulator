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
  afaPct: number;
}

export interface YearData {
  year: number;
  factorSubida: number;
  mensualPiso: number;
  mensualParking: number;
  ingresoMensualTotal: number;
  interesesAnuales: number;
  amortizacionAnual: number;
  deudaRestante: number;
  cashflowPreTaxMensual: number;
  resultadoFiscalAnual: number;
  devolucionFiscalMensual: number;
  cashflowNetoPostTaxMensual: number;
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
