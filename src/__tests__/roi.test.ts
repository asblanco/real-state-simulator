import { test, expect, describe } from "bun:test";
import { getRoiColorClass } from "../roi";

describe("getRoiColorClass", () => {
  test('returns bg-red-600 when roi < 3.5%', () => {
    expect(getRoiColorClass(0.034)).toBe("bg-red-600");
    expect(getRoiColorClass(0)).toBe("bg-red-600");
    expect(getRoiColorClass(-0.01)).toBe("bg-red-600");
  });

  test('returns bg-sky-600 when roi between 3.5% and 7%', () => {
    expect(getRoiColorClass(0.035)).toBe("bg-sky-600");
    expect(getRoiColorClass(0.05)).toBe("bg-sky-600");
    expect(getRoiColorClass(0.0699)).toBe("bg-sky-600");
  });

  test('returns bg-emerald-600 when roi >= 7%', () => {
    expect(getRoiColorClass(0.07)).toBe("bg-emerald-600");
    expect(getRoiColorClass(0.1)).toBe("bg-emerald-600");
    expect(getRoiColorClass(0.5)).toBe("bg-emerald-600");
  });
});
