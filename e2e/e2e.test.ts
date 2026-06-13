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

function getKpiValue(id: string) {
  return page.evaluate((sel: string) => {
    const el = document.getElementById(sel);
    if (!el) return null;
    const ps = el.querySelectorAll("p");
    return ps.length >= 2 ? ps[1].textContent?.trim() ?? null : null;
  }, id);
}

function getTableRowCount(tableId: string) {
  return page.evaluate((sel: string) => {
    const tbody = document.getElementById(sel);
    return tbody?.querySelectorAll("tr").length ?? 0;
  }, tableId);
}

function canvasHasData(id: string) {
  return page.evaluate((sel: string) => {
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

test("no page errors", () => {
  expect(errors.length).toBe(0);
});

test("Precio Total KPI shows value", async () => {
  const v = await getKpiValue("kpi-precio-total");
  expect(v).not.toBeNull();
  expect(v).not.toBe("0 €");
  expect(v).toMatch(/€$/);
});

test("Efectivo Inicial KPI shows value", async () => {
  const v = await getKpiValue("kpi-efectivo-inicial");
  expect(v).not.toBeNull();
  expect(v).not.toBe("0 €");
  expect(v).toMatch(/€$/);
});

test("Ganancia Neta KPI shows value", async () => {
  const v = await getKpiValue("kpi-ganancia-neta");
  expect(v).not.toBeNull();
  expect(v).not.toBe("0 €");
  expect(v).toMatch(/€$/);
});

test("ROE KPI shows percentage", async () => {
  const v = await getKpiValue("kpi-roe");
  expect(v).not.toBeNull();
  expect(v).toContain("%");
  expect(v).not.toContain("0.00");
});

test("projection table has at least 10 rows", async () => {
  const rows = await getTableRowCount("tabla-proyeccion-body");
  expect(rows).toBeGreaterThanOrEqual(10);
});

test("cashflow chart has rendered content", async () => {
  expect(await canvasHasData("chart-cashflow")).toBe(true);
});

test("wealth chart has rendered content", async () => {
  expect(await canvasHasData("chart-wealth")).toBe(true);
});

test("tooltip hover does not cause errors", async () => {
  const card = page.locator("#kpi-costo-adquisicion");
  await card.hover();
  await page.waitForTimeout(500);
  expect(errors.length).toBe(0);
});
