<script lang="ts">
  import { params } from "$lib/stores/params";
  import { t } from "$lib/i18n";
  import { purchaseCosts, years, summary, roiColor, roaColor, afaAnual, totalIntereses, totalAmortizacion, totalAhorroFiscal, pctInteres, pctAmortizacion, yearlyWealth } from "$lib/stores/computed";
  import KpiCard from "$lib/components/KpiCard.svelte";
  import Chart from "$lib/components/Chart.svelte";
  import Tooltip from "$lib/components/Tooltip.svelte";
  import type { YearData } from "$lib/types";

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("de-DE") + " €";
  }



  function warmTooltip(y: YearData): string {
    return `
      <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${$t("tooltip.warm_titulo")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.warm_piso")}</span><span>${fmt(y.mensualPiso)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.warm_parking")}</span><span>${fmt(y.mensualParking)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.warm_umlage")}</span><span>+${fmt(y.umlageMensual)}</span></div>
      <div class="text-[9px] text-gray-400 pt-0.5 italic">${$t("tooltip.warm_factor")}${y.factorSubida.toFixed(2)}</div>
    `;
  }

  function hipotecaTooltip(y: YearData): string {
    return `
      <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${$t("tooltip.hipoteca_titulo")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.hipoteca_intereses")}</span><span class="text-red-300">${fmt(y.interesesMensuales)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.hipoteca_amortizacion")}</span><span class="text-emerald-300">${fmt(y.amortizacionMensual)}</span></div>
    `;
  }

  function cashflowTooltip(y: YearData): string {
    return `
      <p class="font-bold text-blue-300 border-b border-gray-700 pb-0.5">${$t("tooltip.cashflow_titulo")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.cashflow_renta")}</span><span class="text-green-300">+${fmt(y.ingresoWarmMensual)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.cashflow_hipoteca")}</span><span class="text-red-300">-${fmt(y.hipotecaMensual)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.cashflow_hausgeld")}</span><span class="text-red-300">-${$params.hausgeldTotal} €</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.cashflow_imprevistos")}</span><span class="text-red-300">-${$params.reservaImprevistos} €</span></div>
      <div class="border-t border-gray-700 pt-0.5 mt-0.5 flex justify-between font-bold"><span>${$t("tooltip.cashflow_resultado")}</span><span>${fmt(y.cashflowPreTaxMensual)}</span></div>
    `;
  }

  function fiscalTooltip(y: YearData): string {
    return `
      <p class="font-bold text-amber-300 border-b border-gray-700 pb-0.5">${$t("tooltip.fiscal_titulo")}</p>
      <div class="text-gray-300">${$t("tooltip.fiscal_formula")}</div>
      <div class="text-gray-300">= ${fmt(y.ingresoWarmMensual)} − ${fmt(y.interesesMensuales)} − ${fmt(y.afaMensual)} − ${$params.hausgeldTotal}</div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold"><span>${$t("tooltip.fiscal_resultado")}</span><span class="text-amber-300">${fmt(y.resultadoFiscalMensual)}</span></div>
    `;
  }

  const ahorroHeaderContent = `
    <p class="font-bold text-emerald-300 border-b border-gray-700 pb-0.5">${$t("tooltip.ahorro_titulo")}</p>
    <div class="text-gray-300">${$t("tooltip.ahorro_condicion")}</div>
    <div class="pl-2 text-gray-300">${$t("tooltip.ahorro_formula")}</div>
  `;
</script>

