"use client";

import { useState, useEffect } from "react";
import { BarChart3, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface Poll {
  _id: string;
  question: string;
  description?: string;
  type: "rating" | "yes_no" | "multiple_choice" | "text";
  options?: string[];
  createdAt: string;
}

export default function TeacherPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());

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
        setSubmitted((prev) => new Set([...prev, pollId]));
        setPolls((prev) => prev.filter((p) => p._id !== pollId));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit poll response");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Polls</h1>
        <p className="text-slate-500 mt-1 text-sm">
          Share your feedback and help improve GetMaterials.
        </p>
      </div>

      {polls.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-7 h-7 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-1">No active polls</h3>
          <p className="text-sm text-slate-500">
            You&apos;ve responded to all available polls. Check back later!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div key={poll._id} className="bg-white rounded-xl border border-slate-100 p-6">
              <h3 className="font-semibold text-slate-900 text-lg">{poll.question}</h3>
              {poll.description && (
                <p className="text-sm text-slate-500 mt-1">{poll.description}</p>
              )}

              <div className="mt-4">
                {poll.type === "yes_no" && (
                  <div className="flex gap-3">
                    {["Yes", "No"].map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [poll._id]: opt })}
                        className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition ${
                          answers[poll._id] === opt
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {poll.type === "rating" && (
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setAnswers({ ...answers, [poll._id]: String(n) })}
                        className={`w-10 h-10 rounded-lg text-sm font-medium border transition ${
                          answers[poll._id] === String(n)
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}

                {poll.type === "multiple_choice" && poll.options && (
                  <div className="space-y-2">
                    {poll.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setAnswers({ ...answers, [poll._id]: opt })}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition ${
                          answers[poll._id] === opt
                            ? "bg-violet-600 text-white border-violet-600"
                            : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}

                {poll.type === "text" && (
                  <textarea
                    value={answers[poll._id] || ""}
                    onChange={(e) => setAnswers({ ...answers, [poll._id]: e.target.value })}
                    placeholder="Type your response..."
                    rows={3}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 resize-none"
                  />
                )}
              </div>

              <div className="mt-4">
                <button
                  onClick={() => handleSubmit(poll._id)}
                  disabled={!answers[poll._id] || submitting === poll._id}
                  className="px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-50 transition"
                >
                  {submitting === poll._id ? "Submitting..." : "Submit Response"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
