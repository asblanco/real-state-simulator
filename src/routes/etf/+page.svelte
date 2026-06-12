<script lang="ts">
  import { params } from "$lib/stores/params";
  import { purchaseCosts, years, summary, etfCagr, etfComparison } from "$lib/stores/computed";
  import { t } from "$lib/i18n";
  import Chart from "$lib/components/Chart.svelte";

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("de-DE") + " €";
  }

  function pct(n: number): string {
    return (n * 100).toFixed(2) + " %";
  }
</script>

<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs mb-6">
  <h3 class="text-lg font-bold text-[#0A2540] mb-1">{$t("etf.title")}</h3>
  <p class="text-sm text-gray-500 mb-4">{$t("etf.subtitle")}</p>

  <div class="bg-[#0A2540]/5 rounded-xl p-4 mb-6 text-sm text-gray-600">
    <p class="font-bold text-[#0A2540] text-xs uppercase tracking-wider mb-1">{$t("etf.model_desc")}</p>
    <p>{$t("etf.model_detail")}</p>
  </div>

  <div class="bg-gray-50 rounded-xl p-3 mb-6 text-xs text-gray-500 flex flex-wrap gap-x-5 gap-y-1">
    <span>Precio: <strong class="text-gray-800">{(($params.precio + $params.parking)).toLocaleString("de-DE")} €</strong></span>
    <span>Entrada: <strong class="text-gray-800">{($params.entradaPct * 100).toFixed(0)}%</strong></span>
    <span>Interés: <strong class="text-gray-800">{($params.interesPct * 100).toFixed(2)}%</strong></span>
    <span>Plazo: <strong class="text-gray-800">{$params.years} años</strong></span>
    <span>Revaloriz.: <strong class="text-gray-800">{($params.inflacionPct * 100).toFixed(1)}%</strong></span>
    <span>Subida alq.: <strong class="text-gray-800">{($params.subidaPct * 100).toFixed(0)}%</strong></span>
  </div>

  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Datos de entrada</p>
  <div class="grid grid-cols-2 gap-4 mb-6">
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.initial_capital")}</p>
      <p class="text-lg font-black text-gray-800 mt-1">{fmt($purchaseCosts.efectivoTotalNecesario)}</p>
    </div>
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.avg_monthly_saving")}</p>
      <p class="text-lg font-black text-gray-800 mt-1">
        {fmt($etfComparison.avgMonthlyContribution)}
        <span class="text-xs text-gray-400 font-normal">/mes</span>
      </p>
    </div>
  </div>

  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Resultado de la comparativa</p>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.final_value")} ETF</p>
      <p class="text-lg font-black text-gray-800 mt-1">{fmt($etfComparison.etfFinalValue)}</p>
    </div>
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.re_final")}</p>
      <p class="text-lg font-black text-gray-800 mt-1">{fmt($etfComparison.reFinalWealth)}</p>
    </div>
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2 md:col-span-1">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.gap")}</p>
      <p class="text-xl font-black {Number.isFinite($etfComparison.breakevenCagr) ? ($etfComparison.etfCagr >= $etfComparison.breakevenCagr ? 'text-emerald-600' : 'text-orange-600') : 'text-gray-400'} mt-1">
        {$etfComparison.gap >= 0 ? '+' : ''}{fmt($etfComparison.gap)}
      </p>
      <p class="text-[10px] text-gray-400 mt-0.5">
        {$etfComparison.gap >= 0 ? $t("etf.wins") : $t("etf.re_wins")}
      </p>
    </div>
    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-2 md:col-span-1">
      <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.breakeven")}</p>
      <p class="text-xl font-black text-gray-800 mt-1">{Number.isFinite($etfComparison.breakevenCagr) ? pct($etfComparison.breakevenCagr) : "—"}</p>
      <p class="text-[10px] text-gray-400 mt-0.5">{$t("etf.breakeven_desc")}</p>
    </div>
  </div>

  <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Escenarios de rentabilidad</p>
  <div class="grid grid-cols-3 gap-3 mb-2">
    {#each [{ label: $t("etf.scenario_conservative"), value: $etfComparison.scenario5 }, { label: $t("etf.scenario_moderate"), value: $etfComparison.scenario7 }, { label: $t("etf.scenario_aggressive"), value: $etfComparison.scenario10 }] as item}
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{item.label}</p>
        <p class="text-base font-black text-gray-800 mt-0.5">{fmt(item.value)}</p>
      </div>
    {/each}
  </div>
</div>

<div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-96 mb-6">
  <Chart
    type="line"
    labels={$etfComparison.yearByYear.map(y => $t("chart.axis_prefix") + y.year)}
    datasets={[
      {
        label: $t("etf.legend_re"),
        data: $etfComparison.yearByYear.map(y => y.reTotalWealth),
        borderColor: "rgb(4, 120, 87)",
        borderWidth: 2.5,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "rgb(4, 120, 87)",
      },
      {
        label: $t("etf.legend_etf") + " (" + ($etfCagr * 100).toFixed(1) + "%)",
        data: $etfComparison.yearByYear.map(y => y.etfValue),
        borderColor: "rgb(99, 91, 255)",
        borderWidth: 2.5,
        fill: false,
        pointRadius: 3,
        pointBackgroundColor: "rgb(99, 91, 255)",
      },
    ]}
    title={$t("etf.chart_title")}
  />
</div>

<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
  <h3 class="text-base font-bold text-[#0A2540] mb-4">{$t("etf.year_table")}</h3>
  <div class="overflow-x-auto">
    <table class="w-full text-left border-collapse fin-table">
      <thead>
        <tr>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("etf.year")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("etf.re_wealth")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("etf.etf_value")}</th>
          <th class="text-center text-xs font-bold text-gray-800 bg-gray-200">{$t("etf.table_gap")}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 bg-white">
        {#each $etfComparison.yearByYear as y, i}
          <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}">
            <td class="text-center font-bold text-gray-500 text-sm py-3 px-2.5">{y.year}</td>
            <td class="text-center font-mono text-sm py-3 px-2.5 text-emerald-700">{fmt(y.reTotalWealth)}</td>
            <td class="text-center font-mono text-sm py-3 px-2.5 text-[#635BFF]">{fmt(y.etfValue)}</td>
            <td class="text-center font-mono text-sm py-3 px-2.5 {y.etfValue - y.reTotalWealth >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
              {y.etfValue - y.reTotalWealth >= 0 ? '+' : ''}{fmt(y.etfValue - y.reTotalWealth)}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</div>
