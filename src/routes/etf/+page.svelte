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

  function ti(key: string, vars: Record<string, string | number>): string {
    let s = $t(key);
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(`{${k}}`, String(v));
    }
    return s;
  }

  let diffData = $derived($etfComparison.yearByYear.map(y => y.etfValue - y.reTotalWealth));
  let gapColors = $derived(diffData.map(v => v >= 0 ? "rgba(16, 185, 129, 0.3)" : "rgba(239, 68, 68, 0.3)"));
  let investedData = $derived($etfComparison.yearByYear.map(y => y.cumulativeContribution));
</script>

<div class="space-y-5 pb-12">
  <!-- HEADER -->
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <div>
      <h3 class="text-lg font-bold text-[#0A2540]">{$t("etf.title")}</h3>
      <p class="text-sm text-gray-500">{$t("etf.subtitle")}</p>
    </div>
  </div>

  <!-- FINANCIAL INDEPENDENCE SECTION -->
  {#if $etfComparison.fiYear}
    <div class="bg-emerald-50 border border-emerald-200 rounded-2xl p-5">
      <div class="flex items-start gap-4">
        <div class="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl flex-shrink-0">🎯</div>
        <div>
          <p class="text-xs font-bold text-emerald-700 uppercase tracking-wider">{$t("etf.fi_title")}</p>
          <div class="flex items-baseline gap-3 mt-1 flex-wrap">
            <span class="text-3xl font-black text-emerald-800">{ti("etf.fi_year", { year: $etfComparison.fiYear })}</span>
            <span class="text-xl font-bold text-emerald-600">— {ti("etf.fi_income", { income: $etfComparison.fiMonthlyIncome.toLocaleString("de-DE") })}</span>
          </div>
          <p class="text-sm text-emerald-700 mt-1">{ti("etf.fi_desc", { year: $etfComparison.fiYear })}</p>
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-gray-50 border border-gray-200 rounded-2xl p-4">
      <p class="text-sm text-gray-500">{$t("etf.fi_not_reached")}</p>
    </div>
  {/if}

  <!-- KEY METRICS — compact -->
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.initial_capital")}</p>
        <p class="text-base font-black text-gray-800 mt-0.5">{fmt($purchaseCosts.efectivoTotalNecesario)}</p>
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.avg_monthly_saving")}</p>
        <p class="text-base font-black text-gray-800 mt-0.5">{fmt($etfComparison.avgMonthlyContribution)} <span class="text-[10px] text-gray-400 font-normal">/mes</span></p>
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.etf_final")}</p>
        <p class="text-base font-black text-[#635BFF] mt-0.5">{fmt($etfComparison.etfFinalValue)}</p>
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.re_final")}</p>
        <p class="text-base font-black text-emerald-700 mt-0.5">{fmt($etfComparison.reFinalWealth)}</p>
      </div>
    </div>

    <!-- GAP + BREAKEVEN + CROSSOVER — compact row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.gap")}</p>
        <p class="text-base font-black mt-0.5 {$etfComparison.gap >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
          {$etfComparison.gap >= 0 ? '+' : ''}{fmt($etfComparison.gap)}
        </p>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {$etfComparison.gap >= 0 ? $t("etf.wins") : $t("etf.re_wins")}
        </p>
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.breakeven")}</p>
        <p class="text-base font-black text-gray-800 mt-0.5">{Number.isFinite($etfComparison.breakevenCagr) ? pct($etfComparison.breakevenCagr) : "—"}</p>
        <p class="text-[10px] text-gray-400 mt-0.5">{$t("etf.breakeven_desc")}</p>
      </div>
      <div class="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{$t("etf.crossover")}</p>
        <p class="text-base font-black mt-0.5 {$etfComparison.crossoverYear ? 'text-[#635BFF]' : 'text-gray-400'}">
          {$etfComparison.crossoverYear ? $etfComparison.crossoverYear : "—"}
        </p>
        <p class="text-[10px] text-gray-400 mt-0.5">
          {$etfComparison.crossoverYear ? "ETF > Inmueble" : "ETF < Inmueble"}
        </p>
      </div>
    </div>
  </div>

  <!-- CHART 1: Wealth Evolution -->
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
          label: $t("etf.total_invested"),
          data: investedData,
          borderColor: "rgb(156, 163, 175)",
          borderWidth: 1.5,
          borderDash: [3, 3],
          fill: false,
          pointRadius: 0,
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
  <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
    <h3 class="text-sm font-bold text-[#0A2540] mb-3">{$t("etf.year_table")}</h3>
    <div class="overflow-x-auto max-h-80 overflow-y-auto">
      <table class="w-full text-left border-collapse fin-table">
        <thead class="sticky top-0 z-10">
          <tr>
            <th class="text-center bg-gray-200">{$t("etf.year")}</th>
            <th class="text-center bg-gray-200">{$t("etf.re_wealth")}</th>
            <th class="text-center bg-gray-200">{$t("etf.etf_value")}</th>
            <th class="text-center bg-gray-200">{$t("etf.table_gap")}</th>
            <th class="text-center bg-gray-200">{$t("etf.monthly_rent")}</th>
            <th class="text-center bg-gray-200">{$t("etf.sustainable_withdrawal")}</th>
            <th class="text-center bg-gray-200">{$t("etf.total_invested")}</th>
            <th class="text-center bg-gray-200">{$t("etf.net_gain_loss")}</th>
          </tr>
        </thead>
        <tbody>
          {#each $etfComparison.yearByYear as y, i}
            <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} {y.sustainableWithdrawal >= y.monthlyRentAtYear ? 'bg-emerald-50' : ''}">
              <td class="text-center font-bold text-gray-500 text-sm">{y.year}</td>
              <td class="text-center font-mono text-sm text-emerald-700">{fmt(y.reTotalWealth)}</td>
              <td class="text-center font-mono text-sm text-[#635BFF]">{fmt(y.etfValue)}</td>
              <td class="text-center font-mono text-sm {y.etfValue - y.reTotalWealth >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
                {y.etfValue - y.reTotalWealth >= 0 ? '+' : ''}{fmt(y.etfValue - y.reTotalWealth)}
              </td>
              <td class="text-center font-mono text-sm text-red-600">{fmt(y.monthlyRentAtYear)}</td>
              <td class="text-center font-mono text-sm {y.sustainableWithdrawal >= y.monthlyRentAtYear ? 'text-emerald-600 font-bold' : 'text-gray-500'}">
                {fmt(y.sustainableWithdrawal)}
              </td>
              <td class="text-center font-mono text-sm text-gray-500">{fmt(y.cumulativeContribution)}</td>
              <td class="text-center font-mono text-sm {y.etfValue - y.cumulativeContribution >= 0 ? 'text-emerald-600' : 'text-orange-600'}">
                {y.etfValue - y.cumulativeContribution >= 0 ? '+' : ''}{fmt(y.etfValue - y.cumulativeContribution)}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