<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
  <KpiCard label={$t("kpi.precio_total")} value={fmt($params.precio + $params.parking)} />

  <KpiCard
    label={$t("kpi.costo_adquisicion")}
    value={fmt($purchaseCosts.efectivoTotalNecesario + $purchaseCosts.montoFinanciar)}
    tooltipContent={`
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-[#635BFF]">${$t("tooltip.desglose_costo")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.costo_precio")}</span><span class="font-mono">${fmt($params.precio + $params.parking)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.costo_itp")}</span><span class="font-mono">${fmt($purchaseCosts.costeITP)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.costo_notario")}</span><span class="font-mono">${fmt($purchaseCosts.costeNotario)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.costo_agencia")}</span><span class="font-mono">${fmt($purchaseCosts.costeAgencia)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>${$t("tooltip.costo_total")}</span><span class="font-mono">${fmt($purchaseCosts.efectivoTotalNecesario + $purchaseCosts.montoFinanciar)}</span></div>
    `}
  />

  <KpiCard
    label={$t("kpi.efectivo_inicial")}
    value={fmt($purchaseCosts.efectivoTotalNecesario)}
    tooltipContent={`
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-[#635BFF]">${$t("tooltip.desglose_fondos")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.entrada_pura")}</span><span class="font-mono">${fmt($purchaseCosts.capitalPropioEntrada)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.impuestos")}</span><span class="font-mono">${fmt($purchaseCosts.costeITP)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.notaria")}</span><span class="font-mono">${fmt($purchaseCosts.costeNotario)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.agencia")}</span><span class="font-mono">${fmt($purchaseCosts.costeAgencia)}</span></div>
    `}
  />

  <KpiCard
    label={$t("kpi.ganancia_neto")}
    value={fmt($summary.gananciaNeta)}
    valueClass="text-emerald-600"
    tooltipContent={`
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-emerald-400">${$t("tooltip.desglose_ganancia")}</p>
      <div class="flex justify-between"><span>${$t("tooltip.valor_venta")}:</span><span class="font-mono">${fmt($summary.valorPropiedadFutura)}</span></div>
      <div class="flex justify-between"><span>− ${$t("math.deuda_hipoteca")}:</span><span class="font-mono text-red-300">−${fmt($summary.deudaRestanteFinal)}</span></div>
      <div class="flex justify-between font-medium border-b border-gray-800 pb-1"><span>= ${$t("tooltip.neto_venta")}:</span><span class="font-mono">${fmt($summary.netoDeLaVenta)}</span></div>
      <div class="flex justify-between"><span>− ${$t("tooltip.menos_efectivo")}:</span><span class="font-mono text-red-300">−${fmt($purchaseCosts.efectivoTotalNecesario)}</span></div>
      <div class="flex justify-between"><span>= ${$t("tooltip.ganancia_venta")}:</span><span class="font-mono">${fmt($summary.gananciaVenta)}</span></div>
      <div class="flex justify-between"><span>${$t("tooltip.mas_cashflow")}:</span><span class="font-mono ${$summary.totalCashflowAcumulado >= 0 ? 'text-green-300' : 'text-red-300'}">${$summary.totalCashflowAcumulado >= 0 ? '+' : ''}${fmt($summary.totalCashflowAcumulado)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>${$t("tooltip.resultado_final")}:</span><span class="font-mono">${fmt($summary.gananciaNeta)}</span></div>
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 mt-2 text-amber-400">${$t("tooltip.referencia_fiscal")}</p>
      <div class="flex justify-between"><span>${$t("kpi.costo_adquisicion")}:</span><span class="font-mono">${fmt($summary.costoAdquisicionTotal)}</span></div>
      <div class="flex justify-between"><span>− ${$t("math.afa_acumulada")}:</span><span class="font-mono text-red-300">−${fmt($summary.afaAcumulada)}</span></div>
      <div class="flex justify-between"><span>= ${$t("tooltip.base_costo")}:</span><span class="font-mono">${fmt($summary.costoAdquisicionTotal - $summary.afaAcumulada)}</span></div>
      <div class="flex justify-between font-bold text-amber-300"><span>${$t("tooltip.ganancia_fiscal")}:</span><span class="font-mono">${fmt($summary.gananciaFiscal)}</span></div>
    `}
  />

  <div class="{$roiColor} p-5 rounded-2xl text-white shadow-xs relative group cursor-help">
    <p class="text-xs font-bold text-blue-100 uppercase tracking-wider">{$t("kpi.roi")}</p>
    <p class="text-xl font-black mt-1">
      <span>{Number.isFinite($summary.roiAnualizado) ? ($summary.roiAnualizado * 100).toFixed(2) + " %" : "0.00 %"}</span>
      <span class="font-normal text-blue-200/70"> | {($summary.roiCapitalPropioTotal * 100).toFixed(2)} % total</span>
    </p>
    <div class="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-xl p-4 w-72 shadow-xl z-50 pointer-events-none leading-relaxed">
      <p class="font-bold text-[#635BFF] mb-1">{$t("tooltip.roe_titulo")}</p>
      <div class="flex justify-between"><span>{$t("kpi.ganancia_neto")}:</span><span class="font-mono">{fmt($summary.gananciaNeta)}</span></div>
      <div class="flex justify-between"><span>÷ {$t("kpi.efectivo_inicial")}:</span><span class="font-mono">{fmt($purchaseCosts.efectivoTotalNecesario)}</span></div>
      <div class="flex justify-between font-bold text-sky-300"><span>{$t("tooltip.roe_total")}</span><span class="font-mono">{($summary.roiCapitalPropioTotal * 100).toFixed(2)} %</span></div>
      <div class="flex justify-between font-bold text-sky-300"><span>{$t("tooltip.roe_cagr")}</span><span class="font-mono">{($summary.roiAnualizado * 100).toFixed(2)} %</span></div>
      <div class="border-t border-gray-700 pt-2 mt-2 space-y-1">
        <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Leyenda ROI</p>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0"></span>{$t("tooltip.roi_bajo")} <span class="text-gray-400">&lt; 5%</span></div>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>{$t("tooltip.roi_aceptable")} <span class="text-gray-400">5% – 10%</span></div>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>{$t("tooltip.roi_excelente")} <span class="text-gray-400">≥ 10%</span></div>
      </div>
      <div class="border-t border-gray-700 pt-2 mt-2">
        <div class="flex justify-between"><span>{$t("tooltip.apalancamiento")}:</span><span class="font-mono text-emerald-300">{$summary.apalancamiento.toFixed(2)}x</span></div>
        <div class="text-[10px] text-gray-400 italic mt-1">{$t("tooltip.apalancamiento_desc")}</div>
      </div>
    </div>
  </div>

  <div class="{$roaColor} p-5 rounded-2xl text-white shadow-xs relative group cursor-help">
    <p class="text-xs font-bold text-blue-100 uppercase tracking-wider">{$t("kpi.roi_proyecto")}</p>
    <p class="text-xl font-black mt-1">
      <span>{Number.isFinite($summary.roiProyectoAnualizado) ? ($summary.roiProyectoAnualizado * 100).toFixed(2) + " %" : "0.00 %"}</span>
      <span class="font-normal text-blue-200/70"> | {($summary.roiProyectoTotal * 100).toFixed(2)} % total</span>
    </p>
    <div class="absolute right-0 top-full mt-2 hidden group-hover:block bg-gray-900 text-white text-xs rounded-xl p-4 w-72 shadow-xl z-50 pointer-events-none leading-relaxed">
      <p class="font-bold text-sky-300 mb-1">{$t("tooltip.roa_titulo")}</p>
      <div class="flex justify-between"><span>{$t("tooltip.valor_venta")}:</span><span class="font-mono">{fmt($summary.valorPropiedadFutura)}</span></div>
      <div class="flex justify-between"><span>− ({$t("kpi.costo_adquisicion")} − {$t("math.afa_acumulada")}):</span><span class="font-mono text-red-300">−{fmt($summary.costoAdquisicionTotal - $summary.afaAcumulada)}</span></div>
      <div class="flex justify-between font-medium border-b border-gray-800 pb-1"><span>= {$t("tooltip.ganancia_fiscal")}:</span><span class="font-mono">{fmt($summary.gananciaFiscal)}</span></div>
      <div class="flex justify-between"><span>÷ {$t("kpi.costo_adquisicion")}:</span><span class="font-mono">{fmt($summary.costoAdquisicionTotal)}</span></div>
      <div class="flex justify-between font-bold text-sky-300"><span>{$t("tooltip.roa_total")}</span><span class="font-mono">{($summary.roiProyectoTotal * 100).toFixed(2)} %</span></div>
      <div class="flex justify-between font-bold text-sky-300"><span>{$t("tooltip.roa_cagr")}</span><span class="font-mono">{($summary.roiProyectoAnualizado * 100).toFixed(2)} %</span></div>
      <div class="border-t border-gray-700 pt-2 mt-2 space-y-1">
        <p class="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Leyenda ROA</p>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-red-600 shrink-0"></span>{$t("tooltip.roi_bajo")} <span class="text-gray-400">&lt; 2,5%</span></div>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-sky-600 shrink-0"></span>{$t("tooltip.roi_aceptable")} <span class="text-gray-400">2,5% – 5%</span></div>
        <div class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>{$t("tooltip.roi_excelente")} <span class="text-gray-400">≥ 5%</span></div>
      </div>
      <div class="text-[10px] text-gray-400 italic mt-2 pt-1 border-t border-gray-700">{$t("tooltip.roa_desc")}</div>
    </div>
  </div>
