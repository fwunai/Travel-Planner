import { describe, expect, it } from "vitest";
import {
  buildRouteTime,
  categoryLabel,
  formatTripRange,
  getSaveTone,
  summarizePlaces,
} from "@/lib/planner-view";
import type { Place } from "@/lib/types";

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

describe("getSaveTone", () => {
  it.each([
    ["保存失败", "error"],
    ["加载失败", "error"],
    ["保存中…", "working"],
    ["切换计划中…", "working"],
    ["已自动保存到本地", "saved"],
  ] as const)("maps %s to %s", (label, tone) => {
    expect(getSaveTone(label)).toBe(tone);
  });
});

describe("categoryLabel", () => {
  it("maps legacy categories and preserves custom tags", () => {
    expect(categoryLabel("attraction")).toBe("景点");
    expect(categoryLabel("restaurant")).toBe("美食");
    expect(categoryLabel("亲子")).toBe("亲子");
  });
});

describe("summarizePlaces", () => {
  it("counts total, must-visit, and optional places", () => {
    const places = [
      { id: "1", priority: "must_visit" },
      { id: "2", priority: "optional" },
      { id: "3", priority: "optional" },
    ] as Place[];

    expect(summarizePlaces(places)).toEqual({ total: 3, mustVisit: 1, optional: 2 });
  });
});

describe("buildRouteTime", () => {
  it("creates deterministic 90-minute planning slots", () => {
    expect(buildRouteTime("09:00:00", 0)).toBe("09:00");
    expect(buildRouteTime("09:00:00", 1)).toBe("10:30");
    expect(buildRouteTime("23:30:00", 1)).toBe("01:00");
  });
});
