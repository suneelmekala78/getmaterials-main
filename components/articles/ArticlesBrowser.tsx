"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Newspaper, Search } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverUrl?: string;
  tags: string[];
  views: number;
  publishedAt?: string | null;
  author?: { name?: string; avatar?: string } | null;
};

type SubjectOption = { id: string; name: string };

export function ArticlesBrowser() {
  const searchParams = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [tag, setTag] = useState(searchParams.get("tag") || "");
  const [subject, setSubject] = useState(searchParams.get("subject") || "");

  useEffect(() => {
    fetch("/api/subjects")
      .then((r) => r.json())
      .then((data) => {
        const list = (data.subjects || data || []).map((s: any) => ({
          id: String(s._id || s.id),
          name: s.name || "Subject",
        }));
        setSubjects(list.slice(0, 80));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (tag.trim()) params.set("tag", tag.trim());
    if (subject.trim()) params.set("subject", subject.trim());
    const t = setTimeout(() => {
      setLoading(true);
      fetch(`/api/articles?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => setArticles(data.articles || []))
        .catch(() => setArticles([]))
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, tag, subject]);

  const allTags = Array.from(
    new Set(articles.flatMap((a) => a.tags || [])),
  ).slice(0, 16);

  return (
    <main className="font-marketing">
      <section className="relative overflow-hidden bg-gradient-soft">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 20% 10%, rgba(177,0,255,0.12), transparent), radial-gradient(ellipse 50% 40% at 90% 80%, rgba(99,102,241,0.1), transparent)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-14 pb-12 md:pt-16 md:pb-14 text-center">
          <p className="text-[var(--primary)] font-bold text-sm uppercase tracking-[0.18em] mb-3">
            Articles
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            Study tips &amp;{" "}
            <span className="text-[var(--primary)]">smart notes</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Long-form guides from teachers — exam strategy, subject deep-dives,
            and campus know-how.
          </p>
        </div>
      </section>

      <section className="section !pt-8 !pb-16">
        <div className="max-w-7xl mx-auto px-5 sm:px-6 space-y-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            {subjects.length > 0 ? (
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="sm:w-56 border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white"
              >
                <option value="">All subjects</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            ) : null}
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  type="button"
                  onClick={() => setTag("")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                    !tag
                      ? "bg-violet-50 border-violet-200 text-violet-700"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  All
                </button>
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTag(t === tag ? "" : t)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                      tag === t
                        ? "bg-violet-50 border-violet-200 text-violet-700"
                        : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20">
              <Newspaper className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No articles yet</p>
              <p className="text-sm text-slate-500 mt-1">
                Check back soon for study guides from teachers.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {articles.map((article) => (
                <Link
                  key={article.id}
                  href={`/articles/${article.slug}`}
                  className="group block bg-white border border-slate-100 rounded-2xl overflow-hidden hover:border-violet-200 hover:shadow-md transition"
                >
                  {article.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={article.coverUrl}
                      alt=""
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-violet-50 to-slate-50 flex items-center justify-center">
                      <Newspaper className="w-8 h-8 text-violet-300" />
                    </div>
                  )}
                  <div className="p-5">
                    <h2 className="font-bold text-slate-900 group-hover:text-violet-700 transition line-clamp-2">
                      {article.title}
                    </h2>
                    {article.excerpt ? (
                      <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                        {article.excerpt}
                      </p>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{article.author?.name || "Author"}</span>
                      <span>{article.views || 0} views</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
