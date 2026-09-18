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

export function listingMetadata({
  title,
  description,
  path,
  keywords,
}: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
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
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}
