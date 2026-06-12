import type { InputParams, YearData, PurchaseCosts, SummaryData } from "./types";
import { DEFAULT_PARAMS } from "./constants";
import { computeFlatRatePct } from "./calculator";
import { getRoiColorClass, getRoiProyectoColorClass } from "./roi";
import { t } from "./i18n";

let tooltipAnchor: HTMLElement | null = null;
let tooltipListenersAttached = false;
let currentImprevistos = 0;
let currentHausgeld = 0;

function showTooltip(content: string, anchor: HTMLElement): void {
  const portal = document.getElementById("tooltip-portal") as HTMLElement;
  if (!portal) return;
  portal.innerHTML = `<div class="bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 shadow-xl w-64 space-y-1">${content}</div>`;
  portal.classList.remove("hidden");

  const anchorRect = anchor.getBoundingClientRect();
  const portalRect = portal.getBoundingClientRect();

  let top = anchorRect.top - portalRect.height - 8;
  const left = Math.max(4, anchorRect.left + anchorRect.width / 2 - portalRect.width / 2);

  if (top < 4) {
    top = anchorRect.bottom + 8;
  }
  portal.style.top = `${top}px`;
  portal.style.left = `${left}px`;
  tooltipAnchor = anchor;
}

function hideTooltip(): void {
  const portal = document.getElementById("tooltip-portal") as HTMLElement;
  if (portal) portal.classList.add("hidden");
  tooltipAnchor = null;
}

export function applyDefaults(): void {
  const p = DEFAULT_PARAMS;
  const setVal = (id: string, val: number | string) => {
    ((document.getElementById(`input-${id}`) as HTMLInputElement).value = String(val));
  };
  setVal("precio", p.precio);
  setVal("parking", p.parking);
  setVal("entrada", p.entradaPct * 100);
  setVal("interes", (p.interesPct * 100).toFixed(2));
  setVal("tilgung", (p.tilgungPct * 100).toFixed(1));
  setVal("alquiler", p.alquilerInicialPiso);
  setVal("alquiler-parking", p.alquilerInicialParking);
  setVal("subida", p.subidaPct * 100);
  setVal("inflacion", (p.inflacionPct * 100).toFixed(1));
  setVal("hausgeld", p.hausgeldTotal.toString());
  setVal("reserva-imprevistos", p.reservaImprevistos.toString());
  updateDisplayValues(p);
  (document.getElementById("toggle-subida") as HTMLInputElement).checked = p.useFlatRate;
}

export function bindToggle(handler: () => void): void {
  document.getElementById("toggle-subida")!.addEventListener("change", handler);
}

export function formatEuro(val: number): string {
  return Math.round(val).toLocaleString("de-DE") + " €";
}

export function readInputs(): InputParams {
  const getVal = (id: string) => parseFloat((document.getElementById(id) as HTMLInputElement).value);
  return {
    precio: getVal("input-precio"),
    parking: getVal("input-parking"),
    entradaPct: getVal("input-entrada") / 100,
    interesPct: getVal("input-interes") / 100,
    tilgungPct: getVal("input-tilgung") / 100,
    alquilerInicialPiso: getVal("input-alquiler"),
    alquilerInicialParking: getVal("input-alquiler-parking"),
    subidaPct: getVal("input-subida") / 100,
    inflacionPct: getVal("input-inflacion") / 100,
    afaYears: getVal("input-afa"),
    hausgeldTotal: getVal("input-hausgeld"),
    useFlatRate: (document.getElementById("toggle-subida") as HTMLInputElement).checked,
    reservaImprevistos: getVal("input-reserva-imprevistos"),
  };
}