</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-80">
    <Chart
      type="line"
      labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
      datasets={[{
        label: $t("chart.rental_label"),
        data: $years.map(y => Math.round(y.ingresoWarmMensual)),
        borderColor: "#0A2540",
        tension: 0,
        borderWidth: 2.5,
        pointBackgroundColor: "#0A2540",
      }]}
      title={$t("chart.rental_title")}
    />
  </div>
  <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-80">
    <Chart
      type="bar"
      labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
      datasets={[{
        label: $t("chart.cashflow_label"),
        data: $years.map(y => Math.round(y.cashflowNetoPostTaxMensual)),
        backgroundColor: (ctx: any) => (ctx.parsed?.y ?? 0) >= 0 ? "#22c55e" : "#f97316",
        borderRadius: 4,
      }]}
      title={$t("chart.cashflow_title")}
    />
  </div>
</div>

<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-80">
  <Chart
    type="line"
    labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
    datasets={[
      {
        label: "Patrimonio Total (si vendieras)",
        data: $yearlyWealth.map(w => w.totalWealth),
        borderColor: "rgb(99, 91, 255)",
        borderWidth: 2.5,
        fill: false,
        pointRadius: 3,
      },
      {
        label: $t("chart.equity_label_equity"),
        data: $years.map((y, i) => {
          const pv = ($params.precio + $params.parking) * (1 + $params.inflacionPct) ** y.year;
          return Math.round(pv - y.deudaRestante);
        }),
        backgroundColor: "rgba(99, 91, 255, 0.15)",
        borderColor: "rgb(99, 91, 255)",
        borderWidth: 1.5,
        fill: false,
        pointRadius: 2,
        borderDash: [5, 5],
      },
      {
        label: $t("chart.equity_label_deuda"),
        data: $years.map(y => Math.round(y.deudaRestante)),
        backgroundColor: "rgba(239, 68, 68, 0.15)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1.5,
        fill: false,
        pointRadius: 2,
        borderDash: [3, 3],
      },
    ]}
    title="Evolución Patrimonial Anual"
  />
