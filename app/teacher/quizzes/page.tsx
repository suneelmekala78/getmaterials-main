"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2, Edit3, Eye, Users } from "lucide-react";

interface Quiz {
  _id: string;
  title: string;
  subject?: { name: string };
  chapter?: { title: string };
  questions: any[];
  attempts: number;
  isActive: boolean;
  createdAt: string;
}

interface Attempt {
  _id: string;
  user: { name: string; email: string; role: string };
  score: number;
  answers: number[];
  completedAt: string;
}

interface AttemptStats {
  total: number;
  avgScore: number;
  passCount: number;
  failCount: number;
  passingScore: number;
}

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewQuizId, setViewQuizId] = useState<string | null>(null);
  const [viewQuizTitle, setViewQuizTitle] = useState("");
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [attemptStats, setAttemptStats] = useState<AttemptStats | null>(null);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/quizzes")
      .then((r) => r.json())
      .then((data) => setQuizzes(data.quizzes || []))
      .finally(() => setLoading(false));
  }, []);

  const viewAttempts = async (quizId: string, title: string) => {
    setViewQuizId(quizId);
    setViewQuizTitle(title);
    setAttemptsLoading(true);
    try {
      const res = await fetch(`/api/teacher/quizzes/attempts?quizId=${quizId}`);
      const data = await res.json();
      if (res.ok) {
        setAttempts(data.attempts || []);
        setAttemptStats(data.stats || null);
      }
    } catch {
      // Handle error
    } finally {
      setAttemptsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Quizzes</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage quizzes for your students</p>
        </div>
        <Link
          href="/teacher/quizzes/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition"
        >
          <Plus className="w-4 h-4" />
          Create Quiz
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">📝</span>
          </div>
          <p className="text-slate-600 font-medium">No quizzes yet</p>
          <p className="text-slate-400 text-sm mt-1">Create your first quiz for students!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="bg-white rounded-xl border border-slate-100 p-5 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900">{quiz.title}</h3>
                <div className="flex items-center gap-3 mt-1">
                  {quiz.subject && (
                    <span className="text-xs text-slate-500">{quiz.subject.name}</span>
                  )}
                  {quiz.chapter && (
                    <span className="text-xs text-slate-400">• {quiz.chapter.title}</span>
                  )}
                  <span className="text-xs text-slate-400">• {quiz.questions?.length || 0} questions</span>
                  <span className="text-xs text-slate-400">• {quiz.attempts || 0} attempts</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => viewAttempts(quiz._id, quiz.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  Responses
                </button>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  quiz.isActive ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {quiz.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Attempts Modal */}
      {viewQuizId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Quiz Responses</h2>
                  <p className="text-sm text-slate-500 mt-0.5">{viewQuizTitle}</p>
                </div>
                <button
                  onClick={() => { setViewQuizId(null); setAttempts([]); setAttemptStats(null); }}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              {attemptStats && attemptStats.total > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4">
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-lg font-bold text-slate-900">{attemptStats.total}</p>
                    <p className="text-[10px] text-slate-500 uppercase">Attempts</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-xl">
                    <p className="text-lg font-bold text-slate-900">{attemptStats.avgScore}%</p>
                    <p className="text-[10px] text-slate-500 uppercase">Avg Score</p>
                  </div>
                  <div className="text-center p-3 bg-emerald-50 rounded-xl">
                    <p className="text-lg font-bold text-emerald-700">{attemptStats.passCount}</p>
                    <p className="text-[10px] text-emerald-600 uppercase">Passed</p>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-xl">
                    <p className="text-lg font-bold text-red-700">{attemptStats.failCount}</p>
                    <p className="text-[10px] text-red-600 uppercase">Failed</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {attemptsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No one has attempted this quiz yet.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {attempts.map((attempt) => (
                    <div key={attempt._id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {attempt.user?.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-slate-900">{attempt.user?.name || "Unknown"}</span>
                          <span className={`px-1.5 py-0.5 text-[10px] font-medium rounded capitalize ${
                            attempt.user?.role === "teacher" ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"
                          }`}>
                            {attempt.user?.role}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">{attempt.user?.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${attempt.score >= (attemptStats?.passingScore || 60) ? "text-emerald-600" : "text-red-600"}`}>
                          {attempt.score}%
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(attempt.completedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
