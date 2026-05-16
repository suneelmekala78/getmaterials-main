"use client";

import { useState, useEffect } from "react";
import { BarChart3, CheckCircle2, Loader2 } from "lucide-react";

interface Poll {
  _id: string;
  question: string;
  description?: string;
  type: "rating" | "yes_no" | "multiple_choice" | "text";
  options?: string[];
  createdAt: string;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data) => setPolls(data.polls || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (pollId: string) => {
    const answer = answers[pollId];
    if (!answer) return;
    setSubmitting(pollId);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId, answer }),
      });
      if (res.ok) {
        setSubmitted((prev) => ({ ...prev, [pollId]: true }));
      }
    } catch {
      // Handle error
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Polls & Feedback</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Share your thoughts and help us improve GetMaterials.
        </p>
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
        <div className="space-y-4">
          {polls.map((poll) => {
            const isSubmitted = submitted[poll._id];
            const answer = answers[poll._id] || "";

            return (
              <div
                key={poll._id}
                className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">📊</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Poll</span>
                </div>

                {isSubmitted ? (
                  <div className="flex items-center gap-3 py-4 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <div>
                      <p className="font-semibold text-sm">Thanks for your response!</p>
                      <p className="text-xs text-slate-500 mt-0.5">{poll.question}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-semibold text-slate-900">{poll.question}</p>
                      {poll.description && (
                        <p className="text-sm text-slate-500 mt-1">{poll.description}</p>
                      )}
                    </div>

                    {/* Yes / No */}
                    {poll.type === "yes_no" && (
                      <div className="flex gap-3">
                        {["Yes", "No"].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [poll._id]: opt }))}
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

                    {/* Rating */}
                    {poll.type === "rating" && (
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button
                            key={n}
                            onClick={() => setAnswers((prev) => ({ ...prev, [poll._id]: String(n) }))}
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

                    {/* Multiple Choice */}
                    {poll.type === "multiple_choice" && poll.options && (
                      <div className="space-y-2">
                        {poll.options.map((opt) => (
                          <button
                            key={opt}
                            onClick={() => setAnswers((prev) => ({ ...prev, [poll._id]: opt }))}
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

                    {/* Text */}
                    {poll.type === "text" && (
                      <textarea
                        value={answer}
                        onChange={(e) => setAnswers((prev) => ({ ...prev, [poll._id]: e.target.value }))}
                        rows={3}
                        placeholder="Share your thoughts..."
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 resize-none"
                      />
                    )}

                    <button
                      onClick={() => handleSubmit(poll._id)}
                      disabled={!answer || submitting === poll._id}
                      className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting === poll._id ? "Submitting..." : "Submit"}
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
