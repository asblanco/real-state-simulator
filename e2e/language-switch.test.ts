import { test, expect, chromium } from "@playwright/test";

let browser: any;
let page: any;
const errors: string[] = [];

test.beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  page.on("pageerror", (err: any) => errors.push(err.message));
  await page.goto("/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
});

test.afterAll(async () => {
  await browser.close();
});

async function canvasHasData(canvasId: string): Promise<boolean> {
  const result = await page.evaluate((id: string) => {
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
  await page.evaluate((v: string) => {
    const sel = document.getElementById("lang-select") as HTMLSelectElement;
    sel.value = v;
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
  await page.waitForTimeout(1500);
}

test("cashflow chart has content before language switch", async () => {
  expect(await canvasHasData("chart-cashflow")).toBe(true);
});

test("wealth chart has content before language switch", async () => {
  expect(await canvasHasData("chart-wealth")).toBe(true);
});

test("cashflow chart has content after switch to EN", async () => {
  await switchLanguage("en");
  expect(await canvasHasData("chart-cashflow")).toBe(true);
});

test("wealth chart has content after switch to EN", async () => {
  expect(await canvasHasData("chart-wealth")).toBe(true);
});

test("cashflow chart has content after switch to DE", async () => {
  await switchLanguage("de");
  expect(await canvasHasData("chart-cashflow")).toBe(true);
});

test("wealth chart has content after switch to DE", async () => {
  expect(await canvasHasData("chart-wealth")).toBe(true);
});

test("cashflow chart has content after switch back to ES", async () => {
  await switchLanguage("es");
  expect(await canvasHasData("chart-cashflow")).toBe(true);
});

test("wealth chart has content after switch back to ES", async () => {
  expect(await canvasHasData("chart-wealth")).toBe(true);
});

test("no page errors during language switches", () => {
  expect(errors.length).toBe(0);
});
