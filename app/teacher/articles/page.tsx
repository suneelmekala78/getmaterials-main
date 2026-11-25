"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Newspaper, Plus, Pencil, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views: number;
  updatedAt?: string;
  publishedAt?: string | null;
};

export default function TeacherArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fetch("/api/articles?mine=1")
      .then((r) => r.json())
      .then((data) => setArticles(data.articles || []))
      .catch(() => toast.error("Failed to load articles"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("Delete this article?")) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Could not delete");
      return;
    }
    toast.success("Deleted");
    load();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My articles</h1>
          <p className="text-sm text-slate-500 mt-1">
            Write study guides and tips for students.
          </p>
        </div>
        <Link
          href="/teacher/articles/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> New article
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-16 text-center">
          <Newspaper className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-800">No articles yet</p>
          <Link
            href="/teacher/articles/new"
            className="inline-block mt-4 text-sm font-semibold text-violet-600 hover:underline"
          >
            Write your first article
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {articles.map((a) => (
            <li
              key={a.id}
              className="bg-white border border-slate-100 rounded-xl p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <Link
                  href={`/articles/${a.slug}`}
                  className="font-semibold text-slate-900 hover:text-violet-700 truncate block"
                >
                  {a.title}
                </Link>
                <p className="text-xs text-slate-500 mt-1">
                  <span
                    className={
                      a.status === "published"
                        ? "text-emerald-600 font-medium"
                        : "text-amber-600 font-medium"
                    }
                  >
                    {a.status}
                  </span>
                  {" · "}
                  {a.views || 0} views
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/teacher/articles/${a.id}/edit`}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-violet-600"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  className="p-2 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
