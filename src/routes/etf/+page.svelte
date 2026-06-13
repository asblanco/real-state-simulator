<script lang="ts">
  import { params } from "$lib/stores/params";
  import { purchaseCosts, etfCagr, etfComparison } from "$lib/stores/computed";
  import { t } from "$lib/i18n";
  import Chart from "$lib/components/Chart.svelte";

  function fmt(n: number): string {
    return Math.round(n).toLocaleString("de-DE") + " €";
  }

  function pct(n: number): string {
    return (n * 100).toFixed(2) + " %";
  }

  let diffData = $derived($etfComparison.yearByYear.map(y => y.etfValue - y.reTotalWealth));
  let gapColors = $derived(diffData.map(v => v >= 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"));
  let referenciaAlquiler = $derived($params.alquilerInicialPiso + $params.alquilerInicialParking);
</script>

<div class="space-y-6 pb-12">
  <!-- HEADER -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
    <div class="flex items-start justify-between mb-4">
      <div>
        <h3 class="text-lg font-bold text-[#0A2540]">{$t("etf.title")}</h3>
        <p class="text-sm text-gray-500">{$t("etf.subtitle")}</p>
      </div>
    </div>

    <div class="bg-[#0A2540]/5 rounded-xl p-4 mb-5 text-sm text-gray-600">
      <p class="font-bold text-[#0A2540] text-xs uppercase tracking-wider mb-1">{$t("etf.model_desc")}</p>
      <p>{$t("etf.model_detail")}</p>
    </div>

    <!-- REFERENCE RENT -->
    <div class="bg-gray-50 rounded-xl px-4 py-3 mb-5 text-sm text-gray-600 flex items-center gap-2">
      <span class="text-lg">🏠</span>
      <span>
        Referencia: alquiler de
        <strong class="text-gray-800">{referenciaAlquiler.toLocaleString("de-DE")} €</strong>/mes
        por el mismo inmueble (
        <strong class="text-gray-800">{($params.alquilerInicialPiso).toLocaleString("de-DE")} €</strong> piso
        {#if $params.alquilerInicialParking > 0}
          + <strong class="text-gray-800">{$params.alquilerInicialParking} €</strong> parking
        {/if})
      </span>
    </div>

    <!-- KEY METRICS -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.initial_capital")}</p>
        <p class="text-lg font-black text-gray-800 mt-1">{fmt($purchaseCosts.efectivoTotalNecesario)}</p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.avg_monthly_saving")}</p>
        <p class="text-lg font-black text-gray-800 mt-1">{fmt($etfComparison.avgMonthlyContribution)} <span class="text-xs text-gray-400 font-normal">/mes</span></p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.final_value")} ETF</p>
        <p class="text-lg font-black text-[#635BFF] mt-1">{fmt($etfComparison.etfFinalValue)}</p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.re_final")}</p>
        <p class="text-lg font-black text-emerald-700 mt-1">{fmt($etfComparison.reFinalWealth)}</p>
      </div>
    </div>

    <!-- GAP + BREAKEVEN + CROSSOVER -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.gap")}</p>
        <p class="text-xl font-black mt-1 {$etfComparison.gap >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
          {$etfComparison.gap >= 0 ? '+' : ''}{fmt($etfComparison.gap)}
        </p>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {$etfComparison.gap >= 0 ? $t("etf.wins") : $t("etf.re_wins")}
        </p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">{$t("etf.breakeven")}</p>
        <p class="text-xl font-black text-gray-800 mt-1">{Number.isFinite($etfComparison.breakevenCagr) ? pct($etfComparison.breakevenCagr) : "—"}</p>
        <p class="text-[10px] text-gray-400 mt-0.5">{$t("etf.breakeven_desc")}</p>
      </div>
      <div class="bg-gray-50 p-4 rounded-xl border border-gray-100">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider">Año de cruce</p>
        <p class="text-xl font-black mt-1 {$etfComparison.crossoverYear ? 'text-[#635BFF]' : 'text-gray-400'}">
          {$etfComparison.crossoverYear ? $etfComparison.crossoverYear : "Nunca"}
        </p>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {$etfComparison.crossoverYear
            ? "Año en que el ETF supera al inmueble"
            : "El inmueble siempre gana con estas condiciones"}
        </p>
      </div>
    </div>

  </div>

  <!-- COMPARISON CHART WITH SHADED AREA -->
  <div class="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs h-96">
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
        {
          label: "Diferencia (ETF − RE)",
          data: diffData,
          backgroundColor: gapColors,
          borderColor: "transparent",
          fill: true,
          pointRadius: 0,
        },
      ]}
      title={$t("etf.chart_title")}
    />
  </div>

  <!-- YEAR TABLE -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
    <h3 class="text-sm font-bold text-[#0A2540] mb-4">{$t("etf.year_table")}</h3>
    <div class="overflow-x-auto max-h-80 overflow-y-auto">
      <table class="w-full text-left border-collapse fin-table">
        <thead class="sticky top-0 z-10">
          <tr>
            <th class="text-center bg-gray-200">{$t("etf.year")}</th>
            <th class="text-center bg-gray-200">{$t("etf.re_wealth")}</th>
            <th class="text-center bg-gray-200">{$t("etf.etf_value")}</th>
            <th class="text-center bg-gray-200">{$t("etf.table_gap")}</th>
          </tr>
        </thead>
        <tbody>
          {#each $etfComparison.yearByYear as y, i}
            <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'}">
              <td class="text-center font-bold text-gray-500 text-sm">{y.year}</td>
              <td class="text-center font-mono text-sm text-emerald-700">{fmt(y.reTotalWealth)}</td>
              <td class="text-center font-mono text-sm text-[#635BFF]">{fmt(y.etfValue)}</td>
              <td class="text-center font-mono text-sm {y.etfValue - y.reTotalWealth >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
                {y.etfValue - y.reTotalWealth >= 0 ? '+' : ''}{fmt(y.etfValue - y.reTotalWealth)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
