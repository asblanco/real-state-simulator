import type { InputParams, YearData, PurchaseCosts, SummaryData } from "./types";
import {
  UMLAGE_PCT,
  TAX_RATE,
  ITP_RATE,
  NOTARIO_RATE,
  AGENCIA_RATE,
  AFA_BUILDING_PCT,
  MONTHS_PER_YEAR,
} from "./constants";

export function computePurchaseCosts(params: InputParams): PurchaseCosts {
  const precioTotal = params.precio + params.parking;
  const capitalPropioEntrada = precioTotal * params.entradaPct;
  const costeITP = precioTotal * ITP_RATE;
  const costeNotario = precioTotal * NOTARIO_RATE;
  const costeAgencia = precioTotal * AGENCIA_RATE;
  const efectivoTotalNecesario = capitalPropioEntrada + costeITP + costeNotario + costeAgencia;
  const montoFinanciar = precioTotal - capitalPropioEntrada;
  const cuotaMensualHipoteca = (montoFinanciar * (params.interesPct + params.tilgungPct)) / MONTHS_PER_YEAR;
  return { capitalPropioEntrada, costeITP, costeNotario, costeAgencia, efectivoTotalNecesario, montoFinanciar, cuotaMensualHipoteca };
}

export function getRentFactor(year: number, subidaPct: number): number {
  return (1 + subidaPct) ** (year - 1);
}

export function computeFlatRatePct(params: InputParams): number {
  const base = params.alquilerInicialPiso + params.alquilerInicialParking;
  const p = params.subidaPct;
  const n = params.years;
  if (p === 0 || base === 0) return 0;
  const flatX = (base * ((1 + p) ** n - 1) / p - n * base) / (n * (n - 1) / 2);
  return flatX / base;
}

export function calculateYear(
  params: InputParams,
  year: number,
  deudaRestante: number,
  cuotaMensualHipoteca: number,
): YearData {
  const factorSubida = params.useFlatRate
    ? 1 + (year - 1) * computeFlatRatePct(params)
    : getRentFactor(year, params.subidaPct);
  const mensualPiso = params.alquilerInicialPiso * factorSubida;
  const mensualParking = params.alquilerInicialParking * factorSubida;
  const umlageMensual = params.hausgeldTotal * UMLAGE_PCT;
  const ingresoWarmMensual = mensualPiso + mensualParking + umlageMensual;

  const interesesAnuales = deudaRestante * params.interesPct;
  const interesesMensuales = interesesAnuales / MONTHS_PER_YEAR;
  const cuotaAnualTotal = cuotaMensualHipoteca * MONTHS_PER_YEAR;
  const amortizacionAnual = cuotaAnualTotal - interesesAnuales;
  const amortizacionMensual = amortizacionAnual / MONTHS_PER_YEAR;
  const nuevaDeuda = deudaRestante - amortizacionAnual;

  const gastosOperativosMensuales = params.hausgeldTotal + params.reservaImprevistos;
  const cashflowPreTaxMensual = ingresoWarmMensual - cuotaMensualHipoteca - gastosOperativosMensuales;

  const ingresosBrutosAnuales = ingresoWarmMensual * MONTHS_PER_YEAR;
  const afaEdificioAnual = (params.precio * AFA_BUILDING_PCT * (1 / params.afaYears));
  const gastosDeduciblesAnuales = interesesAnuales + afaEdificioAnual + (params.hausgeldTotal * MONTHS_PER_YEAR);
  const resultadoFiscalAnual = ingresosBrutosAnuales - gastosDeduciblesAnuales;
  const resultadoFiscalMensual = resultadoFiscalAnual / MONTHS_PER_YEAR;

  const devolucionFiscalMensual = resultadoFiscalAnual < 0 ? (-resultadoFiscalAnual * TAX_RATE) / MONTHS_PER_YEAR : 0;
  const cashflowNetoPostTaxMensual = cashflowPreTaxMensual + devolucionFiscalMensual;
  const afaMensual = afaEdificioAnual / MONTHS_PER_YEAR;

  return {
    year,
    factorSubida,
    mensualPiso,
    mensualParking,
    umlageMensual,
    ingresoWarmMensual,
    hipotecaMensual: cuotaMensualHipoteca,
    interesesMensuales,
    amortizacionMensual,
    deudaRestante: nuevaDeuda,
    cashflowPreTaxMensual,
    resultadoFiscalMensual,
    devolucionFiscalMensual,
    cashflowNetoPostTaxMensual,
    afaMensual,
  };
}

export function calculateAllYears(params: InputParams, purchaseCosts: PurchaseCosts): YearData[] {
  const years: YearData[] = [];
  let deudaRestante = purchaseCosts.montoFinanciar;
  for (let y = 1; y <= params.years; y++) {
    const yearData = calculateYear(params, y, deudaRestante, purchaseCosts.cuotaMensualHipoteca);
    deudaRestante = yearData.deudaRestante;
    years.push(yearData);
  }
  return years;
}

export function computeSummary(params: InputParams, years: YearData[], purchaseCosts: PurchaseCosts): SummaryData {
  const n = params.years;
  const precioTotal = params.precio + params.parking;
  const valorPropiedadFutura = precioTotal * ((1 + params.inflacionPct) ** n);
  const deudaRestanteFinal = years[years.length - 1].deudaRestante;
  const netoDeLaVenta = valorPropiedadFutura - deudaRestanteFinal;

  const totalCashflowAcumulado = years.reduce((sum, y) => sum + y.cashflowNetoPostTaxMensual * MONTHS_PER_YEAR, 0);
  const gananciaNeta = netoDeLaVenta - purchaseCosts.efectivoTotalNecesario + totalCashflowAcumulado;

  const capitalTotalFinal = gananciaNeta + purchaseCosts.efectivoTotalNecesario;
  const roiAnualizado = (capitalTotalFinal / purchaseCosts.efectivoTotalNecesario) ** (1 / n) - 1;

  const costoAdquisicionTotal = purchaseCosts.efectivoTotalNecesario + purchaseCosts.montoFinanciar;
  const afaAnual = (params.precio * AFA_BUILDING_PCT * (1 / params.afaYears));
  const afaAcumulada = afaAnual * n;
  const gananciaVenta = netoDeLaVenta - purchaseCosts.efectivoTotalNecesario;
  const gananciaFiscal = valorPropiedadFutura - (costoAdquisicionTotal - afaAcumulada);
  const roiCapitalPropioTotal = gananciaNeta / purchaseCosts.efectivoTotalNecesario;
  const roiProyectoTotal = gananciaFiscal / costoAdquisicionTotal;
  const roiProyectoAnualizado = (1 + roiProyectoTotal) ** (1 / n) - 1;
  const apalancamiento = roiCapitalPropioTotal > 0 && roiProyectoTotal > 0 ? roiCapitalPropioTotal / roiProyectoTotal : 0;

  return {
    valorPropiedadFutura, deudaRestanteFinal, netoDeLaVenta, totalCashflowAcumulado,
    gananciaNeta, capitalTotalFinal, roiAnualizado,
    costoAdquisicionTotal, afaAcumulada, gananciaVenta, gananciaFiscal,
    roiProyectoAnualizado, roiCapitalPropioTotal, roiProyectoTotal, apalancamiento,
  };
}