</div>

<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
  <h3 class="text-base font-bold text-[#0A2540] mb-2">{$t("section.desglose_titulo")}</h3>
  <p class="text-xs text-gray-400 mb-4">{$t("section.desglose_subtitulo")}</p>
  <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.valor_venta")}</span>
      <span class="text-base font-extrabold text-gray-800 block mt-0.5">{fmt($summary.valorPropiedadFutura)}</span>
    </div>
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.deuda_hipoteca")}</span>
      <span class="text-base font-extrabold text-gray-800 block mt-0.5">{fmt($summary.deudaRestanteFinal)}</span>
    </div>
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.costo_adquisicion")}</span>
      <span class="text-base font-extrabold text-gray-800 block mt-0.5">{fmt($summary.costoAdquisicionTotal)}</span>
    </div>
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.afa_acumulada")}</span>
      <span class="text-base font-extrabold text-gray-800 block mt-0.5">{fmt($summary.afaAcumulada)}</span>
    </div>
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.recuperacion_inversion")}</span>
      <span class="text-base font-extrabold text-gray-800 block mt-0.5">{fmt($summary.totalCashflowAcumulado)}</span>
    </div>
    <div class="p-3 bg-gray-50 border border-gray-100 rounded-xl">
      <span class="text-[10px] font-bold text-gray-400 uppercase block tracking-wide">{$t("math.cashflow_venta")}</span>
      <span class="text-base font-extrabold {($summary.gananciaNeta) >= 0 ? 'text-emerald-700' : 'text-red-700'} block mt-0.5">{fmt($summary.gananciaNeta)}</span>
    </div>
  </div>
