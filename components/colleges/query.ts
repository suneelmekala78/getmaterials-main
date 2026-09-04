import { buildSearchParams, type QueryParam } from "@/lib/filter-list";

export type CollegesQuery = {
  q?: string;
  location?: QueryParam;
  branch?: QueryParam;
  program?: QueryParam;
  sort?: string;
  view?: string;
  tab?: string;
  page?: string;
};

const KEYS = ["q", "location", "branch", "program", "sort", "view", "tab", "page"] as const;

export function collegesHref(current: CollegesQuery, patch: Partial<CollegesQuery> = {}) {
  const next: CollegesQuery = { ...current, ...patch };
  if (!patch.page) next.page = undefined;
  const query = buildSearchParams(next, KEYS);
  const qs = query.toString();
  return qs ? `/colleges?${qs}` : "/colleges";
}

export function formatCount(value: number) {
  if (value >= 100000) return `${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  return String(value);
}

export function timeAgo(date: Date | string) {
  const then = new Date(date).getTime();
  const days = Math.max(0, Math.floor((Date.now() - then) / 86400000));
  if (days < 1) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "1 month ago";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
