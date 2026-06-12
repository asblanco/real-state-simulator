import Chart from "chart.js/auto";
import type { YearData } from "./types";
import { YEARS } from "./constants";
import { t } from "./i18n";

let chartRent: Chart;
let chartCF: Chart;

let _ctxRent: CanvasRenderingContext2D | null = null;
let _ctxCF: CanvasRenderingContext2D | null = null;

function buildLabels(): string[] {
  return Array.from({ length: YEARS }, (_, i) => `${t("chart.axis_prefix")}${i + 1}`);
}

export function initCharts(ctxRent: CanvasRenderingContext2D, ctxCF: CanvasRenderingContext2D): void {
  _ctxRent = ctxRent;
  _ctxCF = ctxCF;
  createCharts();
}

function createCharts(): void {
  if (!_ctxRent || !_ctxCF) return;
  destroyCharts();
  const labels = buildLabels();

  chartRent = new Chart(_ctxRent, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: t("chart.rental_label"),
        data: [],
        borderColor: "#0A2540",
        tension: 0,
        borderWidth: 2.5,
        pointBackgroundColor: "#0A2540",
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { title: { display: true, text: t("chart.rental_title") } },
    },
  });

  chartCF = new Chart(_ctxCF, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: t("chart.cashflow_label"),
        data: [],
        backgroundColor: (ctx) => {
          const val = ctx.parsed?.y ?? 0;
          return val >= 0 ? "#22c55e" : "#f97316";
        },
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { title: { display: true, text: t("chart.cashflow_title") } },
    },
  });
}

function destroyCharts(): void {
  if (chartRent) { chartRent.destroy(); chartRent = undefined as unknown as Chart; }
  if (chartCF) { chartCF.destroy(); chartCF = undefined as unknown as Chart; }
}

export function recreateCharts(): void {
  createCharts();
}

export let lastYears: YearData[] = [];

export function updateCharts(years: YearData[]): void {
  if (!chartRent || !chartCF) {
    lastYears = years;
    return;
  }
  chartRent.data.datasets[0].data = years.map(y => Math.round(y.ingresoWarmMensual));
  chartRent.update();

  chartCF.data.datasets[0].data = years.map(y => Math.round(y.cashflowNetoPostTaxMensual));
  chartCF.update();
}