export function updateDisplayValues(params: InputParams): void {
  const setText = (id: string, val: string) => { (document.getElementById(id) as HTMLElement).innerText = val; };
  setText("val-precio", (params.precio).toLocaleString("de-DE"));
  setText("val-parking", (params.parking).toLocaleString("de-DE"));
  setText("val-entrada", (params.entradaPct * 100).toString());
  setText("val-interes", (params.interesPct * 100).toString());
  setText("val-tilgung", (params.tilgungPct * 100).toString());
  setText("val-alquiler", (params.alquilerInicialPiso).toLocaleString("de-DE"));
  setText("val-alquiler-parking", (params.alquilerInicialParking).toLocaleString("de-DE"));
  const p = params.subidaPct;
  const base = params.alquilerInicialPiso + params.alquilerInicialParking;
  const flatX = p === 0 ? 0 : (base * ((1 + p) ** 10 - 1) / p - 10 * base) / 45;
  setText("val-subida", (p * 100).toString());
  const suffix = params.useFlatRate ? t("ui.flat_format_active") : t("ui.flat_format");
  setText("val-subida-flat", `(~${Math.round(flatX)}${suffix})`);
  setText("val-inflacion", (params.inflacionPct * 100).toString());
  setText("val-afa", params.afaYears.toString());
  setText("val-afa-rate", `(${(100 / params.afaYears).toFixed(2)}%)`);
  setText("val-hausgeld", params.hausgeldTotal.toString());
  setText("val-reserva-imprevistos", params.reservaImprevistos.toString());
}

export function renderKPIs(purchaseCosts: PurchaseCosts, params: InputParams): void {
  const precioTotal = params.precio + params.parking;
  const costoAdquisicionTotal = purchaseCosts.efectivoTotalNecesario + purchaseCosts.montoFinanciar;
  (document.getElementById("kpi-precio-total") as HTMLElement).innerText = formatEuro(precioTotal);
  (document.getElementById("tt-ek") as HTMLElement).innerText = formatEuro(purchaseCosts.capitalPropioEntrada);
  (document.getElementById("tt-itp") as HTMLElement).innerText = formatEuro(purchaseCosts.costeITP);
  (document.getElementById("tt-notario") as HTMLElement).innerText = formatEuro(purchaseCosts.costeNotario);
  (document.getElementById("tt-agencia") as HTMLElement).innerText = formatEuro(purchaseCosts.costeAgencia);
  (document.getElementById("kpi-efectivo") as HTMLElement).innerText = formatEuro(purchaseCosts.efectivoTotalNecesario);
  (document.getElementById("kpi-costo-adquisicion") as HTMLElement).innerText = formatEuro(costoAdquisicionTotal);
  (document.getElementById("tt-costo-precio") as HTMLElement).innerText = formatEuro(precioTotal);
  (document.getElementById("tt-costo-itp") as HTMLElement).innerText = formatEuro(purchaseCosts.costeITP);
  (document.getElementById("tt-costo-notario") as HTMLElement).innerText = formatEuro(purchaseCosts.costeNotario);
  (document.getElementById("tt-costo-agencia") as HTMLElement).innerText = formatEuro(purchaseCosts.costeAgencia);
  (document.getElementById("tt-costo-total") as HTMLElement).innerText = formatEuro(costoAdquisicionTotal);
}

