import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors: string[] = [];
page.on("pageerror", err => errors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const kpis = await page.evaluate(() => ({
  precioTotal: document.getElementById("kpi-precio-total")?.textContent,
  efectivo: document.getElementById("kpi-efectivo")?.textContent,
  retorno: document.getElementById("kpi-retorno")?.textContent,
  roi: document.getElementById("kpi-roi")?.textContent,
}));

const tableRows = await page.evaluate(() =>
  document.querySelectorAll("#tabla-proyeccion-body tr").length
);

const chartContent = await page.evaluate(() => {
  function hasPixelContent(id: string): boolean {
    const c = document.getElementById(id) as HTMLCanvasElement | null;
    if (!c) return false;
    const ctx = c.getContext("2d")!;
    const { width: w, height: h } = c;
    let count = 0;
    for (let x = 0; x < w; x += Math.max(1, Math.floor(w / 20))) {
      for (let y = 0; y < h; y += Math.max(1, Math.floor(h / 20))) {
        const a = ctx.getImageData(x, y, 1, 1).data[3];
        if (a > 0) count++;
      }
    }
    return count > 10;
  }
  return { rent: hasPixelContent("chartRent"), cashflow: hasPixelContent("chartCashflow") };
});

const tooltipShown = await page.evaluate(() => {
  const tt = document.querySelector(".tt") as HTMLElement | null;
  if (!tt) return "no-trigger-found";
  tt.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  const portal = document.getElementById("tooltip-portal") as HTMLElement | null;
  if (!portal) return "no-portal";
  return portal.classList.contains("hidden") ? "hidden" : "visible";
});

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.log(`  ✗ ${msg}`); }
}

console.log("\nE2E: Real State Simulator\n");

assert(errors.length === 0, `No page errors (got ${errors.length})`);
if (errors.length) errors.forEach(e => console.log(`     ${e}`));

assert(kpis.precioTotal !== "0 €" && kpis.precioTotal?.endsWith("€") && kpis.precioTotal !== undefined, `Precio Total = ${kpis.precioTotal}`);
assert(kpis.efectivo !== "0 €" && kpis.efectivo?.endsWith("€"), `Efectivo Inicial = ${kpis.efectivo}`);
assert(kpis.retorno !== "0 €" && kpis.retorno?.endsWith("€"), `Retorno Año 10 = ${kpis.retorno}`);
assert(kpis.roi !== "0.00 %" && kpis.roi?.endsWith("%"), `ROI = ${kpis.roi}`);
assert(tableRows >= 10, `Table has ${tableRows} rows (≥10)`);
assert(chartContent.rent, "Rent chart has visible content");
assert(chartContent.cashflow, "Cashflow chart has visible content");
assert(tooltipShown === "visible", `Table tooltip should be visible (got "${tooltipShown}")`);

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
