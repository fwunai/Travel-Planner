export const DEFAULT_TAGS = ["景点", "美食", "打卡点", "住宿", "交通", "购物", "其他"];

const STORAGE_KEY = "travel-planner:place-tags";

function normalizeTags(tags: string[]): string[] {
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
}

export function readTagLibrary(): string[] {
  if (typeof window === "undefined") return DEFAULT_TAGS;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_TAGS;
    const parsed: unknown = JSON.parse(stored);
    return Array.isArray(parsed) ? normalizeTags([...DEFAULT_TAGS, ...parsed.filter((tag): tag is string => typeof tag === "string")]) : DEFAULT_TAGS;
  } catch {
    return DEFAULT_TAGS;
  }
}

export function writeTagLibrary(tags: string[]): string[] {
  const normalized = normalizeTags([...DEFAULT_TAGS, ...tags]);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }
  return normalized;
}
