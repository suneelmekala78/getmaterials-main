export type QueryParam = string | string[] | undefined | null;

export function parseList(value?: QueryParam): string[] {
  if (!value) return [];
  const parts = Array.isArray(value) ? value : [value];
  return [
    ...new Set(
      parts.flatMap((item) =>
        String(item)
          .split(/[,|]/)
          .map((part) => part.trim())
          .filter(Boolean)
      )
    ),
  ];
}

export function toggleCsv(current: QueryParam, value: string): string[] {
  const list = parseList(current);
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function listHas(current: QueryParam, value: string): boolean {
  return parseList(current).includes(value);
}

const SINGLE_KEYS = new Set(["q", "sort", "view", "tag", "tab", "page"]);

export function buildSearchParams(
  values: Record<string, QueryParam>,
  keys: readonly string[]
): URLSearchParams {
  const query = new URLSearchParams();
  for (const key of keys) {
    const raw = values[key];
    if (raw == null || raw === "") continue;
    if (SINGLE_KEYS.has(key)) {
      const scalar = Array.isArray(raw) ? raw[0] : raw;
      if (scalar) query.set(key, String(scalar));
      continue;
    }
    for (const item of parseList(raw)) {
      query.append(key, item);
    }
  }
  return query;
}

export function firstParam(value?: QueryParam): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}
