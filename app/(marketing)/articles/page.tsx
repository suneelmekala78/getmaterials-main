import type { Metadata } from "next";
import { Suspense } from "react";
import { listingMetadata } from "@/lib/seo";
import { ArticlesBrowser } from "@/components/articles/ArticlesBrowser";

export const metadata: Metadata = listingMetadata({
  title: "Articles — Study tips & guides | GetMaterials",
  description:
    "Read educational articles, study tips, and smart notes from teachers on GetMaterials.",
  path: "/articles",
  keywords: ["study articles", "study tips", "GetMaterials articles"],
});

export default function ArticlesPage() {
  return (
    <Suspense fallback={<main className="min-h-[40vh]" />}>
      <ArticlesBrowser />
    </Suspense>
  );
}