function svgIcon(): string {
  return `<svg class="w-3 h-3 text-gray-400 shrink-0 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
}

function warmContent(y: YearData): string {
  return `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${t("tooltip.warm_titulo")}</p>
    <div class="flex justify-between"><span>${t("tooltip.warm_piso")}</span><span>${formatEuro(y.mensualPiso)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.warm_parking")}</span><span>${formatEuro(y.mensualParking)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.warm_umlage")}</span><span>+${formatEuro(y.umlageMensual)}</span></div>
    <div class="text-[9px] text-gray-400 pt-0.5 italic">${t("tooltip.warm_factor")}${y.factorSubida.toFixed(2)}</div>`;
}

function cashflowContent(imprevistos: number, hausgeld: number): (y: YearData) => string {
  return (y: YearData) => `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${t("tooltip.cashflow_titulo")}</p>
    <div class="flex justify-between"><span>${t("tooltip.cashflow_renta")}</span><span class="text-green-300">+${formatEuro(y.ingresoWarmMensual)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.cashflow_hipoteca")}</span><span class="text-red-300">-${formatEuro(y.hipotecaMensual)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.cashflow_hausgeld")}</span><span class="text-red-300">-${hausgeld} €</span></div>
    <div class="flex justify-between"><span>${t("tooltip.cashflow_imprevistos")}</span><span class="text-red-300">-${imprevistos} €</span></div>
    <div class="border-t border-gray-700 pt-0.5 mt-0.5 flex justify-between font-bold"><span>${t("tooltip.cashflow_resultado")}</span><span>${formatEuro(y.cashflowPreTaxMensual)}</span></div>`;
}

function hipotecaContent(y: YearData): string {
  return `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${t("tooltip.hipoteca_titulo")}</p>
    <div class="flex justify-between"><span>${t("tooltip.hipoteca_intereses")}</span><span class="text-red-300">${formatEuro(y.interesesMensuales)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.hipoteca_amortizacion")}</span><span class="text-emerald-300">${formatEuro(y.amortizacionMensual)}</span></div>`;
}

function baseFiscalContent(y: YearData, hausgeld: number): string {
  return `
    <p class="font-bold text-amber-300 border-b border-gray-700 pb-0.5">${t("tooltip.fiscal_titulo")}</p>
    <div class="text-gray-300">${t("tooltip.fiscal_formula")}</div>
    <div class="text-gray-300">= ${formatEuro(y.ingresoWarmMensual)} − ${formatEuro(y.interesesMensuales)} − ${formatEuro(y.afaMensual)} − ${hausgeld}</div>
    <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold"><span>${t("tooltip.fiscal_resultado")}</span><span class="text-amber-300">${formatEuro(y.resultadoFiscalMensual)}</span></div>`;
}

function ahorroHeaderContent(): string {
  return `
    <p class="font-bold text-emerald-300 border-b border-gray-700 pb-0.5">${t("tooltip.ahorro_titulo")}</p>
    <div class="text-gray-300">${t("tooltip.ahorro_condicion")}</div>
    <div class="pl-2 text-gray-300">${t("tooltip.ahorro_formula")}</div>`;
}

