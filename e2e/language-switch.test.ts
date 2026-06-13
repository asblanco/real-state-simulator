import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const errors: string[] = [];
page.on("pageerror", err => errors.push(err.message));

await page.goto(BASE, { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

async function canvasHasData(canvasId: string): Promise<boolean> {
  const result = await page.evaluate((id) => {
    const c = document.getElementById(id) as HTMLCanvasElement | null;
    if (!c) return "no-canvas";
    const ctx = c.getContext("2d")!;
    const { width: w, height: h } = c;
    const xStart = Math.floor(w * 0.2);
    const xEnd = Math.floor(w * 0.8);
    const yStart = Math.floor(h * 0.2);
    const yEnd = Math.floor(h * 0.8);
    const stepX = Math.max(1, Math.floor((xEnd - xStart) / 15));
    const stepY = Math.max(1, Math.floor((yEnd - yStart) / 15));
    let coloredPixels = 0;
    for (let x = xStart; x < xEnd; x += stepX) {
      for (let y = yStart; y < yEnd; y += stepY) {
        const a = ctx.getImageData(x, y, 1, 1).data[3];
        if (a > 0) coloredPixels++;
      }
    }
    return coloredPixels > 5 ? "has-data" : "empty";
  }, canvasId);
  return result === "has-data";
}

async function switchLanguage(value: string): Promise<void> {
  await page.evaluate((v) => {
    const sel = document.getElementById("lang-select") as HTMLSelectElement;
    sel.value = v;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(1500);
}

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) { passed++; console.log(`  ✓ ${msg}`); }
  else { failed++; console.log(`  ✗ ${msg}`); }
}

console.log("\nE2E: Language Switch – Chart Rendering\n");

// Baseline: charts rendered with data on initial load (Spanish)
assert(await canvasHasData("chart-cashflow"), "Cashflow chart has content before language switch");
assert(await canvasHasData("chart-wealth"), "Wealth chart has content before language switch");

// Switch to English
await switchLanguage("en");
assert(await canvasHasData("chart-cashflow"), "Cashflow chart has content after switch to EN");
assert(await canvasHasData("chart-wealth"), "Wealth chart has content after switch to EN");

// Switch to German
await switchLanguage("de");
assert(await canvasHasData("chart-cashflow"), "Cashflow chart has content after switch to DE");
assert(await canvasHasData("chart-wealth"), "Wealth chart has content after switch to DE");

// Switch back to Spanish
await switchLanguage("es");
assert(await canvasHasData("chart-cashflow"), "Cashflow chart has content after switch back to ES");
assert(await canvasHasData("chart-wealth"), "Wealth chart has content after switch back to ES");

assert(errors.length === 0, `No page errors (got ${errors.length})`);
if (errors.length) errors.forEach(e => console.log(`     ${e}`));

console.log(`\n${passed + failed} tests, ${passed} passed, ${failed} failed`);

await browser.close();
process.exit(failed > 0 ? 1 : 0);