</div>

<div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
  <div class="p-6 border-b border-gray-100 bg-white">
    <h3 class="text-lg font-bold text-[#0A2540] flex items-center justify-between">
      <span>{$t("section.tabla_titulo")}</span>
      <label class="flex items-center gap-2 text-xs font-normal cursor-pointer select-none">
        <span class="{$params.useFlatRate ? 'text-gray-500' : 'text-gray-700 font-medium'}">{$t("toggle.compuesto")}</span>
        <div class="relative">
          <input type="checkbox" class="sr-only peer" checked={$params.useFlatRate}
            onchange={() => $params = { ...$params, useFlatRate: !$params.useFlatRate }} />
          <div class="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-[#635BFF] transition-colors"></div>
          <div class="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 pointer-events-none"></div>
        </div>
        <span class="{$params.useFlatRate ? 'text-gray-700 font-medium' : 'text-gray-500'}">{$t("toggle.lineal")}</span>
      </label>
    </h3>
    <p class="text-xs text-gray-400 mt-0.5">{$t("section.tabla_subtitulo")}</p>
  </div>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse fin-table">
      <thead>
        <tr>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200 w-12">{$t("table.anno")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.alquiler_warm")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.hipoteca")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.cashflow_bruto")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.base_fiscal")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">
            <Tooltip content={ahorroHeaderContent}>
              <span>{$t("table.ahorro_fiscal")}</span>
              <svg class="w-3 h-3 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </Tooltip>
          </th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.neto_posttax")}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        {#each $years as y, i}
          <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-gray-100 transition-colors">
            <td class="text-center font-bold text-gray-500 text-sm py-3 px-2.5">{y.year}</td>
            <td class="text-center font-semibold text-sm py-3 px-2.5">
              <Tooltip content={warmTooltip(y)}>
                {fmt(y.ingresoWarmMensual)}
                <svg class="w-3 h-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </Tooltip>
            </td>
            <td class="text-center text-amber-700 bg-amber-50/40 font-medium text-sm py-3 px-2.5">
              <Tooltip content={hipotecaTooltip(y)}>
                {fmt(-y.hipotecaMensual)}
                <svg class="w-3 h-3 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </Tooltip>
            </td>
            <td class="text-center text-gray-600 text-sm py-3 px-2.5">
              <Tooltip content={cashflowTooltip(y)}>
                {fmt(y.cashflowPreTaxMensual)}
                <svg class="w-3 h-3 shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </Tooltip>
            </td>
            <td class="text-center text-[#635BFF] font-mono text-sm py-3 px-2.5">
              <Tooltip content={fiscalTooltip(y)}>
                {fmt(y.resultadoFiscalMensual)}
                <svg class="w-3 h-3 shrink-0 text-[#635BFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </Tooltip>
            </td>
            <td class="text-center text-emerald-700 bg-emerald-50/40 font-medium text-sm py-3 px-2.5">+{fmt(y.devolucionFiscalMensual)}</td>
            <td class="text-center bg-blue-50/60 font-extrabold text-sm py-3 px-2.5 {y.cashflowNetoPostTaxMensual >= 0 ? 'text-green-600' : 'text-orange-600'}">{fmt(y.cashflowNetoPostTaxMensual)}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>