export function renderTable(years: YearData[], reservaImprevistos: number, hausgeldTotal: number): void {
  const tbody = document.getElementById("tabla-proyeccion-body") as HTMLElement;
  tbody.innerHTML = "";
  currentImprevistos = reservaImprevistos;
  currentHausgeld = hausgeldTotal;
  for (const y of years) {
    const row = document.createElement("tr");
    row.className = y.year % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]";

    const icon = svgIcon();
    row.innerHTML = `
      <td class="text-center font-bold text-gray-500">${y.year}</td>
      <td class="text-center font-semibold"><div class="flex items-center justify-center gap-1">${formatEuro(y.ingresoWarmMensual)}<span class="tt" data-col="1">${icon}</span></div></td>
      <td class="text-center text-amber-700 bg-amber-50/40 font-medium"><div class="flex items-center justify-center gap-1">${formatEuro(-y.hipotecaMensual)}<span class="tt" data-col="2">${icon}</span></div></td>
      <td class="text-center text-gray-600"><div class="flex items-center justify-center gap-1">${formatEuro(y.cashflowPreTaxMensual)}<span class="tt" data-col="3">${icon}</span></div></td>
      <td class="text-center text-[#635BFF] font-mono"><div class="flex items-center justify-center gap-1">${formatEuro(y.resultadoFiscalMensual)}<span class="tt" data-col="4">${icon}</span></div></td>
      <td class="text-center text-emerald-700 bg-emerald-50/40 font-medium">+${formatEuro(y.devolucionFiscalMensual)}</td>
      <td class="text-center bg-blue-50/60 font-extrabold ${y.cashflowNetoPostTaxMensual >= 0 ? 'text-green-600' : 'text-orange-600'}">${formatEuro(y.cashflowNetoPostTaxMensual)}</td>
    `;

    // Store year data reference for tooltip event delegation
    (row as any)._yearData = y;
    tbody.appendChild(row);
  }

  if (tooltipListenersAttached) return;
  tooltipListenersAttached = true;

  // Event delegation: single listener on tbody for all tooltip triggers
  tbody.addEventListener("mouseover", (e) => {
    const target = (e.target as HTMLElement).closest(".tt") as HTMLElement | null;
    if (!target) return;
    const row = target.closest("tr") as any;
    const y = row?._yearData as YearData | undefined;
    const col = parseInt(target.dataset.col || "0");
    if (!y) return;

    const contentMap: Record<number, (y: YearData) => string> = {
      1: warmContent,
      2: hipotecaContent,
      3: cashflowContent(currentImprevistos, currentHausgeld),
      4: (y) => baseFiscalContent(y, currentHausgeld),
    };
    const fn = contentMap[col];
    if (fn) showTooltip(fn(y), target);
  });

  tbody.addEventListener("mouseout", (e) => {
    const target = (e.target as HTMLElement).closest(".tt") as HTMLElement | null;
    if (!target) return;
    const related = (e.relatedTarget as HTMLElement)?.closest?.(".tt");
    if (!related) hideTooltip();
  });

  const headerIcon = document.getElementById("tt-header-ahorro");
  if (headerIcon) {
    headerIcon.addEventListener("mouseenter", () => {
      showTooltip(ahorroHeaderContent(), headerIcon);
    });
    headerIcon.addEventListener("mouseleave", () => {
      hideTooltip();
    });
  }
}

function gananciaTooltip(summary: SummaryData): string {
  const baseFiscal = summary.costoAdquisicionTotal - summary.afaAcumulada;
  const cf = summary.totalCashflowAcumulado;
  const efectivoInvertido = summary.netoDeLaVenta - summary.gananciaVenta;
  return `
    <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-emerald-400">${t("tooltip.desglose_ganancia")}</p>
    <div class="flex justify-between"><span>${t("tooltip.valor_venta")}:</span><span class="font-mono">${formatEuro(summary.valorPropiedadFutura)}</span></div>
    <div class="flex justify-between"><span>− ${t("math.deuda_hipoteca")}:</span><span class="font-mono text-red-300">−${formatEuro(summary.deudaRestanteFinal)}</span></div>
    <div class="flex justify-between font-medium border-b border-gray-800 pb-1"><span>= ${t("tooltip.neto_venta")}:</span><span class="font-mono">${formatEuro(summary.netoDeLaVenta)}</span></div>
    <div class="flex justify-between"><span>− ${t("tooltip.menos_efectivo")}:</span><span class="font-mono text-red-300">−${formatEuro(efectivoInvertido)}</span></div>
    <div class="flex justify-between"><span>= ${t("tooltip.ganancia_venta")}:</span><span class="font-mono">${formatEuro(summary.gananciaVenta)}</span></div>
    <div class="flex justify-between"><span>${t("tooltip.mas_cashflow")}:</span><span class="font-mono ${cf >= 0 ? 'text-green-300' : 'text-red-300'}">${cf >= 0 ? '+' : ''}${formatEuro(cf)}</span></div>
    <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>${t("tooltip.resultado_final")}:</span><span class="font-mono">${formatEuro(summary.gananciaNeta)}</span></div>

    <p class="font-bold border-b border-gray-700 pb-1 mb-1 mt-2 text-amber-400">${t("tooltip.referencia_fiscal")}</p>
    <div class="flex justify-between"><span>${t("kpi.costo_adquisicion")}:</span><span class="font-mono">${formatEuro(summary.costoAdquisicionTotal)}</span></div>
    <div class="flex justify-between"><span>− ${t("math.afa_acumulada")}:</span><span class="font-mono text-red-300">−${formatEuro(summary.afaAcumulada)}</span></div>
    <div class="flex justify-between"><span>= ${t("tooltip.base_costo")}:</span><span class="font-mono">${formatEuro(baseFiscal)}</span></div>
    <div class="flex justify-between font-bold text-amber-300"><span>${t("tooltip.ganancia_fiscal")}:</span><span class="font-mono">${formatEuro(summary.gananciaFiscal)}</span></div>`;
}

