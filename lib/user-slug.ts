export function baseUserSlug(name: string) {
  return (
    String(name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'user'
  );
}

export async function uniqueUserSlug(
  findTaken: (slug: string) => Promise<boolean>,
  name: string,
  excludeId?: string,
) {
  const base = baseUserSlug(name);
  let slug = base;
  let n = 2;
  while (await findTaken(slug)) {
    slug = `${base}-${n++}`;
  }
  void excludeId;
  return slug;
}
