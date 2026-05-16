import { auth } from "@/lib/auth";
import { connectDB, Subject, Quiz, QuizAttempt } from "@getmaterials/database";
import { ClipboardCheck, BookOpen, Trophy, ArrowRight } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quizzes - GetMaterials",
};

export default async function QuizzesPage() {
  const session = await auth();
  if (!session?.user) return null;

  await connectDB();

  const [subjects, quizzes, attempts] = await Promise.all([
    Subject.find({ isActive: true }).lean(),
    Quiz.find({ isActive: true })
      .populate("subject", "name")
      .populate("chapter", "title")
      .select("title subject chapter duration questions attempts")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    QuizAttempt.find({ user: session.user.id }).lean(),
  ]);

  const avgScore = attempts.length
    ? Math.round(attempts.reduce((sum: number, a: any) => sum + a.score, 0) / attempts.length)
    : 0;
  const subjectsCovered = new Set(attempts.map((a: any) => a.quiz?.toString())).size;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quizzes</h1>
          <p className="text-slate-500 mt-1">Test your knowledge with chapter-wise quizzes.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-100 rounded-xl">
          <Trophy className="w-5 h-5 text-amber-600" />
          <div>
            <p className="text-xs text-amber-600 font-medium">Avg Score</p>
            <p className="text-lg font-bold text-amber-700">{avgScore || "—"}%</p>
          </div>
        </div>
      </div>

      {/* Quiz stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Quizzes Taken", value: String(attempts.length), icon: ClipboardCheck, color: "bg-violet-50 text-violet-600" },
          { label: "Avg. Score", value: avgScore ? `${avgScore}%` : "—", icon: Trophy, color: "bg-amber-50 text-amber-600" },
          { label: "Quizzes Attempted", value: String(subjectsCovered), icon: BookOpen, color: "bg-emerald-50 text-emerald-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-5 border border-slate-100">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Available Quizzes */}
      {quizzes.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Available Quizzes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quizzes.map((quiz: any) => (
              <Link
                key={quiz._id.toString()}
                href={`/quizzes/${quiz._id.toString()}`}
                className="group bg-white rounded-xl p-5 border border-slate-100 hover:border-violet-100 hover:shadow-md transition-all"
              >
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors mb-1">
                  {quiz.title}
                </h3>
                <p className="text-xs text-slate-500 mb-3">
                  {quiz.subject?.name} {quiz.chapter && `• ${quiz.chapter.title}`}
                </p>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span>{quiz.questions?.length || 0} questions</span>
                  <span>{quiz.duration} min</span>
                  <span>{quiz.attempts || 0} attempts</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Available quizzes by subject */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Browse by Subject</h2>
        {subjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {subjects.map((subject: any) => (
              <Link
                key={subject._id.toString()}
                href={`/subjects/${subject.slug}`}
                className="group bg-white rounded-xl p-5 border border-slate-100 hover:border-violet-100 hover:shadow-md transition-all flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-100 to-blue-50 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-violet-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-violet-600 transition-colors truncate">
                    {subject.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {subject.chaptersCount || 0} chapters
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-violet-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 border border-slate-100 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">No quizzes available yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Quizzes will appear here once teachers create them for their subjects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
