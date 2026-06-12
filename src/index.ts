import { initCharts, updateCharts, lastYears, recreateCharts } from "./charts";
import { computePurchaseCosts, calculateAllYears, computeSummary } from "./calculator";
import { applyDefaults, readInputs, updateDisplayValues, renderKPIs, renderTable, renderSummary, bindInputs, bindToggle } from "./ui";
import { setLocale, type Locale } from "./i18n";

// Initialize locale before any rendering
const langSelect = document.getElementById("lang-select") as HTMLSelectElement | null;
if (langSelect) {
  const browserLang = navigator.language?.slice(0, 2);
  const initial: Locale = (browserLang === "en" || browserLang === "de") ? browserLang : "es";
  langSelect.value = initial;
  setLocale(initial);

  langSelect.addEventListener("change", () => {
    const locale = langSelect.value as Locale;
    setLocale(locale);
    recreateCharts();
    updateCalculations();
  });
}

function updateCalculations(): void {
  const params = readInputs();
  updateDisplayValues(params);
  const purchaseCosts = computePurchaseCosts(params);
  renderKPIs(purchaseCosts, params);
  const years = calculateAllYears(params, purchaseCosts);
  renderTable(years, params.reservaImprevistos);
  const summary = computeSummary(params, years, purchaseCosts);
  renderSummary(summary, purchaseCosts);
  updateCharts(years);
}

const inputs = ["precio", "parking", "entrada", "interes", "tilgung", "alquiler", "alquiler-parking", "subida", "inflacion", "afa", "reserva-imprevistos"];
bindInputs(inputs, updateCalculations);

applyDefaults();
bindToggle(updateCalculations);
updateCalculations();

const chartRentCanvas = document.getElementById("chartRent") as HTMLCanvasElement | null;
const chartCFCanvas = document.getElementById("chartCashflow") as HTMLCanvasElement | null;
const ctxRent = chartRentCanvas?.getContext("2d");
const ctxCF = chartCFCanvas?.getContext("2d");
if (ctxRent && ctxCF) {
  requestAnimationFrame(() => {
    try {
      initCharts(ctxRent, ctxCF);
      if (lastYears.length) updateCharts(lastYears);
    } catch (e) {
      console.error("Chart initialization failed", e);
    }
  });
}
