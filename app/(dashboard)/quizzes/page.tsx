import { auth } from "@/lib/auth";
import { connectDB, Subject, Quiz, QuizAttempt } from "@/lib/database";
import { ClipboardCheck, Clock, HelpCircle, Plus, Trophy, Users } from "lucide-react";
import Link from "next/link";
import QuizzesFilterSidebar from "@/components/quizzes/QuizzesFilterSidebar";
import QuizzesToolbar from "@/components/quizzes/QuizzesToolbar";
import QuizCard, { type QuizCardData } from "@/components/quizzes/QuizCard";
import { formatCount, quizzesHref, type QuizzesQuery } from "@/components/quizzes/query";
import { listingMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata = listingMetadata({
  title: "Free Chapter-wise Quizzes for Students",
  description:
    "Practice chapter-wise quizzes created by teachers on GetMaterials. Test notes, score instantly, and revise before exams.",
  path: "/quizzes",
  keywords: ["free quizzes", "chapter wise quiz", "exam practice", "GetMaterials quizzes"],
});

const PAGE_SIZE = 8;

interface Props {
  searchParams: Promise<{
    q?: string;
    subject?: string;
    tab?: string;
    sort?: string;
    view?: string;
    page?: string;
  }>;
}

export default async function QuizzesPage({ searchParams }: Props) {
  const params = await searchParams;
  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  const role = (session?.user as any)?.role as string | undefined;

  await connectDB();

  const current: QuizzesQuery = {
    q: params.q,
    subject: params.subject,
    tab: params.tab,
    sort: params.sort,
    view: params.view,
  };

  const subjectDoc = params.subject
    ? await Subject.findOne({ slug: params.subject }).select("_id").lean()
    : null;

  const filter: Record<string, unknown> = { isActive: true };
  if (params.subject) {
    filter.subject = subjectDoc ? (subjectDoc as any)._id : { $in: [] };
  }
  if (params.q?.trim()) {
    filter.$or = [
      { title: { $regex: params.q.trim(), $options: "i" } },
      { description: { $regex: params.q.trim(), $options: "i" } },
    ];
  }
  if (params.tab === "new") {
    const since = new Date();
    since.setDate(since.getDate() - 30);
    filter.createdAt = { $gte: since };
  }

  const userAttempts = userId
    ? await QuizAttempt.find({ user: userId }).select("quiz score").lean()
    : [];
  const attemptedIds = [...new Set(userAttempts.map((item: any) => String(item.quiz)))];

  if (params.tab === "mine" && userId) {
    if (role === "teacher" || role === "admin") {
      filter.createdBy = userId;
    } else {
      filter._id = { $in: attemptedIds };
    }
  }

  const sortKey = params.sort || (params.tab === "popular" ? "attempts" : "latest");
  const sort: Record<string, 1 | -1> =
    sortKey === "attempts"
      ? { attempts: -1, createdAt: -1 }
      : sortKey === "duration"
        ? { duration: 1, createdAt: -1 }
        : { createdAt: -1 };

  const page = Math.max(1, Number(params.page) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const view = params.view === "grid" ? "grid" : "list";

  const [
    totalMatching,
    quizzes,
    totalQuizzes,
    attemptAgg,
    durationAgg,
    subjectCounts,
    topScorers,
    attemptedQuizDocs,
  ] = await Promise.all([
    Quiz.countDocuments(filter),
    Quiz.find(filter)
      .populate("subject", "name slug")
      .populate("chapter", "title")
      .sort(sort)
      .skip(skip)
      .limit(PAGE_SIZE)
      .lean(),
    Quiz.countDocuments({ isActive: true }),
    QuizAttempt.aggregate([{ $group: { _id: null, total: { $sum: 1 }, avg: { $avg: "$score" } } }]),
    Quiz.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avg: { $avg: "$duration" }, attempts: { $sum: "$attempts" } } },
    ]),
    Quiz.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    QuizAttempt.aggregate([
      {
        $group: {
          _id: "$user",
          attempts: { $sum: 1 },
          avgScore: { $avg: "$score" },
        },
      },
      { $sort: { avgScore: -1, attempts: -1 } },
      { $limit: 5 },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { attempts: 1, avgScore: 1, name: "$user.name", avatar: "$user.avatar" } },
    ]),
    attemptedIds.length
      ? Quiz.find({ _id: { $in: attemptedIds } }).select("passingScore").lean()
      : Promise.resolve([]),
  ]);

  const subjectIds = subjectCounts.map((row: any) => row._id).filter(Boolean);
  const subjectDocs = subjectIds.length
    ? await Subject.find({ _id: { $in: subjectIds } }).select("name slug").lean()
    : [];
  const subjectMap = new Map(subjectDocs.map((item: any) => [String(item._id), item]));
  const subjects = subjectCounts
    .map((row: any) => {
      const subject = subjectMap.get(String(row._id));
      if (!subject) return null;
      return { value: subject.slug, label: subject.name, count: row.count };
    })
    .filter(Boolean) as { value: string; label: string; count: number }[];

  const leaderboard = topScorers
    .filter((row: any) => row.name)
    .map((row: any) => ({
      id: String(row._id),
      name: row.name as string,
      avatar: row.avatar as string | undefined,
      attempts: row.attempts as number,
      avgScore: Math.round(row.avgScore || 0),
    }));

  const cards: QuizCardData[] = quizzes.map((quiz: any) => ({
    id: String(quiz._id),
    title: quiz.title,
    description: quiz.description || "",
    subject: quiz.subject?.name,
    chapter: quiz.chapter?.title,
    questions: quiz.questions?.length || 0,
    duration: quiz.duration,
    attempts: quiz.attempts || 0,
    passingScore: quiz.passingScore || 60,
    attempted: attemptedIds.includes(String(quiz._id)),
  }));

  const totalPages = Math.max(1, Math.ceil(totalMatching / PAGE_SIZE));
  const avgScore = attemptAgg[0]?.avg ? Math.round(attemptAgg[0].avg) : 0;
  const totalAttempts = attemptAgg[0]?.total || durationAgg[0]?.attempts || 0;
  const avgDuration = durationAgg[0]?.avg ? Math.round(durationAgg[0].avg) : 0;

  const myAvg = userAttempts.length
    ? Math.round(userAttempts.reduce((sum: number, item: any) => sum + (item.score || 0), 0) / userAttempts.length)
    : 0;
  const myBest = userAttempts.length
    ? Math.max(...userAttempts.map((item: any) => item.score || 0))
    : 0;
  const passingMap = new Map(
    (attemptedQuizDocs as any[]).map((quiz) => [String(quiz._id), quiz.passingScore || 60])
  );
  const bestByQuiz = new Map<string, number>();
  for (const item of userAttempts as any[]) {
    const id = String(item.quiz);
    bestByQuiz.set(id, Math.max(bestByQuiz.get(id) || 0, item.score || 0));
  }
  const myPassed = [...bestByQuiz.entries()].filter(
    ([id, score]) => score >= (passingMap.get(id) || 60)
  ).length;
  const uniqueAttempted = attemptedIds.length;
  const progressPct = totalQuizzes ? Math.round((uniqueAttempted / totalQuizzes) * 100) : 0;

  const canCreate = role === "teacher" || role === "admin";

  const queryForPage = (nextPage: number) => quizzesHref(current, { page: String(nextPage) });

  return (
    <div className="max-w-7xl mx-auto">
      <p className="text-sm text-slate-400 mb-4">
        <Link href="/" className="hover:text-[var(--primary)]">Home</Link>
        <span className="mx-1.5">›</span>
        <span className="text-slate-600">Quizzes</span>
      </p>

      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center shrink-0">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Quizzes</h1>
            <p className="text-slate-500 mt-1">Test your knowledge and improve your skills with practice quizzes.</p>
          </div>
        </div>
        {canCreate && (
          <div className="flex items-center gap-2">
            <Link
              href="/teacher/quizzes"
              className="inline-flex items-center gap-2 border border-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm hover:bg-white"
            >
              Manage Quizzes
            </Link>
            <Link
              href="/teacher/quizzes/create"
              className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90"
            >
              <Plus className="w-4 h-4" />
              Create Quiz
            </Link>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { icon: ClipboardCheck, tint: "bg-violet-50 text-violet-600", value: totalQuizzes ? `${formatCount(totalQuizzes)}+` : "0", label: "Total Quizzes" },
          { icon: Users, tint: "bg-emerald-50 text-emerald-600", value: totalAttempts ? `${formatCount(totalAttempts)}+` : "0", label: "Attempts" },
          { icon: Trophy, tint: "bg-amber-50 text-amber-600", value: avgScore ? `${avgScore}%` : "—", label: "Average Score" },
          { icon: Clock, tint: "bg-blue-50 text-blue-600", value: avgDuration ? `${avgDuration} min` : "—", label: "Avg. Duration" },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-2xl border border-slate-100 px-4 py-3 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.tint}`}>
              <item.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-slate-900 leading-tight">{item.value}</p>
              <p className="text-[11px] text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_260px] gap-6 items-start">
        <QuizzesFilterSidebar current={current} subjects={subjects} />

        <div>
          <QuizzesToolbar current={current} showMine={Boolean(userId)} />
          {cards.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center mt-5">
              <HelpCircle className="w-10 h-10 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No quizzes match your filters.</p>
              <Link href="/quizzes" className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className={view === "grid" ? "mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4" : "mt-5 space-y-3"}>
              {cards.map((quiz) => (
                <QuizCard key={quiz.id} quiz={quiz} view={view} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              {page > 1 && (
                <Link href={queryForPage(page - 1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white">
                  Prev
                </Link>
              )}
              {Array.from({ length: Math.min(totalPages, 7) }, (_, index) => {
                const n = index + 1;
                return (
                  <Link
                    key={n}
                    href={queryForPage(n)}
                    className={`min-w-8 h-8 px-2 rounded-lg text-sm font-semibold flex items-center justify-center ${
                      n === page ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {n}
                  </Link>
                );
              })}
              {totalPages > 7 && <span className="px-2 text-slate-400">…</span>}
              {totalPages > 7 && (
                <Link
                  href={queryForPage(totalPages)}
                  className={`min-w-8 h-8 px-2 rounded-lg text-sm font-semibold flex items-center justify-center ${
                    page === totalPages ? "bg-[var(--primary)] text-white" : "text-slate-600 hover:bg-white"
                  }`}
                >
                  {totalPages}
                </Link>
              )}
              {page < totalPages && (
                <Link href={queryForPage(page + 1)} className="px-3 py-1.5 text-sm rounded-lg hover:bg-white">
                  Next
                </Link>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Your Quiz Progress</h3>
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <path
                    className="text-slate-100"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    fill="none"
                    d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
                  />
                  <path
                    className="text-[var(--primary)]"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray={`${progressPct}, 100`}
                    d="M18 2.5a15.5 15.5 0 1 1 0 31 15.5 15.5 0 0 1 0-31"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-lg font-extrabold text-slate-900">
                  {progressPct}%
                </span>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <Row label="Quizzes Attempted" value={String(uniqueAttempted)} />
              <Row label="Average Score" value={userAttempts.length ? `${myAvg}%` : "—"} />
              <Row label="Best Score" value={userAttempts.length ? `${myBest}%` : "—"} />
              <Row label="Passed" value={String(myPassed)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-5">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Top Scorers</h3>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-slate-400">No attempts yet.</p>
            ) : (
              <div className="space-y-3">
                {leaderboard.map((row, index) => {
                  const isYou = userId && row.id === userId;
                  return (
                    <div
                      key={row.id}
                      className={`flex items-center gap-3 rounded-xl px-2 py-1.5 -mx-2 ${
                        isYou ? "bg-violet-50" : ""
                      }`}
                    >
                      <span className="w-5 text-xs font-bold text-slate-400">{index + 1}</span>
                      {row.avatar ? (
                        <img src={row.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center">
                          {row.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {row.name}
                          {isYou ? " (You)" : ""}
                        </p>
                        <p className="text-[11px] text-slate-400">{row.attempts} attempts</p>
                      </div>
                      <span className="text-xs font-bold text-violet-700">{row.avgScore}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-500">{label}</span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
