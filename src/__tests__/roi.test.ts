import { test, expect, describe } from "bun:test";
import { getRoiColorClass, getRoiProyectoColorClass } from "../roi";

describe("getRoiColorClass (ROE)", () => {
  test("returns bg-red-600 when roi < 5%", () => {
    expect(getRoiColorClass(0.049)).toBe("bg-red-600");
    expect(getRoiColorClass(0)).toBe("bg-red-600");
    expect(getRoiColorClass(-0.01)).toBe("bg-red-600");
  });

  test("returns bg-sky-600 when roi between 5% and 10%", () => {
    expect(getRoiColorClass(0.05)).toBe("bg-sky-600");
    expect(getRoiColorClass(0.07)).toBe("bg-sky-600");
    expect(getRoiColorClass(0.0999)).toBe("bg-sky-600");
  });

  test("returns bg-emerald-600 when roi >= 10%", () => {
    expect(getRoiColorClass(0.10)).toBe("bg-emerald-600");
    expect(getRoiColorClass(0.15)).toBe("bg-emerald-600");
    expect(getRoiColorClass(0.5)).toBe("bg-emerald-600");
  });
});

describe("getRoiProyectoColorClass (ROA)", () => {
  test("returns bg-red-600 when roi < 2.5%", () => {
    expect(getRoiProyectoColorClass(0.024)).toBe("bg-red-600");
    expect(getRoiProyectoColorClass(0)).toBe("bg-red-600");
    expect(getRoiProyectoColorClass(-0.01)).toBe("bg-red-600");
  });

  test("returns bg-sky-600 when roi between 2.5% and 5%", () => {
    expect(getRoiProyectoColorClass(0.025)).toBe("bg-sky-600");
    expect(getRoiProyectoColorClass(0.03)).toBe("bg-sky-600");
    expect(getRoiProyectoColorClass(0.0499)).toBe("bg-sky-600");
  });

  test("returns bg-emerald-600 when roi >= 5%", () => {
    expect(getRoiProyectoColorClass(0.05)).toBe("bg-emerald-600");
    expect(getRoiProyectoColorClass(0.10)).toBe("bg-emerald-600");
    expect(getRoiProyectoColorClass(0.5)).toBe("bg-emerald-600");
  });
});
