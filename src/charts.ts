import Chart from "chart.js/auto";
import type { YearData, InputParams } from "./types";
import { t } from "./i18n";

let chartRent: Chart;
let chartCF: Chart;
let chartEquity: Chart;

let _ctxRent: CanvasRenderingContext2D | null = null;
let _ctxCF: CanvasRenderingContext2D | null = null;
let _ctxEquity: CanvasRenderingContext2D | null = null;

let _years = 10;

export function setYears(n: number): void {
  _years = n;
}

function buildLabels(): string[] {
  return Array.from({ length: _years }, (_, i) => `${t("chart.axis_prefix")}${i + 1}`);
}

export function initCharts(ctxRent: CanvasRenderingContext2D, ctxCF: CanvasRenderingContext2D, ctxEquity: CanvasRenderingContext2D): void {
  _ctxRent = ctxRent;
  _ctxCF = ctxCF;
  _ctxEquity = ctxEquity;
  createCharts();
}

function createCharts(): void {
  if (!_ctxRent || !_ctxCF || !_ctxEquity) return;
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
      plugins: { title: { display: true, text: t("chart.rental_title"), font: { size: 14, weight: "bold" }, color: "#0A2540" } },
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
      plugins: { title: { display: true, text: t("chart.cashflow_title"), font: { size: 14, weight: "bold" }, color: "#0A2540" } },
    },
  });

  chartEquity = new Chart(_ctxEquity, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t("chart.equity_label_deuda"),
          data: [],
          backgroundColor: "rgba(239, 68, 68, 0.3)",
          borderColor: "rgb(239, 68, 68)",
          borderWidth: 1.5,
          fill: true,
          pointRadius: 2,
        },
        {
          label: t("chart.equity_label_equity"),
          data: [],
          backgroundColor: "rgba(99, 91, 255, 0.3)",
          borderColor: "rgb(99, 91, 255)",
          borderWidth: 2,
          fill: true,
          pointRadius: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { stacked: true } },
      plugins: { title: { display: true, text: t("chart.equity_title"), font: { size: 14, weight: "bold" }, color: "#0A2540" } },
    },
  });
}

function destroyCharts(): void {
  if (chartRent) { chartRent.destroy(); chartRent = undefined as unknown as Chart; }
  if (chartCF) { chartCF.destroy(); chartCF = undefined as unknown as Chart; }
  if (chartEquity) { chartEquity.destroy(); chartEquity = undefined as unknown as Chart; }
}

export function recreateCharts(): void {
  createCharts();
}

export let lastYears: YearData[] = [];
export let lastParams: InputParams | null = null;

export function updateCharts(years: YearData[], params?: InputParams): void {
  if (!chartRent || !chartCF || !chartEquity) {
    lastYears = years;
    if (params) lastParams = params;
    return;
  }
  chartRent.data.datasets[0].data = years.map(y => Math.round(y.ingresoWarmMensual));
  chartRent.update();

  chartCF.data.datasets[0].data = years.map(y => Math.round(y.cashflowNetoPostTaxMensual));
  chartCF.update();

  if (params) {
    const precioTotal = params.precio + params.parking;
    const debtData = years.map(y => Math.round(y.deudaRestante));
    const equityData = years.map(y => Math.round(precioTotal * ((1 + params.inflacionPct) ** y.year) - y.deudaRestante));
    chartEquity.data.datasets[0].data = debtData;
    chartEquity.data.datasets[1].data = equityData;
    chartEquity.update();
  }
}
