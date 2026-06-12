import type { InputParams, YearData, PurchaseCosts, SummaryData } from "./types";
import { DEFAULT_PARAMS } from "./constants";

let tooltipAnchor: HTMLElement | null = null;

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
  setVal("afa", (p.afaPct * 100).toFixed(2));
  updateDisplayValues(p);
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
    afaPct: getVal("input-afa") / 100,
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
  setText("val-subida", (params.subidaPct * 100).toString());
  setText("val-inflacion", (params.inflacionPct * 100).toString());
  setText("val-afa", (params.afaPct * 100).toFixed(2));
}

export function renderKPIs(purchaseCosts: PurchaseCosts, params: InputParams): void {
  const precioTotal = params.precio + params.parking;
  (document.getElementById("kpi-precio-total") as HTMLElement).innerText = formatEuro(precioTotal);
  (document.getElementById("tt-ek") as HTMLElement).innerText = formatEuro(purchaseCosts.capitalPropioEntrada);
  (document.getElementById("tt-itp") as HTMLElement).innerText = formatEuro(purchaseCosts.costeITP);
  (document.getElementById("tt-notario") as HTMLElement).innerText = formatEuro(purchaseCosts.costeNotario);
  (document.getElementById("tt-agencia") as HTMLElement).innerText = formatEuro(purchaseCosts.costeAgencia);
  (document.getElementById("kpi-efectivo") as HTMLElement).innerText = formatEuro(purchaseCosts.efectivoTotalNecesario);
}

function svgIcon(): string {
  return `<svg class="w-3 h-3 text-gray-400 shrink-0 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
}

function warmContent(y: YearData): string {
  return `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Composición Renta Warm:</p>
    <div class="flex justify-between"><span>Alquiler Piso:</span><span>${formatEuro(y.mensualPiso)}</span></div>
    <div class="flex justify-between"><span>Alquiler Parking:</span><span>${formatEuro(y.mensualParking)}</span></div>
    <div class="flex justify-between"><span>Umlage (Hausgeld+Rückl.):</span><span>+${formatEuro(y.umlageMensual)}</span></div>
    <div class="text-[9px] text-gray-400 pt-0.5 italic">Aplicado factor de escala: x${y.factorSubida.toFixed(2)}</div>`;
}

function cashflowContent(y: YearData): string {
  return `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Cálculo Cashflow Bruto:</p>
    <div class="flex justify-between"><span>Renta Warm:</span><span class="text-green-300">+${formatEuro(y.ingresoWarmMensual)}</span></div>
    <div class="flex justify-between"><span>− Hipoteca:</span><span class="text-red-300">-${formatEuro(y.hipotecaMensual)}</span></div>
    <div class="flex justify-between"><span>− Hausgeld:</span><span class="text-red-300">-150 €</span></div>
    <div class="flex justify-between"><span>− Rücklage:</span><span class="text-red-300">-40 €</span></div>
    <div class="border-t border-gray-700 pt-0.5 mt-0.5 flex justify-between font-bold"><span>Cashflow Bruto:</span><span>${formatEuro(y.cashflowPreTaxMensual)}</span></div>`;
}

function hipotecaContent(y: YearData): string {
  return `
    <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Desglose Hipoteca:</p>
    <div class="flex justify-between"><span>Intereses (Zins):</span><span class="text-red-300">${formatEuro(y.interesesMensuales)}</span></div>
    <div class="flex justify-between"><span>Amortización (Tilgung):</span><span class="text-emerald-300">${formatEuro(y.amortizacionMensual)}</span></div>`;
}

function baseFiscalContent(y: YearData): string {
  return `
    <p class="font-bold text-amber-300 border-b border-gray-700 pb-0.5">Base Fiscal Mensual:</p>
    <div class="text-gray-300">= Ingresos Warm − Intereses − AfA − Hausgeld</div>
    <div class="text-gray-300">= ${formatEuro(y.ingresoWarmMensual)} − ${formatEuro(y.interesesMensuales)} − AfA − 150</div>
    <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold"><span>Base Fiscal:</span><span class="text-amber-300">${formatEuro(y.resultadoFiscalMensual)}</span></div>`;
}

