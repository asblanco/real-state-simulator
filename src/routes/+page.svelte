<script lang="ts">
  import { params } from "$lib/stores/params";
  import { t } from "$lib/i18n";
  import { purchaseCosts, years, summary, roiColor, roaColor, yearlyWealth } from "$lib/stores/computed";
  import KpiCard from "$lib/components/KpiCard.svelte";
  import TooltipTd from "$lib/components/TooltipTd.svelte";
  import Chart from "$lib/components/Chart.svelte";

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("de-DE") + " €";
  }

  function pct(n: number): string {
    return (n * 100).toFixed(2) + "%";
  }

  function pctDisplay(annual: number, total: number): string {
    return (annual * 100).toFixed(2) + " % | " + (total * 100).toFixed(2) + " % total";
  }

  // Pre-compute tooltip HTML via $derived for reactive consistency
  let costoAdqTooltip = $derived(htmlCostoAdq($params, $purchaseCosts));
  let inversionInicialTooltip = $derived(htmlInversionInicial($params, $purchaseCosts));
  let gananciaNetaTooltip = $derived(htmlGananciaNeta($summary, $purchaseCosts));
  let roeTooltip = $derived(htmlRoeTooltip($summary, $purchaseCosts, $params));
  let roaTooltip = $derived(htmlRoaTooltip($summary, $purchaseCosts));

  function htmlCostoAdq(p: { precio: number; parking: number }, pc: { costeITP: number; costeNotario: number; costeAgencia: number; efectivoTotalNecesario: number; montoFinanciar: number }): string {
    return `
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-[#635BFF]">Desglose Costo Adquisición</p>
      <div class="flex justify-between"><span>Precio compra:</span><span class="font-mono">${fmt(p.precio + p.parking)}</span></div>
      <div class="flex justify-between"><span>ITP (3,5%):</span><span class="font-mono">${fmt(pc.costeITP)}</span></div>
      <div class="flex justify-between"><span>Notaría (2%):</span><span class="font-mono">${fmt(pc.costeNotario)}</span></div>
      <div class="flex justify-between"><span>Agencia (3,57%):</span><span class="font-mono">${fmt(pc.costeAgencia)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>Total:</span><span class="font-mono">${fmt(pc.efectivoTotalNecesario + pc.montoFinanciar)}</span></div>
    `;
  }

  function htmlInversionInicial(p: { entradaPct: number }, pc: { capitalPropioEntrada: number; costeITP: number; costeNotario: number; costeAgencia: number; efectivoTotalNecesario: number }): string {
    return `
      <p class="font-bold border-b border-gray-700 pb-1 mb-1 text-[#635BFF]">Desglose Inversión Inicial</p>
      <div class="flex justify-between"><span>Entrada (${(p.entradaPct * 100).toFixed(0)}%):</span><span class="font-mono">${fmt(pc.capitalPropioEntrada)}</span></div>
      <div class="flex justify-between"><span>ITP (3,5%):</span><span class="font-mono">${fmt(pc.costeITP)}</span></div>
      <div class="flex justify-between"><span>Notaría (2%):</span><span class="font-mono">${fmt(pc.costeNotario)}</span></div>
      <div class="flex justify-between"><span>Agencia (3,57%):</span><span class="font-mono">${fmt(pc.costeAgencia)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>Total efectivo:</span><span class="font-mono">${fmt(pc.efectivoTotalNecesario)}</span></div>
    `;
  }

  function htmlGananciaNeta(s: { valorPropiedadFutura: number; deudaRestanteFinal: number; netoDeLaVenta: number; totalCashflowAcumulado: number; gananciaNeta: number }, pc: { efectivoTotalNecesario: number }): string {
    const cfColor = s.totalCashflowAcumulado >= 0 ? "text-green-300" : "text-red-300";
    const cfSign = s.totalCashflowAcumulado >= 0 ? "+" : "";
    return `
      <p class="font-bold text-emerald-400 border-b border-gray-700 pb-1 mb-1">Desglose Ganancia Neta</p>
      <div class="flex justify-between"><span>Valor venta futuro:</span><span class="font-mono">${fmt(s.valorPropiedadFutura)}</span></div>
      <div class="flex justify-between"><span>− Deuda restante:</span><span class="font-mono text-red-300">−${fmt(s.deudaRestanteFinal)}</span></div>
      <div class="flex justify-between border-b border-gray-800 pb-1"><span>= Neto de venta:</span><span class="font-mono">${fmt(s.netoDeLaVenta)}</span></div>
      <div class="flex justify-between"><span>+ Cashflow acumulado:</span><span class="font-mono ${cfColor}">${cfSign}${fmt(s.totalCashflowAcumulado)}</span></div>
      <div class="flex justify-between"><span>− Inversión inicial:</span><span class="font-mono text-red-300">−${fmt(pc.efectivoTotalNecesario)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-emerald-400"><span>= Ganancia neta:</span><span class="font-mono">${fmt(s.gananciaNeta)}</span></div>
    `;
  }

  function htmlRoeTooltip(s: { capitalTotalFinal: number; totalCapitalAportado: number; roiAnualizado: number; roiCapitalPropioTotal: number; roiProyectoAnualizado: number; apalancamiento: number }, pc: { efectivoTotalNecesario: number }, p: { years: number }): string {
    const extraAportes = s.totalCapitalAportado - pc.efectivoTotalNecesario;
    return `
      <p class="font-bold text-sky-300 mb-1">Cálculo del ROE</p>
      <div class="flex justify-between"><span>Capital final:</span><span class="font-mono">${fmt(s.capitalTotalFinal)}</span></div>
      <div class="flex justify-between"><span>÷ Capital total aportado:</span><span class="font-mono">${fmt(s.totalCapitalAportado)}</span></div>
      <div class="text-[10px] text-gray-400 ml-3 mb-1">Inversión inicial: ${fmt(pc.efectivoTotalNecesario)}${extraAportes > 0 ? ` + ${fmt(extraAportes)} en aportes extra por cashflow negativo` : ''}</div>
      <div class="flex justify-between"><span>^(1/${p.years}) − 1</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-sky-300"><span>ROE anualizado:</span><span class="font-mono">${pct(s.roiAnualizado)}</span></div>
      <div class="flex justify-between"><span>ROE total:</span><span class="font-mono">${pct(s.roiCapitalPropioTotal)}</span></div>
      <div class="flex justify-between"><span>ROA anualizado:</span><span class="font-mono">${pct(s.roiProyectoAnualizado)}</span></div>
      <div class="flex justify-between"><span>Apalancamiento:</span><span class="font-mono text-emerald-300">${s.apalancamiento.toFixed(2)}x</span></div>
      <div class="border-t border-gray-700 pt-2 mt-2 text-[10px] space-y-0.5">
        <p class="text-gray-400 font-bold mb-0.5">Referencia ROE:</p>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-600 inline-block"></span><span class="text-gray-400">&lt; 5% — Rendimiento bajo</span></div>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-600 inline-block"></span><span class="text-gray-400">5–10% — Rendimiento aceptable</span></div>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span><span class="text-gray-400">≥ 10% — Rendimiento excelente</span></div>
      </div>
    `;
  }

  function htmlRoaTooltip(s: { gananciaFiscal: number; costoAdquisicionTotal: number; roiProyectoTotal: number; roiProyectoAnualizado: number }, pc: { efectivoTotalNecesario: number }): string {
    return `
      <p class="font-bold text-sky-300 mb-1">Cálculo del ROA</p>
      <div class="flex justify-between"><span>Ganancia fiscal:</span><span class="font-mono">${fmt(s.gananciaFiscal)}</span></div>
      <div class="flex justify-between"><span>÷ Costo adquisición:</span><span class="font-mono">${fmt(s.costoAdquisicionTotal)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-sky-300"><span>ROA total:</span><span class="font-mono">${pct(s.roiProyectoTotal)}</span></div>
      <div class="flex justify-between"><span>ROA anualizado:</span><span class="font-mono">${pct(s.roiProyectoAnualizado)}</span></div>
      <div class="text-[10px] text-gray-400 italic mt-2 pt-1 border-t border-gray-700">ROA mide la rentabilidad del proyecto sin apalancamiento</div>
      <div class="border-t border-gray-700 pt-2 mt-2 text-[10px] space-y-0.5">
        <p class="text-gray-400 font-bold mb-0.5">Referencia ROA:</p>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-red-600 inline-block"></span><span class="text-gray-400">&lt; 2.5% — Rendimiento bajo</span></div>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-sky-600 inline-block"></span><span class="text-gray-400">2.5–5% — Rendimiento aceptable</span></div>
        <div class="flex items-center gap-1.5"><span class="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span><span class="text-gray-400">≥ 5% — Rendimiento excelente</span></div>
      </div>
    `;
  }

  function htmlWarmTooltip(y: { mensualPiso: number; mensualParking: number; umlageMensual: number; hausgeldMensual: number; ingresoWarmMensual: number }): string {
    return `
      <p class="font-bold text-sky-300 mb-1">Composición Alquiler Total</p>
      <div class="flex justify-between"><span>Alquiler Piso:</span><span class="font-mono">${fmt(y.mensualPiso)}</span></div>
      <div class="flex justify-between"><span>Alquiler Parking:</span><span class="font-mono">${fmt(y.mensualParking)}</span></div>
      <div class="flex justify-between"><span>Umlage (60% × ${fmt(y.hausgeldMensual)}):</span><span class="font-mono">${fmt(y.umlageMensual)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-sky-300"><span>Total:</span><span class="font-mono">${fmt(y.ingresoWarmMensual)}</span></div>
    `;
  }

  function htmlHipotecaTooltip(y: { interesesMensuales: number; amortizacionMensual: number; hipotecaMensual: number }): string {
    return `
      <p class="font-bold text-sky-300 mb-1">Desglose Hipoteca</p>
      <div class="flex justify-between"><span>Intereses (Zins):</span><span class="font-mono">${fmt(y.interesesMensuales)}</span></div>
      <div class="flex justify-between"><span>Amortización (Tilgung):</span><span class="font-mono">${fmt(y.amortizacionMensual)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-sky-300"><span>Total:</span><span class="font-mono">${fmt(y.hipotecaMensual)}</span></div>
    `;
  }

  function htmlCashflowTooltip(y: { ingresoWarmMensual: number; hipotecaMensual: number; cashflowPreTaxMensual: number; hausgeldMensual: number }, p: { reservaImprevistos: number }): string {
    return `
      <p class="font-bold text-sky-300 mb-1">Cálculo Cashflow Bruto</p>
      <div class="flex justify-between"><span>Renta Warm:</span><span class="font-mono">${fmt(y.ingresoWarmMensual)}</span></div>
      <div class="flex justify-between"><span>− Hipoteca:</span><span class="font-mono text-red-300">−${fmt(y.hipotecaMensual)}</span></div>
      <div class="flex justify-between"><span>− Hausgeld:</span><span class="font-mono text-red-300">−${fmt(y.hausgeldMensual)}</span></div>
      <div class="flex justify-between"><span>− Imprevistos:</span><span class="font-mono text-red-300">−${fmt(p.reservaImprevistos)}</span></div>
      <div class="border-t border-gray-700 pt-1 mt-1 flex justify-between font-bold text-sky-300"><span>= Cashflow Bruto:</span><span class="font-mono">${fmt(y.cashflowPreTaxMensual)}</span></div>
    `;
  }

  function htmlFiscalTooltip(y: { ingresoWarmMensual: number; interesesMensuales: number; devolucionFiscalMensual: number; hausgeldMensual: number }, p: { precio: number; afaYears: number }): string {
    const monthlyAfa = Math.round(p.precio * 0.75 * (1 / p.afaYears) / 12);
    const baseFiscal = y.ingresoWarmMensual - y.interesesMensuales - monthlyAfa - y.hausgeldMensual;
    const ahorroAnual = -baseFiscal * 0.42;
    const ahorroMensual = Math.round(ahorroAnual / 12);
    return `
      <p class="font-bold text-sky-300 mb-1">Base Fiscal Mensual</p>
      <div class="text-[10px] text-gray-400 italic mb-1">= Ingresos Warm − Intereses − AfA − Hausgeld</div>
      <div class="flex justify-between"><span>Ingreso Warm:</span><span class="font-mono">${fmt(y.ingresoWarmMensual)}</span></div>
      <div class="flex justify-between"><span>− Intereses:</span><span class="font-mono text-red-300">−${fmt(y.interesesMensuales)}</span></div>
      <div class="flex justify-between"><span>− AfA (${p.afaYears}a):</span><span class="font-mono text-red-300">−${fmt(monthlyAfa)}</span></div>
      <div class="flex justify-between"><span>− Hausgeld:</span><span class="font-mono text-red-300">−${fmt(y.hausgeldMensual)}</span></div>
      <div class="flex justify-between border-b border-gray-700 pb-1 ${baseFiscal < 0 ? 'font-bold text-orange-300' : ''}"><span>= Base:</span><span class="font-mono">${fmt(baseFiscal)}</span></div>
      ${baseFiscal < 0 ? `
        <div class="pt-1">
          <p class="font-bold text-emerald-300 mb-1">Ahorro Fiscal</p>
          <div class="text-[10px] text-gray-400 italic mb-1">= (−Base × 42%) / 12</div>
          <div class="flex justify-between"><span>−Base:</span><span class="font-mono">${fmt(-baseFiscal)}</span></div>
          <div class="flex justify-between"><span>×42% anual:</span><span class="font-mono">${fmt(ahorroAnual)}</span></div>
          <div class="flex justify-between font-bold text-emerald-300"><span>/12 mensual:</span><span class="font-mono">${fmt(ahorroMensual)}</span></div>
          <div class="flex justify-between"><span>(coincide con celda):</span><span class="font-mono">${fmt(y.devolucionFiscalMensual)}</span></div>
        </div>
      ` : `
        <div class="pt-1 text-[10px] text-gray-400 italic">Base fiscal positiva — no hay ahorro</div>
      `}
    `;
  }

  let chartMode = $state<"cashflow" | "capital">("cashflow");

  let keyYears = $derived.by(() => {
    const all = $yearlyWealth;
    const indices = new Set<number>();
    indices.add(0);
    if (all.length > 4) indices.add(4);
    if (all.length > 9) indices.add(9);
    if (all.length > 14) indices.add(14);
    if (all.length > 19) indices.add(19);
    if (all.length > 24) indices.add(24);
    indices.add(all.length - 1);
    return [...indices].sort((a, b) => a - b).map(i => all[i]);
  });

