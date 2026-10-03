/** Campus illustration used when a college has no banner. */
export const DEFAULT_COLLEGE_BANNER = "/images/default-collage-banner.png";
/** Campus mark used when a college has no logo. */
export const DEFAULT_COLLEGE_LOGO = "/images/default-collage-logo.png";

export function externalHref(value?: string | null) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) return raw;
  return `https://${raw}`;
}

export function collegeLogoSrc(logo?: string | null) {
  const value = String(logo || "").trim();
  return value || DEFAULT_COLLEGE_LOGO;
}

export function collegeBannerSrc(banner?: string | null) {
  const value = String(banner || "").trim();
  return value || DEFAULT_COLLEGE_BANNER;
}

export function collegePlace(college: {
  city?: string | null;
  state?: string | null;
  location?: string | null;
}) {
  const parts = [college.city, college.state].map((part) => String(part || "").trim()).filter(Boolean);
  if (parts.length) return parts.join(", ");
  return String(college.location || "").trim();
}
