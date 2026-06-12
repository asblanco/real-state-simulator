import { initCharts, updateCharts } from "./charts";
import { computePurchaseCosts, calculateAllYears, computeSummary } from "./calculator";
import { applyDefaults, readInputs, updateDisplayValues, renderKPIs, renderTable, renderSummary, bindInputs } from "./ui";

function updateCalculations(): void {
  const params = readInputs();
  updateDisplayValues(params);
  const purchaseCosts = computePurchaseCosts(params);
  renderKPIs(purchaseCosts, params);
  const years = calculateAllYears(params, purchaseCosts);
  renderTable(years);
  const summary = computeSummary(params, years, purchaseCosts);
  renderSummary(summary, purchaseCosts);
  updateCharts(years);
}

const chartRentCanvas = document.getElementById("chartRent") as HTMLCanvasElement;
const chartCFCanvas = document.getElementById("chartCashflow") as HTMLCanvasElement;
initCharts(chartRentCanvas.getContext("2d")!, chartCFCanvas.getContext("2d")!);

const inputs = ["precio", "parking", "entrada", "interes", "tilgung", "alquiler", "alquiler-parking", "subida", "inflacion", "afa"];
bindInputs(inputs, updateCalculations);

applyDefaults();
updateCalculations();
