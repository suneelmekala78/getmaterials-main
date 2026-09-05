import { College } from "@/lib/database";

export function collegePathKey(college: { slug?: string; code?: string; _id?: unknown; id?: string }) {
  return String(college.slug || college.code || college.id || college._id || "").trim();
}

export function collegeHref(college: { slug?: string; code?: string; _id?: unknown; id?: string }) {
  return `/colleges/${encodeURIComponent(collegePathKey(college))}`;
}

export function looksLikeObjectId(value: string) {
  return /^[a-f0-9]{24}$/i.test(value);
}

/** Teachers assigned in admin (assignedColleges) or with a primary college. */
export function teachersAtCollegeFilter(collegeId: unknown) {
  return {
    $or: [{ college: collegeId }, { assignedColleges: collegeId }],
  };
}

function baseCollegeSlug(name: string) {
  return (
    String(name || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "college"
  );
}

export async function uniqueCollegeSlug(name: string, excludeId?: string) {
  const base = baseCollegeSlug(name);
  let slug = base;
  let n = 2;
  while (true) {
    const existing = await College.findOne({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
      .select("_id")
      .lean();
    if (!existing) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function ensureCollegeSlug(college: {
  _id: unknown;
  name?: string;
  slug?: string;
  code?: string;
}) {
  if (college.slug) return college.slug;
  const fromCode = String(college.code || "")
    .trim()
    .toLowerCase();
  let slug = fromCode;
  if (slug) {
    const taken = await College.findOne({
      slug,
      _id: { $ne: college._id },
    })
      .select("_id")
      .lean();
    if (taken) slug = "";
  }
  if (!slug) slug = await uniqueCollegeSlug(String(college.name || "college"), String(college._id));
  await College.updateOne({ _id: college._id }, { slug });
  return slug;
}

export async function findCollegeByKey(key: string, extra: Record<string, unknown> = {}) {
  const raw = decodeURIComponent(String(key || "")).trim();
  if (!raw) return null;
  const or: Record<string, unknown>[] = [
    { slug: raw.toLowerCase() },
    { code: raw.toUpperCase() },
  ];
  if (looksLikeObjectId(raw)) or.push({ _id: raw });
  return College.findOne({ ...extra, $or: or });
}
