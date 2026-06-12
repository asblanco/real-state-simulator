import type { InputParams, YearData, PurchaseCosts, SummaryData } from "./types";

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
    row.innerHTML = `
      <td class="text-center font-bold text-gray-500">${y.year}</td>
      <td class="font-semibold text-gray-900 relative group cursor-help">
        <div class="flex items-center gap-1">
          <span>${formatEuro(y.ingresoMensualTotal)}</span>
          <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <div class="absolute left-full top-1/2 -translate-y-1/2 ml-2 hidden group-hover:block bg-[#0A2540] text-white text-[11px] rounded-lg p-2.5 w-52 shadow-xl z-50 pointer-events-none space-y-1">
          <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">Composición de Renta:</p>
          <div class="flex justify-between"><span>Alquiler Piso:</span><span>${formatEuro(y.mensualPiso)}</span></div>
          <div class="flex justify-between"><span>Alquiler Parking:</span><span>${formatEuro(y.mensualParking)}</span></div>
          <div class="text-[9px] text-gray-400 pt-0.5 italic">Aplicado factor de escala: x${y.factorSubida.toFixed(2)}</div>
        </div>
      </td>
      <td class="text-gray-600">${formatEuro(y.cashflowPreTaxMensual * 12)}</td>
      <td class="text-red-500 font-mono">-${formatEuro(y.interesesAnuales)}</td>
      <td class="text-emerald-600 font-mono">+${formatEuro(y.amortizacionAnual)}</td>
      <td class="text-amber-700 bg-amber-50/40 font-medium">${formatEuro(y.resultadoFiscalAnual)}</td>
      <td class="text-emerald-700 bg-emerald-50/40 font-medium">+${formatEuro(y.devolucionFiscalMensual)}</td>
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
