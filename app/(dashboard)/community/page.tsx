"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Loader2, MessagesSquare, Plus } from "lucide-react";

type Topic = {
  id: string;
  key: string;
  label: string;
  description: string;
};

type Thread = {
  id: string;
  title: string;
  replyCount: number;
  isSticky?: boolean;
  lastReplyAt?: string | null;
  createdAt?: string;
  topic?: { key: string; label: string } | null;
  author?: { name?: string } | null;
};

export default function CommunityHomePage() {
  const { data: session } = useSession();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/community/topics").then((r) => r.json()),
      fetch("/api/community/threads?limit=20").then((r) => r.json()),
    ])
      .then(([t, th]) => {
        setTopics(t.topics || []);
        setThreads(th.threads || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Community</h1>
          <p className="text-sm text-slate-500 mt-1">
            Ask doubts, share tips, and help classmates.
          </p>
        </div>
        {session?.user ? (
          <Link
            href="/community/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New thread
          </Link>
        ) : (
          <Link
            href="/login?callbackUrl=/community/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700"
          >
            Sign in to post
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : (
        <>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Topics
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/community/${topic.key}`}
                  className="block bg-white border border-slate-100 rounded-xl p-4 hover:border-violet-200 hover:shadow-sm transition"
                >
                  <p className="font-semibold text-slate-900">{topic.label}</p>
                  {topic.description ? (
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                      {topic.description}
                    </p>
                  ) : null}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
              Recent threads
            </h2>
            {threads.length === 0 ? (
              <div className="text-center py-12 bg-white border border-slate-100 rounded-2xl">
                <MessagesSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-600 font-medium">No threads yet</p>
                <p className="text-sm text-slate-500 mt-1">
                  Be the first to ask a question.
                </p>
              </div>
            ) : (
              <ul className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100">
                {threads.map((thread) => (
                  <li key={thread.id}>
                    <Link
                      href={`/community/thread/${thread.id}`}
                      className="flex items-start justify-between gap-3 px-4 py-3.5 hover:bg-slate-50/80"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate">
                          {thread.isSticky ? "📌 " : ""}
                          {thread.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {thread.topic?.label || "Topic"} ·{" "}
                          {thread.author?.name || "Member"} ·{" "}
                          {thread.replyCount || 0} replies
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