<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Préstamo Total</p>
    <p class="text-xl font-black text-[#0A2540] mt-1">{fmt($purchaseCosts.montoFinanciar)}</p>
  </div>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Cuota Mensual Fija</p>
    <p class="text-xl font-black text-[#0A2540] mt-1">{fmt($purchaseCosts.cuotaMensualHipoteca)}</p>
  </div>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Deuda Restante Final</p>
    <p class="text-xl font-black text-orange-600 mt-1">{fmt($years[$years.length - 1].deudaRestante)}</p>
  </div>
</div>

<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Intereses vs Amortización (Total Período)</p>
  <div class="flex items-center gap-4 h-8 mb-2">
    <div class="h-full rounded-lg bg-red-400" style="width: {$pctInteres}%"></div>
    <div class="h-full rounded-lg bg-emerald-400" style="width: {$pctAmortizacion}%"></div>
  </div>
  <div class="flex justify-between text-xs text-gray-500">
    <span>Intereses: {fmt($totalIntereses)} ({$pctInteres.toFixed(1)}%)</span>
    <span>Amortización: {fmt($totalAmortizacion)} ({$pctAmortizacion.toFixed(1)}%)</span>
  </div>
</div>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">AfA Anual</p>
    <p class="text-xl font-black text-[#0A2540] mt-1">{fmt($afaAnual)}</p>
  </div>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">AfA Acumulada</p>
    <p class="text-xl font-black text-[#0A2540] mt-1">{fmt($summary.afaAcumulada)}</p>
  </div>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Ahorro Fiscal Total</p>
    <p class="text-xl font-black text-emerald-600 mt-1">{fmt($totalAhorroFiscal)}</p>
  </div>
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Base Costo Fiscal</p>
    <p class="text-xl font-black text-amber-600 mt-1">{fmt($summary.costoAdquisicionTotal - $summary.afaAcumulada)}</p>
  </div>
</div>

<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
  <h3 class="text-base font-bold text-[#0A2540] mb-4">Evolución Año a Año</h3>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse fin-table">
      <thead>
        <tr>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("table.anno")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">Valor Propiedad</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">Deuda</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">Equity Neto</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">Cashflow Acum.</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">Patrimonio Total</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">ROI Anual</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        {#each $yearlyWealth as w, i}
          {@const roi = (w.totalWealth / $purchaseCosts.efectivoTotalNecesario) ** (1 / w.year) - 1}
          <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}">
            <td class="text-center font-bold text-gray-500 text-sm py-3 px-2.5">{w.year}</td>
            <td class="text-center text-sm py-3 px-2.5">{fmt(w.propertyValue)}</td>
            <td class="text-center text-rose-600 text-sm py-3 px-2.5">{fmt(w.debt)}</td>
            <td class="text-center font-medium text-sm py-3 px-2.5 text-[#635BFF]">{fmt(w.equity)}</td>
            <td class="text-center text-sm py-3 px-2.5 {w.accumulatedCash >= 0 ? 'text-emerald-600' : 'text-orange-600'}">{fmt(w.accumulatedCash)}</td>
            <td class="text-center font-extrabold text-sm py-3 px-2.5">{fmt(w.totalWealth)}</td>
            <td class="text-center font-mono text-sm py-3 px-2.5">{(roi * 100).toFixed(2)}%</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