function ahorroContent(y: YearData): string {
  return `
    <p class="font-bold text-emerald-300 border-b border-gray-700 pb-0.5">Cálculo Ahorro Fiscal:</p>
    <div class="text-gray-300">Si Base Fiscal &lt; 0:</div>
    <div class="pl-2 text-gray-300">Ahorro = (−Base × 42% Tasa) / 12</div>
    <div class="flex justify-between border-t border-gray-700 pt-1 mt-1"><span>Ahorro Fiscal:</span><span class="text-emerald-300">+${formatEuro(y.devolucionFiscalMensual)}</span></div>`;
}

export function renderTable(years: YearData[]): void {
  const tbody = document.getElementById("tabla-proyeccion-body") as HTMLElement;
  tbody.innerHTML = "";
  for (const y of years) {
    const row = document.createElement("tr");
    row.className = y.year % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]";

    const icon = svgIcon();
    row.innerHTML = `
      <td class="text-center font-bold text-gray-500">${y.year}</td>
      <td class="font-semibold"><div class="flex items-center gap-1">${formatEuro(y.ingresoWarmMensual)}<span class="tt" data-col="1">${icon}</span></div></td>
      <td class="text-gray-600"><div class="flex items-center gap-1">${formatEuro(y.cashflowPreTaxMensual)}<span class="tt" data-col="2">${icon}</span></div></td>
      <td class="text-[#635BFF] font-mono"><div class="flex items-center gap-1">${formatEuro(y.hipotecaMensual)}<span class="tt" data-col="3">${icon}</span></div></td>
      <td class="text-amber-700 bg-amber-50/40 font-medium"><div class="flex items-center gap-1">${formatEuro(y.resultadoFiscalMensual)}<span class="tt" data-col="4">${icon}</span></div></td>
      <td class="text-emerald-700 bg-emerald-50/40 font-medium"><div class="flex items-center gap-1">+${formatEuro(y.devolucionFiscalMensual)}<span class="tt" data-col="5">${icon}</span></div></td>
      <td class="bg-blue-50/60 text-[#635BFF] font-extrabold text-right pr-6">${formatEuro(y.cashflowNetoPostTaxMensual)}</td>
    `;

    // Store year data reference for tooltip event delegation
    (row as any)._yearData = y;
    tbody.appendChild(row);
  }

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
      2: cashflowContent,
      3: hipotecaContent,
      4: baseFiscalContent,
      5: ahorroContent,
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
}

export function renderSummary(summary: SummaryData, purchaseCosts: PurchaseCosts): void {
  (document.getElementById("tt-compra-orig") as HTMLElement).innerText = formatEuro(
    purchaseCosts.efectivoTotalNecesario + purchaseCosts.montoFinanciar,
  );
  (document.getElementById("tt-venta-futura") as HTMLElement).innerText = formatEuro(summary.valorPropiedadFutura);
  (document.getElementById("math-venta") as HTMLElement).innerText = formatEuro(summary.valorPropiedadFutura);
  (document.getElementById("math-deuda") as HTMLElement).innerText = formatEuro(summary.deudaRestanteFinal);
  (document.getElementById("math-efectivo") as HTMLElement).innerText = formatEuro(purchaseCosts.efectivoTotalNecesario);
  (document.getElementById("math-final") as HTMLElement).innerText = formatEuro(summary.gananciaNeta);
  (document.getElementById("kpi-retorno") as HTMLElement).innerText = formatEuro(summary.gananciaNeta);
  const roiDisplay = Number.isFinite(summary.roiAnualizado) ? (summary.roiAnualizado * 100).toFixed(2) + " %" : "0.00 %";
  (document.getElementById("kpi-roi") as HTMLElement).innerText = roiDisplay;
}

export function bindInputs(ids: string[], handler: () => void): void {
  for (const id of ids) {
    document.getElementById(`input-${id}`)!.addEventListener("input", handler);
  }
}