function roeTooltip(summary: SummaryData, purchaseCosts: PurchaseCosts): string {
  return `
    <p class="font-bold text-[#635BFF] mb-1">${t("tooltip.roe_titulo")}</p>
    <div class="flex justify-between"><span>${t("kpi.ganancia_neto")}:</span><span class="font-mono">${formatEuro(summary.gananciaNeta)}</span></div>
    <div class="flex justify-between"><span>÷ ${t("kpi.efectivo_inicial")}:</span><span class="font-mono">${formatEuro(purchaseCosts.efectivoTotalNecesario)}</span></div>
    <div class="flex justify-between font-bold text-sky-300"><span>${t("tooltip.roe_total")}:</span><span class="font-mono">${(summary.roiCapitalPropioTotal * 100).toFixed(2)} %</span></div>
    <div class="flex justify-between font-bold text-sky-300"><span>${t("tooltip.roe_cagr")}:</span><span class="font-mono">${(summary.roiAnualizado * 100).toFixed(2)} %</span></div>
    <div class="border-t border-gray-700 pt-2 mt-2 space-y-1">
      <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Leyenda ROI</p>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0"></span>${t("tooltip.roi_bajo")} <span class="text-gray-400">&lt; 5%</span></div>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>${t("tooltip.roi_aceptable")} <span class="text-gray-400">5% – 10%</span></div>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>${t("tooltip.roi_excelente")} <span class="text-gray-400">≥ 10%</span></div>
    </div>
    <div class="border-t border-gray-700 pt-2 mt-2">
      <div class="flex justify-between"><span>${t("tooltip.apalancamiento")}:</span><span class="font-mono text-emerald-300">${summary.apalancamiento.toFixed(2)}x</span></div>
      <div class="text-[10px] text-gray-400 italic mt-1">${t("tooltip.apalancamiento_desc")}</div>
    </div>`;
}

function roaTooltip(summary: SummaryData): string {
  const baseFiscal = summary.costoAdquisicionTotal - summary.afaAcumulada;
  return `
    <p class="font-bold text-sky-300 mb-1">${t("tooltip.roa_titulo")}</p>
    <div class="flex justify-between"><span>${t("tooltip.valor_venta")}:</span><span class="font-mono">${formatEuro(summary.valorPropiedadFutura)}</span></div>
    <div class="flex justify-between"><span>− (${t("kpi.costo_adquisicion")} − ${t("math.afa_acumulada")}):</span><span class="font-mono text-red-300">−${formatEuro(baseFiscal)}</span></div>
    <div class="flex justify-between font-medium border-b border-gray-800 pb-1"><span>= ${t("tooltip.ganancia_fiscal")}:</span><span class="font-mono">${formatEuro(summary.gananciaFiscal)}</span></div>
    <div class="flex justify-between"><span>÷ ${t("kpi.costo_adquisicion")}:</span><span class="font-mono">${formatEuro(summary.costoAdquisicionTotal)}</span></div>
    <div class="flex justify-between font-bold text-sky-300"><span>${t("tooltip.roa_total")}:</span><span class="font-mono">${(summary.roiProyectoTotal * 100).toFixed(2)} %</span></div>
    <div class="flex justify-between font-bold text-sky-300"><span>${t("tooltip.roa_cagr")}:</span><span class="font-mono">${(summary.roiProyectoAnualizado * 100).toFixed(2)} %</span></div>
    <div class="border-t border-gray-700 pt-2 mt-2 space-y-1">
      <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Leyenda ROA</p>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0"></span>${t("tooltip.roi_bajo")} <span class="text-gray-400">&lt; 2,5%</span></div>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>${t("tooltip.roi_aceptable")} <span class="text-gray-400">2,5% – 5%</span></div>
      <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>${t("tooltip.roi_excelente")} <span class="text-gray-400">≥ 5%</span></div>
    </div>
    <div class="text-[10px] text-gray-400 italic mt-2 pt-1 border-t border-gray-700">${t("tooltip.roa_desc")}</div>`;
}

