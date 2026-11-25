import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { listingMetadata } from "@/lib/seo";
import { resolveApiOrigin } from "@/lib/api-origin";
import { sanitizeHtml } from "@/lib/sanitize-html";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl?: string;
  tags: string[];
  views: number;
  publishedAt?: string | null;
  author?: {
    id?: string;
    name?: string;
    avatar?: string;
    role?: string;
    slug?: string;
  } | null;
};

async function loadArticle(slug: string) {
  try {
    const res = await fetch(
      `${resolveApiOrigin()}/api/articles/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    return res.json() as Promise<{ article: Article; related: Article[] }>;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await loadArticle(slug);
  if (!data?.article) {
    return { title: "Article not found — GetMaterials" };
  }
  return listingMetadata({
    title: `${data.article.title} — GetMaterials`,
    description: data.article.excerpt || data.article.title,
    path: `/articles/${data.article.slug}`,
  });
}

export default async function ArticleDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await loadArticle(slug);
  if (!data?.article) notFound();
  const { article, related } = data;

  return (
    <main className="font-marketing">
      <article className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-16">
        <Link
          href="/articles"
          className="text-sm text-violet-600 hover:underline font-medium"
        >
          ← All articles
        </Link>
        <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          {article.author ? (
            <Link
              href={
                article.author.slug
                  ? `/users/${article.author.slug}`
                  : `/users/${article.author.id}`
              }
              className="font-medium text-slate-700 hover:text-violet-600"
            >
              {article.author.name}
            </Link>
          ) : null}
          {article.publishedAt ? (
            <span>
              {new Date(article.publishedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          ) : null}
          <span>{article.views || 0} views</span>
        </div>
        {article.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverUrl}
            alt=""
            className="mt-8 w-full max-h-[420px] object-cover rounded-2xl"
          />
        ) : null}
        {article.excerpt ? (
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            {article.excerpt}
          </p>
        ) : null}
        <div
          className="mt-8 prose prose-slate max-w-none prose-headings:font-bold prose-a:text-violet-600"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.bodyHtml) }}
        />
        {article.tags?.length ? (
          <div className="mt-10 flex flex-wrap gap-2">
            {article.tags.map((t) => (
              <Link
                key={t}
                href={`/articles?tag=${encodeURIComponent(t)}`}
                className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 hover:bg-violet-50 hover:text-violet-700"
              >
                {t}
              </Link>
            ))}
          </div>
        ) : null}
      </article>

      {related?.length ? (
        <section className="border-t border-slate-100 bg-slate-50/50 py-12">
          <div className="max-w-3xl mx-auto px-5 sm:px-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Related articles
            </h2>
            <ul className="space-y-3">
              {related.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/articles/${r.slug}`}
                    className="font-medium text-violet-700 hover:underline"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </main>
  );
}
