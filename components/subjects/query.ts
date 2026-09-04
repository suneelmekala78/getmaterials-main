export const SUBJECT_CATEGORIES = [
  { value: "engineering", label: "Engineering" },
  { value: "science", label: "Science" },
  { value: "commerce", label: "Commerce" },
  { value: "arts", label: "Arts" },
  { value: "medical", label: "Medical" },
  { value: "law", label: "Law" },
  { value: "general", label: "General" },
] as const;

import { buildSearchParams, type QueryParam } from "@/lib/filter-list";

export type SubjectQuery = {
  q?: string;
  category?: QueryParam;
  sort?: string;
  view?: string;
  page?: string;
};

const KEYS = ["q", "category", "sort", "view", "page"] as const;

export function subjectsHref(current: SubjectQuery, patch: Partial<SubjectQuery> = {}) {
  const next: SubjectQuery = { ...current, ...patch };
  if (!patch.page) next.page = undefined;
  const query = buildSearchParams(next, KEYS);
  const qs = query.toString();
  return qs ? `/subjects?${qs}` : "/subjects";
}

export function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(value);
}

export function categoryLabel(category?: string) {
  return SUBJECT_CATEGORIES.find((item) => item.value === category)?.label || "General";
}
