import type { Metadata } from "next";

export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://getmaterials.in"
).replace(/\/$/, "");
export const SITE_NAME = "GetMaterials";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const DEFAULT_OG_IMAGE = {
  url: absoluteUrl("/images/hero.png"),
  width: 1200,
  height: 630,
  alt: "GetMaterials — Free study materials for students in India",
};

export const DEFAULT_QUIZ_IMAGE = absoluteUrl("/images/default-quiz.png");
export const DEFAULT_POLL_IMAGE = absoluteUrl("/images/default-poll.png");
export const DEFAULT_COLLEGE_IMAGE = absoluteUrl("/images/default-collage-banner.png");
export const DEFAULT_SUBJECT_IMAGE = absoluteUrl("/images/default-subject.png");
export const DEFAULT_THUMBNAIL_IMAGE = absoluteUrl("/images/default-thumbnail.png");

export function plainText(value?: string | null, max = 200) {
  const text = String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

/** Absolute image URL for WhatsApp / Facebook / X. Omit guessed dimensions. */
export function ogImages(src: string | null | undefined, alt: string, fallback?: string) {
  const chosen = String(src || "").trim() || fallback || DEFAULT_OG_IMAGE.url;
  const url = absoluteUrl(chosen);
  const image: { url: string; alt: string; type?: string } = { url, alt };
  const ext = url.split("?")[0].split(".").pop()?.toLowerCase();
  if (ext === "jpg" || ext === "jpeg") image.type = "image/jpeg";
  else if (ext === "png") image.type = "image/png";
  else if (ext === "webp") image.type = "image/webp";
  else if (ext === "gif") image.type = "image/gif";
  return image;
}

export function isMediaUrl(value?: string | null) {
  const raw = String(value || "").trim();
  return raw.startsWith("/") || /^https?:\/\//i.test(raw);
}

export function listingMetadata({
  title,
  description,
  path,
  keywords,
  image,
  imageAlt,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  image?: string | null;
  imageAlt?: string;
}): Metadata {
  const url = absoluteUrl(path);
  const picture = ogImages(image, imageAlt || title);
  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: "en_IN",
      images: [picture],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [picture.url],
    },
  };
}
