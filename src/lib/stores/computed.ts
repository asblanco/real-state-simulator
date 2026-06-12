import { derived, writable } from "svelte/store";
import { params } from "./params";
import { computePurchaseCosts, calculateAllYears, computeSummary } from "../calculator";
import { computeEtfComparison } from "../etf-calculator";
import { ETF_CAGR_DEFAULT, MONTHS_PER_YEAR } from "../constants";

export const purchaseCosts = derived(params, ($p) => computePurchaseCosts($p));

export const years = derived(
  [params, purchaseCosts],
  ([$p, $pc]) => calculateAllYears($p, $pc),
);

export const summary = derived(
  [params, years, purchaseCosts],
  ([$p, $y, $pc]) => computeSummary($p, $y, $pc),
);

export const etfCagr = writable(ETF_CAGR_DEFAULT);

export const etfComparison = derived(
  [params, years, summary, purchaseCosts, etfCagr],
  ([$p, $y, $s, $pc, $cagr]) => computeEtfComparison($p, $y, $s, $pc, $cagr),
);

export const roiColor = derived(summary, $s => $s.roiAnualizado < 0.05 ? "bg-red-600" : $s.roiAnualizado < 0.1 ? "bg-sky-600" : "bg-emerald-600");
export const roaColor = derived(summary, $s => $s.roiProyectoAnualizado < 0.025 ? "bg-red-600" : $s.roiProyectoAnualizado < 0.05 ? "bg-sky-600" : "bg-emerald-600");

export const afaAnual = derived(params, $p => ($p.afaYears > 0) ? ($p.precio * 0.75 * (1 / $p.afaYears)) : 0);
export const totalIntereses = derived(years, $y => $y.reduce((s, y) => s + y.interesesMensuales * MONTHS_PER_YEAR, 0));
export const totalAmortizacion = derived(years, $y => $y.reduce((s, y) => s + y.amortizacionMensual * MONTHS_PER_YEAR, 0));
export const totalAhorroFiscal = derived(years, $y => $y.reduce((s, y) => s + y.devolucionFiscalMensual * MONTHS_PER_YEAR, 0));
export const pctInteres = derived([totalIntereses, totalAmortizacion], ([$ti, $ta]) => $ti / ($ti + $ta) * 100);
export const pctAmortizacion = derived(pctInteres, $p => 100 - $p);

export const yearlyWealth = derived([years, params], ([$years, $params]) =>
  $years.map(y => {
    const pv = ($params.precio + $params.parking) * (1 + $params.inflacionPct) ** y.year;
    const equity = pv - y.deudaRestante;
    const cumCash = $years
      .filter(yr => yr.year <= y.year)
      .reduce((s, yr) => s + yr.cashflowNetoPostTaxMensual * MONTHS_PER_YEAR, 0);
    return {
      year: y.year,
      propertyValue: Math.round(pv),
      debt: Math.round(y.deudaRestante),
      equity: Math.round(equity),
      accumulatedCash: Math.round(cumCash),
      totalWealth: Math.round(equity + cumCash),
    };
  })
);
