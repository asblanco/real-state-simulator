import Chart from "chart.js/auto";
import type { YearData } from "./types";
import { YEARS } from "./constants";

let chartRent: Chart;
let chartCF: Chart;

export function initCharts(ctxRent: CanvasRenderingContext2D, ctxCF: CanvasRenderingContext2D): void {
  const labels = Array.from({ length: YEARS }, (_, i) => `Año ${i + 1}`);

  chartRent = new Chart(ctxRent, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Renta Warm Mensual (€)",
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
      plugins: { title: { display: true, text: "Renta Warm Mensual Escalada (Piso + Parking + Umlage)" } },
    },
  });

  chartCF = new Chart(ctxCF, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Cashflow Mensual Post-Tax (€)",
        data: [],
        backgroundColor: "#635BFF",
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { title: { display: true, text: "Flujo Líquido Neto Mensual (Post-Impuestos)" } },
    },
  });
}

export function updateCharts(years: YearData[]): void {
  if (!chartRent || !chartCF) return;
  chartRent.data.datasets[0].data = years.map(y => Math.round(y.ingresoWarmMensual));
  chartRent.update();

  chartCF.data.datasets[0].data = years.map(y => Math.round(y.cashflowNetoPostTaxMensual));
  chartCF.update();
}
