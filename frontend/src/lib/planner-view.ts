import type { Place } from "@/lib/types";

const categoryLabels: Record<string, string> = {
  attraction: "景点",
  hotel: "住宿",
  restaurant: "美食",
  transport: "交通",
  shopping: "购物",
  other: "其他",
};

function formatDate(value: string): string {
  return value.replaceAll("-", ".");
}

export function formatTripRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "日期待定";
  if (!startDate) return formatDate(endDate!);
  if (!endDate) return formatDate(startDate);

  const start = formatDate(startDate);
  const end = startDate.slice(0, 4) === endDate.slice(0, 4)
    ? formatDate(endDate).slice(5)
    : formatDate(endDate);
  return `${start} - ${end}`;
}

export type SaveTone = "error" | "working" | "saved";

export function getSaveTone(label: string): SaveTone {
  if (label.includes("失败")) return "error";
  if (label.includes("中") || label.includes("加载")) return "working";
  return "saved";
}

export function categoryLabel(category: string): string {
  return categoryLabels[category] ?? category;
}

export function summarizePlaces(places: Place[]) {
  const mustVisit = places.filter((place) => place.priority === "must_visit").length;
  return {
    total: places.length,
    mustVisit,
    optional: places.length - mustVisit,
  };
}

export function buildRouteTime(startTime: string, index: number): string {
  const [hours = 9, minutes = 0] = startTime.split(":").map(Number);
  const totalMinutes = (hours * 60 + minutes + index * 90) % (24 * 60);
  const nextHours = Math.floor(totalMinutes / 60).toString().padStart(2, "0");
  const nextMinutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${nextHours}:${nextMinutes}`;
}
