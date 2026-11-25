"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { RichTextEditor } from "@/components/RichTextEditor";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  bodyHtml: string;
  coverUrl?: string;
  tags: string[];
  status: string;
  program?: string;
};

export function ArticleEditor({
  initial,
  mode,
}: {
  initial?: Article | null;
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [bodyHtml, setBodyHtml] = useState(initial?.bodyHtml || "");
  const [coverUrl, setCoverUrl] = useState(initial?.coverUrl || "");
  const [tags, setTags] = useState((initial?.tags || []).join(", "));
  const [program, setProgram] = useState(initial?.program || "");
  const [status, setStatus] = useState<"draft" | "published">(
    (initial?.status as "draft" | "published") || "draft",
  );
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim() || !bodyHtml.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim(),
        bodyHtml,
        coverUrl: coverUrl.trim(),
        tags,
        program: program.trim(),
        status,
      };
      const res = await fetch(
        mode === "edit" ? `/api/articles/${initial!.id}` : "/api/articles",
        {
          method: mode === "edit" ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not save");
        return;
      }
      toast.success(status === "published" ? "Published" : "Saved as draft");
      router.push("/teacher/articles");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link
            href="/teacher/articles"
            className="text-sm text-violet-600 hover:underline"
          >
            ← My articles
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {mode === "edit" ? "Edit article" : "New article"}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-white border border-slate-100 rounded-2xl p-5">
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            placeholder="Article title"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Excerpt</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            rows={2}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            placeholder="Short summary for cards and SEO"
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Cover image URL
            </label>
            <input
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              placeholder="https://..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Tags (comma-separated)
            </label>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
              placeholder="exams, tips, semester-1"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">
            Program (optional)
          </label>
          <input
            value={program}
            onChange={(e) => setProgram(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            placeholder="btech, mba..."
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700 mb-2 block">
            Body
          </label>
          <RichTextEditor
            content={bodyHtml}
            onChange={setBodyHtml}
            placeholder="Write your article..."
          />
        </div>
      </div>
    </div>
  );
}
