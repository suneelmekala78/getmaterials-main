"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Trophy,
  HelpCircle,
  Play,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Question {
  question: string;
  options: string[];
}

interface Quiz {
  _id: string;
  title: string;
  description?: string;
  subject?: { name: string };
  chapter?: { title: string };
  duration: number;
  questions: Question[];
  passingScore: number;
  thumbnailUrl?: string;
  kind?: string;
}

interface Result {
  question: string;
  yourAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation?: string;
}

function kindLabel(kind?: string) {
  if (kind === "general_knowledge") return "General knowledge";
  if (kind === "other") return "Other";
  if (kind === "subject") return "Subject";
  return null;
}

export default function QuizTakePage() {
  const params = useParams();
  const quizParam = params.slug as string;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<{
    score: number;
    correct: number;
    total: number;
    passed: boolean;
    results: Result[];
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const looksLikeId = /^[a-f0-9]{24}$/i.test(quizParam || "");
    const query = looksLikeId
      ? `id=${encodeURIComponent(quizParam)}`
      : `slug=${encodeURIComponent(quizParam)}`;
    fetch(`/api/quizzes?${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.quiz) {
          setQuiz(data.quiz);
          setAnswers(new Array(data.quiz.questions.length).fill(null));
          setTimeLeft(data.quiz.duration * 60);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [quizParam]);

  useEffect(() => {
    if (!quiz || !started || results || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quiz, results, started]);

  const handleSubmit = async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);
    try {
      const elapsed = Math.max(1, quiz.duration * 60 - timeLeft);
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quizId: quiz._id,
          answers: answers.map((a) => a ?? -1),
          timeSpentSeconds: elapsed,
        }),
      });
      const data = await res.json();
      if (data.score !== undefined) {
        setResults(data);
      } else {
        toast.error(data.error || "Failed to submit quiz");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center text-slate-500">Loading quiz...</div>
    );
  }

  if (!quiz) {
    return (
      <div className="max-w-3xl mx-auto p-8 text-center">
        <p className="text-slate-500 mb-4">Quiz not found</p>
        <Link href="/quizzes" className="text-violet-600 font-medium hover:underline">
          ← Back to Quizzes
        </Link>
      </div>
    );
  }

  const thumb = quiz.thumbnailUrl || "/images/default-quiz.png";
  const kind = kindLabel(quiz.kind);

  if (results) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>

        <div className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              results.passed ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <Trophy className={`w-7 h-7 ${results.passed ? "text-green-600" : "text-red-500"}`} />
          </div>
          <h2 className="text-2xl font-bold mb-2">
            {results.passed ? "Congratulations!" : "Keep Practicing!"}
          </h2>
          <p className="text-slate-500 mb-4">{quiz.title}</p>
          <div className="inline-flex items-center gap-6 text-sm">
            <div>
              <p className="text-3xl font-bold text-violet-600">{results.score}%</p>
              <p className="text-slate-500">Score</p>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div>
              <p className="text-3xl font-bold text-slate-900">
                {results.correct}/{results.total}
              </p>
              <p className="text-slate-500">Correct</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {results.results.map((r, i) => (
            <div
              key={i}
              className={`bg-white rounded-xl p-5 border ${
                r.isCorrect ? "border-green-100" : "border-red-100"
              }`}
            >
              <div className="flex items-start gap-3">
                {r.isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900 mb-2">
                    Q{i + 1}. {r.question}
                  </p>
                  {!r.isCorrect && (
                    <p className="text-xs text-red-500 mb-1">
                      Your answer: {quiz.questions[i].options[r.yourAnswer] || "Not answered"}
                    </p>
                  )}
                  <p className="text-xs text-green-700">
                    Correct: {quiz.questions[i].options[r.correctAnswer]}
                  </p>
                  {r.explanation && (
                    <p className="text-xs text-slate-500 mt-2 italic">{r.explanation}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href="/quizzes"
          className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Quizzes
        </Link>

        <article className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="relative aspect-[21/9] bg-slate-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="p-6 sm:p-8 space-y-4">
            <div className="flex flex-wrap gap-1.5">
              {kind && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
                  {kind}
                </span>
              )}
              {quiz.subject?.name && (
                <span className="px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold">
                  {quiz.subject.name}
                </span>
              )}
              {quiz.chapter?.title && (
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                  {quiz.chapter.title}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                Pass {quiz.passingScore}%
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{quiz.title}</h1>
              {quiz.description && (
                <p className="text-slate-600 mt-2 leading-relaxed">{quiz.description}</p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-100">
                <HelpCircle className="h-4 w-4 text-violet-600" />
                <span className="text-sm font-semibold text-slate-900">
                  {quiz.questions.length} questions
                </span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 border border-slate-100">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900">{quiz.duration} min</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setStarted(true);
                setTimeLeft(quiz.duration * 60);
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-bold hover:opacity-90"
            >
              <Play className="w-4 h-4" />
              Start Quiz
            </button>
          </div>
        </article>
      </div>
    );
  }

  const question = quiz.questions[currentQ];
  const answeredCurrent =
    answers[currentQ] !== null && answers[currentQ] !== undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900">{quiz.title}</h1>
          <p className="text-xs text-slate-500">
            {quiz.subject?.name} {quiz.chapter && `• ${quiz.chapter.title}`}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium ${
            timeLeft < 60 ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
          }`}
        >
          <Clock className="w-4 h-4" />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="bg-slate-100 rounded-full h-2">
        <div
          className="bg-violet-600 h-2 rounded-full transition-all"
          style={{ width: `${((currentQ + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>
      <p className="text-xs text-slate-500">
        Question {currentQ + 1} of {quiz.questions.length}
      </p>

      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h2 className="text-base font-semibold text-slate-900 mb-5">{question.question}</h2>
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newAnswers = [...answers];
                newAnswers[currentQ] = idx;
                setAnswers(newAnswers);
              }}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                answers[currentQ] === idx
                  ? "border-violet-500 bg-violet-50 text-violet-900 font-medium"
                  : "border-slate-200 hover:border-slate-300 text-slate-700"
              }`}
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-xs font-bold mr-3">
                {String.fromCharCode(65 + idx)}
              </span>
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
          disabled={currentQ === 0}
          className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 transition-colors"
        >
          Previous
        </button>

        {currentQ === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || !answeredCurrent}
            className="px-6 py-2.5 bg-violet-600 text-white font-medium text-sm rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? "Submitting..." : "Submit Quiz"}
          </button>
        ) : (
          <button
            onClick={() => setCurrentQ((q) => Math.min(quiz.questions.length - 1, q + 1))}
            disabled={!answeredCurrent}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 justify-center pt-2">
        {quiz.questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentQ(i)}
            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
              i === currentQ
                ? "bg-violet-600 text-white"
                : answers[i] !== null
                  ? "bg-violet-100 text-violet-700"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
