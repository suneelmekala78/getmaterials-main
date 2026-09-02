export type QuizzesQuery = {
  q?: string;
  subject?: string;
  tab?: string;
  sort?: string;
  view?: string;
  page?: string;
};

const KEYS = ["q", "subject", "tab", "sort", "view"] as const;

export function quizzesHref(current: QuizzesQuery, patch: Partial<QuizzesQuery> = {}) {
  const next: QuizzesQuery = { ...current, ...patch, page: undefined };
  const query = new URLSearchParams();
  KEYS.forEach((key) => {
    const value = next[key];
    if (value) query.set(key, value);
  });
  if (patch.page && Number(patch.page) > 1) query.set("page", String(patch.page));
  const qs = query.toString();
  return qs ? `/quizzes?${qs}` : "/quizzes";
}

export function formatCount(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(value);
}
