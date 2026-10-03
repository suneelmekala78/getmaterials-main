"use client";

import { Suspense, useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface Poll {
  _id: string;
  question: string;
  slug?: string;
  description?: string;
  type: "rating" | "yes_no" | "multiple_choice" | "text";
  options?: string[];
  thumbnailUrl?: string;
  createdAt: string;
  answered?: boolean;
  myAnswer?: string;
}

const typeLabels: Record<Poll["type"], string> = {
  rating: "Rating",
  yes_no: "Yes / No",
  multiple_choice: "Multiple choice",
  text: "Open text",
};

function pollKey(poll: Poll) {
  return poll.slug || poll._id;
}

function PollsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const loggedIn = status === "authenticated";

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const pollParam = searchParams.get("poll");

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data) => setPolls(data.polls || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || !pollParam || polls.length === 0) return;
    const idx = polls.findIndex(
      (p) => p.slug === pollParam || p._id === pollParam,
    );
    if (idx >= 0) setActiveIndex(idx);
  }, [loading, pollParam, polls]);

  const activePoll = activeIndex !== null ? polls[activeIndex] : null;

  useEffect(() => {
    if (!activePoll) {
      setAnswer("");
      return;
    }
    setAnswer(activePoll.answered && activePoll.myAnswer ? activePoll.myAnswer : "");
  }, [activePoll?._id, activePoll?.answered, activePoll?.myAnswer]);

  const syncUrl = useCallback(
    (poll: Poll | null) => {
      if (poll) {
        router.replace(`/polls?poll=${encodeURIComponent(pollKey(poll))}`, {
          scroll: false,
        });
      } else {
        router.replace("/polls", { scroll: false });
      }
    },
    [router],
  );

  const openPoll = (index: number) => {
    setActiveIndex(index);
    syncUrl(polls[index]);
  };

  const closeModal = () => {
    setActiveIndex(null);
    syncUrl(null);
  };

  const goPrev = () => {
    if (activeIndex === null || polls.length === 0) return;
    const next = (activeIndex - 1 + polls.length) % polls.length;
    setActiveIndex(next);
    syncUrl(polls[next]);
  };

  const goNext = () => {
    if (activeIndex === null || polls.length === 0) return;
    const next = (activeIndex + 1) % polls.length;
    setActiveIndex(next);
    syncUrl(polls[next]);
  };

  useEffect(() => {
    if (activeIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, polls]);

  const handleSubmit = async () => {
    if (!answer || !activePoll) return;
    const callback = `/polls?poll=${encodeURIComponent(pollKey(activePoll))}`;
    if (!loggedIn) {
      window.location.href = `/login?callbackUrl=${encodeURIComponent(callback)}`;
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: activePoll._id, answer }),
      });
      if (res.ok) {
        setPolls((prev) =>
          prev.map((p) =>
            p._id === activePoll._id
              ? { ...p, answered: true, myAnswer: answer }
              : p,
          ),
        );
        toast.success("Thanks for your response!");
      } else if (res.status === 401) {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(callback)}`;
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit poll response");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = useMemo(
    () => polls.filter((p) => p.answered).length,
    [polls],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-sm text-slate-400 mb-4">
        <Link href="/" className="hover:text-[var(--primary)]">
          Home
        </Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">Polls</span>
      </p>

      <div className="flex items-start gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center shrink-0">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Polls</h1>
          <p className="text-slate-500 mt-1">
            Share your thoughts and help us improve GetMaterials.
            {polls.length > 0 && (
              <span className="text-slate-400">
                {" "}
                · {answeredCount}/{polls.length} answered
              </span>
            )}
          </p>
        </div>
      </div>

      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No polls right now</h3>
          <p className="text-sm text-slate-500">Check back later for new feedback questions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {polls.map((poll, index) => {
            const thumb = poll.thumbnailUrl || "/images/default-poll.png";
            const answered = Boolean(poll.answered);
            return (
              <button
                key={poll._id}
                type="button"
                onClick={() => openPoll(index)}
                className={`text-left bg-white rounded-2xl overflow-hidden flex flex-col transition-shadow hover:shadow-md ${
                  answered
                    ? "border-2 border-emerald-200"
                    : "border border-slate-100"
                }`}
              >
                <div className="relative aspect-[16/9] bg-slate-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb} alt="" className="h-full w-full object-cover" />
                  {answered && (
                    <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Answered
                    </span>
                  )}
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className="inline-flex self-start px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold">
                    {typeLabels[poll.type]}
                  </span>
                  <h3
                    className={`mt-2 font-bold leading-snug line-clamp-2 ${
                      answered ? "text-slate-600" : "text-slate-900"
                    }`}
                  >
                    {poll.question}
                  </h3>
                  {poll.description && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{poll.description}</p>
                  )}
                  <div className="mt-auto pt-4">
                    {answered ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Answered
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-2 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] text-xs font-bold">
                        Vote
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activePoll && activeIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[21/9] bg-slate-50 shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePoll.thumbnailUrl || "/images/default-poll.png"}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={closeModal}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center hover:bg-white shadow"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-600" />
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                    {typeLabels[activePoll.type]}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  {activeIndex + 1} / {polls.length}
                </span>
              </div>

              {activePoll.answered ? (
                <div className="flex items-center gap-3 py-2 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">Thanks for your response!</p>
                    <p className="text-xs text-slate-500 mt-0.5">{activePoll.question}</p>
                    {activePoll.myAnswer && (
                      <p className="text-xs text-slate-600 mt-1">
                        Your answer: {activePoll.myAnswer}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      {activePoll.question}
                    </h2>
                    {activePoll.description && (
                      <p className="text-sm text-slate-500 mt-2">{activePoll.description}</p>
                    )}
                  </div>

                  {activePoll.type === "yes_no" && (
                    <div className="flex gap-3">
                      {["Yes", "No"].map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(opt)}
                          className={`flex-1 py-2.5 text-sm font-medium rounded-xl border-2 transition ${
                            answer === opt
                              ? "border-violet-500 bg-violet-50 text-violet-700"
                              : "border-slate-200 text-slate-600 hover:border-violet-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePoll.type === "rating" && (
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setAnswer(String(n))}
                          className={`w-12 h-12 rounded-xl text-xl transition ${
                            answer === String(n)
                              ? "bg-violet-500 text-white scale-110 shadow-md"
                              : "bg-slate-50 border border-slate-200 hover:border-violet-300"
                          }`}
                        >
                          ⭐
                        </button>
                      ))}
                    </div>
                  )}

                  {activePoll.type === "multiple_choice" && activePoll.options && (
                    <div className="space-y-2">
                      {activePoll.options.map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setAnswer(opt)}
                          className={`w-full text-left px-4 py-3 text-sm rounded-xl border-2 transition ${
                            answer === opt
                              ? "border-violet-500 bg-violet-50 text-violet-700 font-medium"
                              : "border-slate-200 text-slate-600 hover:border-violet-300"
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {activePoll.type === "text" && (
                    <textarea
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      rows={3}
                      placeholder="Share your thoughts..."
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                    />
                  )}

                  {loggedIn ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!answer || submitting}
                      className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  ) : (
                    <Link
                      href={`/login?callbackUrl=${encodeURIComponent(
                        `/polls?poll=${encodeURIComponent(pollKey(activePoll))}`,
                      )}`}
                      className="inline-flex px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
                    >
                      Login to vote
                    </Link>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={goPrev}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PollsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
        </div>
      }
    >
      <PollsPageInner />
    </Suspense>
  );
}