export function renderSummary(summary: SummaryData, purchaseCosts: PurchaseCosts): void {
  const ttGanancia = document.getElementById("tt-ganancia-content");
  if (ttGanancia) ttGanancia.innerHTML = gananciaTooltip(summary);

  const ttRoe = document.getElementById("tt-roe-content");
  if (ttRoe) ttRoe.innerHTML = roeTooltip(summary, purchaseCosts);

  const ttRoa = document.getElementById("tt-roa-content");
  if (ttRoa) ttRoa.innerHTML = roaTooltip(summary);

  (document.getElementById("kpi-retorno") as HTMLElement).innerText = formatEuro(summary.gananciaNeta);
  const roiDisplay = Number.isFinite(summary.roiAnualizado) ? (summary.roiAnualizado * 100).toFixed(2) + " %" : "0.00 %";
  (document.getElementById("kpi-roi") as HTMLElement).innerText = roiDisplay;
  (document.getElementById("kpi-roi-total") as HTMLElement).innerText = (summary.roiCapitalPropioTotal * 100).toFixed(2);

  const roaDisplay = Number.isFinite(summary.roiProyectoAnualizado) ? (summary.roiProyectoAnualizado * 100).toFixed(2) + " %" : "0.00 %";
  (document.getElementById("kpi-roi-proyecto") as HTMLElement).innerText = roaDisplay;
  (document.getElementById("kpi-roi-proyecto-total") as HTMLElement).innerText = (summary.roiProyectoTotal * 100).toFixed(2);

  const roiCard = document.getElementById("kpi-roi-card");
  if (roiCard) {
    const roi = Number.isFinite(summary.roiAnualizado) ? summary.roiAnualizado : 0;
    roiCard.className = roiCard.className.replace(/bg-\S+/g, "").trim();
    roiCard.classList.add(getRoiColorClass(roi));
  }

  const roaCard = document.getElementById("kpi-roa-card");
  if (roaCard) {
    const roa = Number.isFinite(summary.roiProyectoAnualizado) ? summary.roiProyectoAnualizado : 0;
    roaCard.className = roaCard.className.replace(/bg-\S+/g, "").trim();
    roaCard.classList.add(getRoiProyectoColorClass(roa));
  }

  // Math desglose
  (document.getElementById("math-venta") as HTMLElement).innerText = formatEuro(summary.valorPropiedadFutura);
  (document.getElementById("math-deuda") as HTMLElement).innerText = formatEuro(summary.deudaRestanteFinal);
  (document.getElementById("math-costo-adquisicion") as HTMLElement).innerText = formatEuro(summary.costoAdquisicionTotal);
  (document.getElementById("math-afa-acumulada") as HTMLElement).innerText = formatEuro(summary.afaAcumulada);
  (document.getElementById("math-efectivo") as HTMLElement).innerText = formatEuro(summary.totalCashflowAcumulado);
  (document.getElementById("math-final") as HTMLElement).innerText = formatEuro(summary.gananciaNeta);
}

export function bindInputs(ids: string[], handler: () => void): void {
  for (const id of ids) {
    document.getElementById(`input-${id}`)!.addEventListener("input", handler);
  }
}
