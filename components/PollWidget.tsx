"use client";

import { useState, useEffect } from "react";

interface Poll {
  _id: string;
  question: string;
  description?: string;
  type: "rating" | "yes_no" | "multiple_choice" | "text";
  options?: string[];
}

export function PollWidget() {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/polls")
      .then((r) => r.json())
      .then((data) => {
        if (data.polls?.length > 0) {
          setPoll(data.polls[0]); // Show the latest unanswered poll
        }
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!poll || !answer) return;
    setLoading(true);
    try {
      const res = await fetch("/api/polls", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pollId: poll._id, answer }),
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  if (!poll) return null;

  if (submitted) {
    return (
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-5 text-center">
        <span className="text-2xl">🙏</span>
        <p className="text-sm font-medium text-violet-700 mt-2">Thanks for your feedback!</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-100 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">📊</span>
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-600">Quick Poll</span>
      </div>

      <p className="font-semibold text-slate-900 text-sm">{poll.question}</p>
      {poll.description && (
        <p className="text-xs text-slate-500">{poll.description}</p>
      )}

      {/* Yes/No */}
      {poll.type === "yes_no" && (
        <div className="flex gap-2">
          {["Yes", "No"].map((opt) => (
            <button
              key={opt}
              onClick={() => setAnswer(opt)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg border-2 transition ${
                answer === opt
                  ? "border-violet-500 bg-violet-100 text-violet-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* Rating */}
      {poll.type === "rating" && (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setAnswer(String(n))}
              className={`w-10 h-10 rounded-lg text-lg transition ${
                answer === String(n)
                  ? "bg-violet-500 text-white scale-110"
                  : "bg-white border border-slate-200 hover:border-violet-300"
              }`}
            >
              {"⭐"}
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
              onClick={() => setAnswer(opt)}
              className={`w-full text-left px-4 py-2.5 text-sm rounded-lg border-2 transition ${
                answer === opt
                  ? "border-violet-500 bg-violet-100 text-violet-700 font-medium"
                  : "border-slate-200 bg-white text-slate-600 hover:border-violet-300"
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
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your response..."
          rows={2}
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-violet-500 resize-none"
        />
      )}

      <button
        onClick={handleSubmit}
        disabled={!answer || loading}
        className="w-full py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 disabled:opacity-50 transition"
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </div>
  );
}
