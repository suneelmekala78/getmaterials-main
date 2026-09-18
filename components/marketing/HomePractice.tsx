import Link from "next/link";
import { ArrowRight, BarChart3, ClipboardCheck, Clock, HelpCircle } from "lucide-react";
import { connectDB, Quiz } from "@/lib/database";

export const dynamic = "force-dynamic";

type HomeQuiz = {
  id: string;
  slug?: string;
  title: string;
  kind?: string;
  questions: number;
  duration: number;
  thumbnailUrl?: string;
};

type HomePoll = {
  id: string;
  slug?: string;
  question: string;
  type: string;
  thumbnailUrl?: string;
};

async function loadQuizzes(): Promise<HomeQuiz[]> {
  try {
    await connectDB();
    const quizzes = await Quiz.find({ isActive: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(4)
      .select("title slug kind duration questions thumbnailUrl")
      .lean();
    return quizzes.map((quiz: any) => ({
      id: String(quiz._id),
      slug: quiz.slug || undefined,
      title: quiz.title,
      kind: quiz.kind,
      questions: quiz.questions?.length || 0,
      duration: quiz.duration || 0,
      thumbnailUrl: quiz.thumbnailUrl || undefined,
    }));
  } catch {
    return [];
  }
}

async function loadPolls(): Promise<HomePoll[]> {
  try {
    const base =
      process.env.API_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000";
    const res = await fetch(`${base.replace(/\/$/, "")}/api/polls`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.polls || []) as any[]).slice(0, 3).map((poll) => ({
      id: String(poll._id),
      slug: poll.slug || undefined,
      question: poll.question,
      type: poll.type,
      thumbnailUrl: poll.thumbnailUrl || undefined,
    }));
  } catch {
    return [];
  }
}

function kindLabel(kind?: string) {
  if (kind === "general_knowledge") return "General knowledge";
  if (kind === "other") return "Other";
  return "Subject quiz";
}

export default async function HomePractice() {
  const [quizzes, polls] = await Promise.all([loadQuizzes(), loadPolls()]);

  if (!quizzes.length && !polls.length) return null;

  return (
    <section className="font-marketing relative overflow-hidden bg-[#fafafa] px-6 py-16 sm:py-20">
      <div className="relative mx-auto max-w-6xl space-y-12">
        <div className="text-center">
          <span className="inline-flex rounded-full bg-[#f3e8ff] px-4 py-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            Practice
          </span>
          <h2 className="mt-5 text-[2rem] font-bold leading-tight tracking-tight text-[#111] sm:text-[2.35rem]">
            Quizzes &amp; polls for every student
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
            Test yourself with chapter quizzes, then share your voice in community polls —
            free on GetMaterials.
          </p>
        </div>

        {quizzes.length > 0 && (
          <div>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-slate-900">Latest quizzes</h3>
              </div>
              <Link
                href="/quizzes"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quizzes.map((quiz) => {
                const href = `/quizzes/${quiz.slug || quiz.id}`;
                const thumb = quiz.thumbnailUrl || "/images/default-quiz.png";
                return (
                  <Link
                    key={quiz.id}
                    href={href}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <span className="inline-flex rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                        {kindLabel(quiz.kind)}
                      </span>
                      <p className="mt-2 line-clamp-2 font-bold text-slate-900 group-hover:text-[var(--primary)]">
                        {quiz.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <HelpCircle className="h-3.5 w-3.5" />
                          {quiz.questions} Qs
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {quiz.duration} min
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {polls.length > 0 && (
          <div>
            <div className="mb-5 flex items-end justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-bold text-slate-900">Active polls</h3>
              </div>
              <Link
                href="/polls"
                className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--primary)] hover:underline"
              >
                View all
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {polls.map((poll) => {
                const href = `/polls?poll=${encodeURIComponent(poll.slug || poll.id)}`;
                const thumb = poll.thumbnailUrl || "/images/default-poll.png";
                return (
                  <Link
                    key={poll.id}
                    href={href}
                    className="group overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] bg-slate-50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4">
                      <span className="inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                        Poll
                      </span>
                      <p className="mt-2 line-clamp-2 font-bold text-slate-900 group-hover:text-[var(--primary)]">
                        {poll.question}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
