import type { InputParams, YearData, PurchaseCosts, SummaryData } from "./types";
import { DEFAULT_PARAMS } from "./constants";

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
  setVal("afa", (p.afaPct * 100).toFixed(1));
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
  setText("val-afa", (params.afaPct * 100).toFixed(1));
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

export function renderTable(years: YearData[]): void {
  const tbody = document.getElementById("tabla-proyeccion-body") as HTMLElement;
  tbody.innerHTML = "";
  for (const y of years) {
    const row = document.createElement("tr");
    row.className = y.year % 2 === 0 ? "bg-white" : "bg-[#F9FAFB]";

    const warmTooltip = `
      <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 w-56 shadow-xl z-50 pointer-events-none space-y-1">
        <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Composición Renta Warm:</p>
        <div class="flex justify-between"><span>Alquiler Piso:</span><span>${formatEuro(y.mensualPiso)}</span></div>
        <div class="flex justify-between"><span>Alquiler Parking:</span><span>${formatEuro(y.mensualParking)}</span></div>
        <div class="flex justify-between"><span>Umlage (Hausgeld+Rückl.):</span><span>+${formatEuro(y.umlageMensual)}</span></div>
        <div class="text-[9px] text-gray-400 pt-0.5 italic">Aplicado factor de escala: x${y.factorSubida.toFixed(2)}</div>
      </div>`;

    const hipotecaTooltip = `
      <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 w-52 shadow-xl z-50 pointer-events-none space-y-1">
        <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Desglose Hipoteca:</p>
        <div class="flex justify-between"><span>Intereses (Zins):</span><span class="text-red-300">${formatEuro(y.interesesMensuales)}</span></div>
        <div class="flex justify-between"><span>Amortización (Tilgung):</span><span class="text-emerald-300">${formatEuro(y.amortizacionMensual)}</span></div>
      </div>`;

    const baseFiscalTooltip = `
      <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 w-64 shadow-xl z-50 pointer-events-none space-y-1">
        <p class="font-bold text-amber-300 border-b border-gray-700 pb-0.5">Base Fiscal Mensual:</p>
        <div class="text-gray-300">= Ingresos Warm − Intereses − AfA − Hausgeld</div>
        <div class="text-gray-300">= ${formatEuro(y.ingresoWarmMensual)} − ${formatEuro(y.interesesMensuales)} − AfA − 150</div>

        <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold"><span>Base Fiscal:</span><span class="text-amber-300">${formatEuro(y.resultadoFiscalMensual)}</span></div>
      </div>`;

    const ahorroTooltip = `
      <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 w-64 shadow-xl z-50 pointer-events-none space-y-1">
        <p class="font-bold text-emerald-300 border-b border-gray-700 pb-0.5">Cálculo Ahorro Fiscal:</p>
        <div class="text-gray-300">Si Base Fiscal < 0:</div>
        <div class="pl-2 text-gray-300">Ahorro = (−Base × 42% Tasa) / 12</div>
        <div class="flex justify-between border-t border-gray-700 pt-1 mt-1"><span>Ahorro Fiscal:</span><span class="text-emerald-300">+${formatEuro(y.devolucionFiscalMensual)}</span></div>
      </div>`;

    row.innerHTML = `
      <td class="text-center font-bold text-gray-500">${y.year}</td>
      <td class="font-semibold text-gray-900 relative group cursor-help">
        <div class="flex items-center gap-1">
          <span>${formatEuro(y.ingresoWarmMensual)}</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        ${warmTooltip}
      </td>
      <td class="text-gray-600">${formatEuro(y.cashflowPreTaxMensual)}</td>
      <td class="text-[#635BFF] font-mono relative group cursor-help">
        <div class="flex items-center gap-1">
          <span>${formatEuro(y.hipotecaMensual)}</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        ${hipotecaTooltip}
      </td>
      <td class="text-amber-700 bg-amber-50/40 font-medium relative group cursor-help">
        <div class="flex items-center gap-1">
          <span>${formatEuro(y.resultadoFiscalMensual)}</span>
          <svg class="w-3 h-3 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        ${baseFiscalTooltip}
      </td>
      <td class="text-emerald-700 bg-emerald-50/40 font-medium relative group cursor-help">
        <div class="flex items-center gap-1">
          <span>+${formatEuro(y.devolucionFiscalMensual)}</span>
          <svg class="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        ${ahorroTooltip}
      </td>
      <td class="bg-blue-50/60 text-[#635BFF] font-extrabold text-right pr-6">${formatEuro(y.cashflowNetoPostTaxMensual)}</td>
    `;
    tbody.appendChild(row);
  }
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
