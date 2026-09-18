import { buildSearchParams, type QueryParam } from "@/lib/filter-list";

export type QuizzesQuery = {
  q?: string;
  subject?: QueryParam;
  kind?: string;
  tab?: string;
  sort?: string;
  view?: string;
  page?: string;
};

const KEYS = ["q", "subject", "kind", "tab", "sort", "view", "page"] as const;

export function quizzesHref(current: QuizzesQuery, patch: Partial<QuizzesQuery> = {}) {
  const next: QuizzesQuery = { ...current, ...patch };
  if (!patch.page) next.page = undefined;
  const query = buildSearchParams(next, KEYS);
  const qs = query.toString();
  return qs ? `/quizzes?${qs}` : "/quizzes";
}

export function formatCount(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}
