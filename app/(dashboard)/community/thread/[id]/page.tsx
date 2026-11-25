"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, ThumbsUp, Flag } from "lucide-react";
import toast from "react-hot-toast";

type Thread = {
  id: string;
  title: string;
  body: string;
  isLocked?: boolean;
  isSticky?: boolean;
  topic?: { key: string; label: string } | null;
  author?: { name?: string; slug?: string; id?: string } | null;
  createdAt?: string;
};

type Reply = {
  id: string;
  body: string;
  upvoteCount: number;
  upvotedByMe: boolean;
  isDeleted?: boolean;
  author?: { name?: string } | null;
  createdAt?: string;
};

export default function ThreadDetailPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const { data: session } = useSession();
  const [thread, setThread] = useState<Thread | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/community/threads/${id}`).then((r) => r.json()),
      fetch(`/api/community/threads/${id}/replies`).then((r) => r.json()),
    ])
      .then(([t, r]) => {
        setThread(t.thread || null);
        setReplies(r.replies || []);
      })
      .catch(() => toast.error("Failed to load thread"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const postReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      toast.error("Sign in to reply");
      return;
    }
    if (!replyBody.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/community/threads/${id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: replyBody }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error || "Could not reply");
        return;
      }
      setReplyBody("");
      setReplies((prev) => [...prev, data.reply]);
      toast.success("Reply posted");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSending(false);
    }
  };

  const upvote = async (replyId: string) => {
    if (!session?.user) {
      toast.error("Sign in to upvote");
      return;
    }
    const res = await fetch(`/api/community/replies/${replyId}/upvote`, {
      method: "POST",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(data.error || "Could not upvote");
      return;
    }
    setReplies((prev) =>
      prev.map((r) => (r.id === replyId ? data.reply : r)),
    );
  };

  const reportThread = async () => {
    if (!session?.user) {
      toast.error("Sign in to report");
      return;
    }
    const res = await fetch(`/api/community/threads/${id}/report`, {
      method: "POST",
    });
    if (res.ok) toast.success("Reported — thanks");
    else toast.error("Could not report");
  };

  const reportReply = async (replyId: string) => {
    if (!session?.user) {
      toast.error("Sign in to report");
      return;
    }
    const res = await fetch(`/api/community/replies/${replyId}/report`, {
      method: "POST",
    });
    if (res.ok) toast.success("Reported — thanks");
    else toast.error("Could not report");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return <p className="text-center text-slate-500 py-20">Thread not found</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <Link
          href={
            thread.topic?.key
              ? `/community/${thread.topic.key}`
              : "/community"
          }
          className="text-sm text-violet-600 hover:underline"
        >
          ← {thread.topic?.label || "Community"}
        </Link>
        <div className="mt-2 flex items-start justify-between gap-3">
          <h1 className="text-2xl font-bold text-slate-900">
            {thread.isSticky ? "📌 " : ""}
            {thread.title}
          </h1>
          <button
            type="button"
            onClick={reportThread}
            className="shrink-0 text-xs text-slate-400 hover:text-red-600 inline-flex items-center gap-1"
          >
            <Flag className="w-3.5 h-3.5" /> Report
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {thread.author?.name || "Member"}
          {thread.createdAt
            ? ` · ${new Date(thread.createdAt).toLocaleString("en-IN")}`
            : ""}
          {thread.isLocked ? " · Locked" : ""}
        </p>
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-5 whitespace-pre-wrap text-slate-800 leading-relaxed">
        {thread.body}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Replies ({replies.length})
        </h2>
        {replies.length === 0 ? (
          <p className="text-sm text-slate-500">No replies yet.</p>
        ) : (
          <ul className="space-y-3">
            {replies.map((reply) => (
              <li
                key={reply.id}
                className="bg-white border border-slate-100 rounded-xl p-4"
              >
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-2">
                  <span>{reply.author?.name || "Member"}</span>
                  <button
                    type="button"
                    onClick={() => reportReply(reply.id)}
                    className="hover:text-red-600"
                  >
                    Report
                  </button>
                </div>
                <p className="text-slate-800 whitespace-pre-wrap text-sm leading-relaxed">
                  {reply.body}
                </p>
                {!reply.isDeleted ? (
                  <button
                    type="button"
                    onClick={() => upvote(reply.id)}
                    className={`mt-3 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg border ${
                      reply.upvotedByMe
                        ? "border-violet-200 bg-violet-50 text-violet-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {reply.upvoteCount || 0}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {thread.isLocked ? (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          This thread is locked. New replies are disabled.
        </p>
      ) : session?.user ? (
        <form onSubmit={postReply} className="space-y-3">
          <textarea
            value={replyBody}
            onChange={(e) => setReplyBody(e.target.value)}
            rows={4}
            placeholder="Write a reply..."
            className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
          />
          <button
            type="submit"
            disabled={sending}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold disabled:opacity-60"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Post reply
          </button>
        </form>
      ) : (
        <p className="text-sm text-slate-500">
          <Link href={`/login?callbackUrl=/community/thread/${id}`} className="text-violet-600 font-medium hover:underline">
            Sign in
          </Link>{" "}
          to reply.
        </p>
      )}
    </div>
  );
}
