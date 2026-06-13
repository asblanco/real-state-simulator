import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors: string[] = [];
page.on("pageerror", err => errors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

function getKpiValue(id: string) {
  return page.evaluate((sel) => {
    const el = document.getElementById(sel);
    if (!el) return null;
    const p = el.querySelector("p:last-child");
    return p?.textContent?.trim() ?? null;
  }, id);
}

function getTableRowCount(tableId: string) {
  return page.evaluate((sel) => {
    const tbody = document.getElementById(sel);
    return tbody?.querySelectorAll("tr").length ?? 0;
  }, tableId);
}

function canvasHasData(id: string) {
  return page.evaluate((sel) => {
    const c = document.getElementById(sel) as HTMLCanvasElement | null;
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
  }, id);
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.log(`  ✗ ${msg}`); }
}

console.log("\nE2E: Real State Simulator\n");

assert(errors.length === 0, `No page errors (got ${errors.length})`);
if (errors.length) errors.forEach(e => console.log(`     ${e}`));

const precioTotal = await getKpiValue("kpi-precio-total");
assert(precioTotal !== null && precioTotal !== "0 €" && precioTotal.endsWith("€"), `Precio Total = ${precioTotal}`);

const efectivo = await getKpiValue("kpi-efectivo-inicial");
assert(efectivo !== null && efectivo !== "0 €" && efectivo.endsWith("€"), `Efectivo Inicial = ${efectivo}`);

const ganancia = await getKpiValue("kpi-ganancia-neta");
assert(ganancia !== null && ganancia !== "0 €" && ganancia.endsWith("€"), `Ganancia Neta = ${ganancia}`);

const roe = await getKpiValue("kpi-roe");
assert(roe !== null && roe.includes("%") && !roe.includes("0.00"), `ROE = ${roe}`);

const tableRows = await getTableRowCount("tabla-proyeccion-body");
assert(tableRows >= 10, `Proyección table has ${tableRows} rows (≥10)`);

assert(await canvasHasData("chart-cashflow"), "Cashflow chart has visible content");
assert(await canvasHasData("chart-wealth"), "Wealth chart has visible content");

// Test tooltip: hover over a KPI card with tooltip
const tooltipCard = page.locator("#kpi-costo-adquisicion");
await tooltipCard.hover();
await page.waitForTimeout(500);
const cardErrors = errors.length;
assert(cardErrors === 0, `No errors after tooltip hover (got ${cardErrors})`);

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
