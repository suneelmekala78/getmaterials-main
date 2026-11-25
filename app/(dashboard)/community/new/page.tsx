"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

type Topic = { key: string; label: string };

function NewThreadForm() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const search = useSearchParams();
  const initialTopic = search.get("topic") || "general";
  const subjectId = search.get("subject") || "";
  const [topics, setTopics] = useState<Topic[]>([]);
  const [topic, setTopic] = useState(initialTopic);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login?callbackUrl=/community/new");
    }
  }, [status, router]);

  useEffect(() => {
    fetch("/api/community/topics")
      .then((r) => r.json())
      .then((data) => {
        const list = data.topics || [];
        setTopics(list);
        if (!list.find((t: Topic) => t.key === topic) && list[0]) {
          setTopic(list[0].key);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/community/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          title,
          body,
          ...(subjectId ? { subject: subjectId } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not create thread");
        return;
      }
      toast.success("Thread posted");
      router.push(`/community/thread/${data.thread.id}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (status === "loading" || !session?.user) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-10">
      <div>
        <Link href="/community" className="text-sm text-violet-600 hover:underline">
          ← Community
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">New thread</h1>
        {subjectId ? (
          <p className="text-sm text-slate-500 mt-1">
            Linked to your My Semester subject.
          </p>
        ) : null}
      </div>
      <form
        onSubmit={submit}
        className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4"
      >
        <div>
          <label className="text-sm font-medium text-slate-700">Topic</label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          >
            {topics.map((t) => (
              <option key={t.key} value={t.key}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            placeholder="What's your question?"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Details</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={8}
            className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
            placeholder="Share context so others can help..."
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Post thread
        </button>
      </form>
    </div>
  );
}

export default function NewThreadPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      }
    >
      <NewThreadForm />
    </Suspense>
  );
}
