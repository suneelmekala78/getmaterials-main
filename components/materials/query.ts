export type MaterialsQuery = {
  type?: string;
  category?: string;
  subject?: string;
  q?: string;
  tag?: string;
  sort?: string;
  view?: string;
  page?: string;
  semester?: string;
  college?: string;
};

const KEYS = ["q", "type", "category", "subject", "tag", "sort", "view", "semester", "college"] as const;

export function materialsHref(
  current: MaterialsQuery,
  patch: Partial<MaterialsQuery> = {}
) {
  const next: MaterialsQuery = { ...current, ...patch, page: undefined };
  const query = new URLSearchParams();
  KEYS.forEach((key) => {
    const value = next[key];
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return qs ? `/materials?${qs}` : "/materials";
}
