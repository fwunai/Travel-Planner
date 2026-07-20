import { describe, expect, it } from "vitest";
import { formatTripRange } from "@/lib/planner-view";

describe("formatTripRange", () => {
  it("shows a useful fallback when dates are missing", () => {
    expect(formatTripRange(null, null)).toBe("日期待定");
  });

  it("shows a single known date", () => {
    expect(formatTripRange("2026-10-01", null)).toBe("2026.10.01");
  });

  it("shows a compact date range", () => {
    expect(formatTripRange("2026-10-01", "2026-10-03")).toBe("2026.10.01 - 10.03");
  });
});