</script>

<div class="space-y-6">
  <!-- HERO KPIs -->
  <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
    <KpiCard id="kpi-precio-total" label={$t("kpi.precio_total")} value={fmt($params.precio + $params.parking)} />
    <KpiCard id="kpi-costo-adquisicion" label={$t("kpi.costo_adquisicion")} value={fmt($purchaseCosts.efectivoTotalNecesario + $purchaseCosts.montoFinanciar)} tooltipContent={costoAdqTooltip} />
    <KpiCard id="kpi-efectivo-inicial" label={$t("kpi.efectivo_inicial")} value={fmt($purchaseCosts.efectivoTotalNecesario)} tooltipContent={inversionInicialTooltip} />
    <KpiCard id="kpi-ganancia-neta" label={$t("kpi.ganancia_neto")} value={fmt($summary.gananciaNeta)} tooltipContent={gananciaNetaTooltip} />
    <KpiCard id="kpi-roe" label="ROE" value={Number.isFinite($summary.roiAnualizado) ? pctDisplay($summary.roiAnualizado, $summary.roiCapitalPropioTotal) : "—"} bgClass={$roiColor} valueClass="text-white" labelClass="text-blue-100" tooltipContent={roeTooltip} />
    <KpiCard id="kpi-roa" label="ROA" value={Number.isFinite($summary.roiProyectoAnualizado) ? pctDisplay($summary.roiProyectoAnualizado, $summary.roiProyectoTotal) : "—"} bgClass={$roaColor} valueClass="text-white" labelClass="text-blue-100" tooltipContent={roaTooltip} />
  </div>

  <!-- CASHFLOW / CAPITAL APORTADO TOGGLE + CHART -->
  <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-bold text-[#0A2540]">
        {chartMode === "cashflow" ? $t("chart.cashflow_title") : "Cashflow Neto Anual Acumulado"}
      </h3>
      <div class="flex gap-1 bg-gray-100 p-1 rounded-xl">
        <button
          class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors {chartMode === 'cashflow' ? 'bg-white shadow-sm text-[#635BFF]' : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => chartMode = "cashflow"}>Mensual</button>
        <button
          class="px-3 py-1.5 text-xs font-bold rounded-lg transition-colors {chartMode === 'capital' ? 'bg-white shadow-sm text-[#635BFF]' : 'text-gray-500 hover:text-gray-700'}"
          onclick={() => chartMode = "capital"}>Anual</button>
      </div>
    </div>
    <div class="h-64">
      {#if chartMode === "cashflow"}
        <Chart
          id="chart-cashflow"
          type="bar"
          labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
          datasets={[{
            label: $t("chart.cashflow_label"),
            data: $years.map(y => Math.round(y.cashflowNetoPostTaxMensual)),
            backgroundColor: (ctx: any) => (ctx.parsed?.y ?? 0) >= 0 ? "#22c55e" : "#f97316",
            borderRadius: 4,
          }]}
        />
      {:else}
        <Chart
          id="chart-cashflow-anual"
          type="line"
          labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
          datasets={[{
            label: "Cashflow acumulado",
            data: $yearlyWealth.map(w => w.accumulatedCash),
            borderColor: "#635BFF",
            backgroundColor: "rgba(99, 91, 255, 0.1)",
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 4,
            fill: true,
          }]}
          showValues
        />
      {/if}
    </div>
  </div>

  <!-- WEALTH EVOLUTION -->
  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div class="lg:col-span-2 bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-80">
      <Chart
        id="chart-wealth"
        type="line"
        labels={$years.map(y => $t("chart.axis_prefix") + y.year)}
        datasets={[
          {
            label: "Valor Propiedad",
            data: $years.map((y, i) => {
              const pv = ($params.precio + $params.parking) * (1 + $params.inflacionPct) ** y.year;
              return Math.round(pv);
            }),
            borderColor: "#0A2540",
            borderWidth: 2.5,
            tension: 0,
            pointRadius: 2,
            fill: false,
          },
          {
            label: "Equity Neto",
            data: $yearlyWealth.map(w => w.equity),
            backgroundColor: "rgba(16, 185, 129, 0.2)",
            borderColor: "rgb(16, 185, 129)",
            borderWidth: 2,
            tension: 0,
            pointRadius: 2,
            fill: true,
          },
          {
            label: "Deuda Restante",
            data: $years.map(y => Math.round(y.deudaRestante)),
            borderColor: "rgb(239, 68, 68)",
            borderWidth: 1.5,
            tension: 0,
            pointRadius: 2,
            borderDash: [4, 3],
            fill: false,
          },
        ]}
        title="Evolución Patrimonial"
      />
    </div>

    <!-- COMPACT WEALTH TABLE -->
    <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Evolución años clave</p>
      <div class="overflow-x-auto">
        <table class="w-full fin-table text-xs">
          <thead>
            <tr>
              <th class="text-center">Año</th>
              <th class="text-center">Valor</th>
              <th class="text-center">Deuda</th>
              <th class="text-center">Equity</th>
              <th class="text-center">ROI</th>
            </tr>
          </thead>
          <tbody id="tabla-evolucion-body">
            {#each keyYears as w}
              {@const roi = (w.totalWealth / $purchaseCosts.efectivoTotalNecesario) ** (1 / w.year) - 1}
              <tr class="hover:bg-gray-50 transition-colors">
                <td class="text-center font-bold text-gray-500">{w.year}</td>
                <td class="text-center font-mono">{fmt(w.propertyValue)}</td>
                <td class="text-center font-mono text-rose-500">{fmt(w.debt)}</td>
                <td class="text-center font-mono text-emerald-600">{fmt(w.equity)}</td>
                <td class="text-center font-extrabold {(roi * 100) >= 5 ? 'text-emerald-600' : (roi * 100) >= 0 ? 'text-amber-600' : 'text-red-600'}">{pct(roi)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>

<div class="space-y-6 pb-12">
    <!-- FISCAL BREAKDOWN -->
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
      <h3 class="text-sm font-bold text-[#0A2540] mb-3">Detalle Fiscal</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-3 bg-gray-50 rounded-xl">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AfA Anual</p>
          <p class="text-lg font-black text-[#0A2540] mt-0.5">{fmt(($params.precio * 0.75 * (1 / $params.afaYears)))}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-xl">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">AfA Acumulada</p>
          <p class="text-lg font-black text-amber-600 mt-0.5">{fmt($summary.afaAcumulada)}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-xl">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Ahorro Fiscal Total</p>
          <p class="text-lg font-black text-emerald-600 mt-0.5">{fmt($summary.totalCashflowAcumulado > 0 ? ($years.reduce((s, y) => s + y.devolucionFiscalMensual * 12, 0)) : 0)}</p>
        </div>
        <div class="p-3 bg-gray-50 rounded-xl">
          <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Préstamo Total</p>
          <p class="text-lg font-black text-[#0A2540] mt-0.5">{fmt($purchaseCosts.montoFinanciar)}</p>
        </div>
      </div>
    </div>

    <!-- FULL PROJECTION TABLE -->
    <div class="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
      <div class="p-4 border-b border-gray-100">
        <h3 class="text-sm font-bold text-[#0A2540]">Proyección Anual</h3>
      </div>
      <div class="overflow-x-auto max-h-96 overflow-y-auto">
        <table class="w-full text-left border-collapse fin-table">
          <thead class="sticky top-0 z-10">
            <tr>
              <th class="text-center bg-gray-200">Año</th>
              <th class="text-center bg-gray-200">Alquiler Total</th>
              <th class="text-center bg-gray-200">Hipoteca</th>
              <th class="text-center bg-gray-200">Cashflow Bruto</th>
              <th class="text-center bg-gray-200">Ahorro Fiscal</th>
              <th class="text-center bg-gray-200">Cashflow Neto</th>
            </tr>
          </thead>
          <tbody id="tabla-proyeccion-body">
            {#each $years as y, i}
              <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} hover:bg-gray-50 transition-colors">
                <td class="text-center font-bold text-gray-500 text-sm">{y.year}</td>
                <TooltipTd content={htmlWarmTooltip(y)} tdClass="text-center text-sm">
                  {fmt(y.ingresoWarmMensual)}
                </TooltipTd>
                <TooltipTd content={htmlHipotecaTooltip(y)} tdClass="text-center text-amber-700 bg-amber-50/40 text-sm">
                  {fmt(-y.hipotecaMensual)}
                </TooltipTd>
                <TooltipTd content={htmlCashflowTooltip(y, $params)} tdClass="text-center text-sm">
                  {fmt(y.cashflowPreTaxMensual)}
                </TooltipTd>
                <TooltipTd content={htmlFiscalTooltip(y, $params)} tdClass="text-center text-emerald-700 bg-emerald-50/40 text-sm" width="w-72">
                  {y.devolucionFiscalMensual > 0 ? '+' : ''}{fmt(y.devolucionFiscalMensual)}
                </TooltipTd>
                <td class="text-center font-bold text-sm {y.cashflowNetoPostTaxMensual >= 0 ? 'text-green-600' : 'text-orange-600'}">{fmt(y.cashflowNetoPostTaxMensual)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>
