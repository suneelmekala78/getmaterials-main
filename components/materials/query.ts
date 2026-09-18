import { buildSearchParams, type QueryParam } from "@/lib/filter-list";

export type MaterialsQuery = {
  type?: QueryParam;
  category?: QueryParam;
  subject?: QueryParam;
  q?: string;
  tag?: string;
  sort?: string;
  view?: string;
  page?: string;
  semester?: QueryParam;
  college?: QueryParam;
  chapter?: QueryParam;
  program?: QueryParam;
};

const KEYS = [
  "q",
  "type",
  "category",
  "subject",
  "tag",
  "sort",
  "view",
  "page",
  "semester",
  "college",
  "chapter",
  "program",
] as const;

export function materialsHref(
  current: MaterialsQuery,
  patch: Partial<MaterialsQuery> = {},
  basePath = "/materials"
) {
  const next: MaterialsQuery = { ...current, ...patch };
  if (!patch.page) next.page = undefined;
  const query = buildSearchParams(next, KEYS);
  const qs = query.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}
