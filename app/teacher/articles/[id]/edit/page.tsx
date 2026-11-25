"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ArticleEditor } from "@/components/articles/ArticleEditor";

export default function EditArticlePage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/articles/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((data) => setArticle(data.article))
      .catch(() => setError("Article not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }
  if (error || !article) {
    return <p className="text-center text-slate-500 py-20">{error || "Not found"}</p>;
  }

  return <ArticleEditor mode="edit" initial={article} />;
}
