"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Loader2, Plus } from "lucide-react";

type Thread = {
  id: string;
  title: string;
  replyCount: number;
  isSticky?: boolean;
  isLocked?: boolean;
  author?: { name?: string } | null;
  createdAt?: string;
};

export default function CommunityTopicPage() {
  const params = useParams();
  const topicKey = String(params?.topic || "");
  const { data: session } = useSession();
  const [label, setLabel] = useState(topicKey);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!topicKey) return;
    setLoading(true);
    Promise.all([
      fetch("/api/community/topics").then((r) => r.json()),
      fetch(`/api/community/threads?topic=${encodeURIComponent(topicKey)}`).then(
        (r) => r.json(),
      ),
    ])
      .then(([t, th]) => {
        const topic = (t.topics || []).find(
          (x: { key: string }) => x.key === topicKey,
        );
        if (topic) setLabel(topic.label);
        setThreads(th.threads || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [topicKey]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div>
          <Link href="/community" className="text-sm text-violet-600 hover:underline">
            ← Community
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{label}</h1>
        </div>
        {session?.user ? (
          <Link
            href={`/community/new?topic=${encodeURIComponent(topicKey)}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> New thread
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
        </div>
      ) : threads.length === 0 ? (
        <p className="text-center text-slate-500 py-12">No threads in this topic yet.</p>
      ) : (
        <ul className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100">
          {threads.map((thread) => (
            <li key={thread.id}>
              <Link
                href={`/community/thread/${thread.id}`}
                className="block px-4 py-3.5 hover:bg-slate-50/80"
              >
                <p className="font-medium text-slate-900">
                  {thread.isSticky ? "📌 " : ""}
                  {thread.title}
                  {thread.isLocked ? " 🔒" : ""}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {thread.author?.name || "Member"} · {thread.replyCount || 0}{" "}
                  replies
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
