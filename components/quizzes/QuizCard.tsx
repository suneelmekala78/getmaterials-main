import Link from "next/link";
import { Clock, HelpCircle, Users } from "lucide-react";
import { formatCount } from "./query";

export type QuizCardData = {
  id: string;
  title: string;
  description?: string;
  subject?: string;
  chapter?: string;
  questions: number;
  duration: number;
  attempts: number;
  passingScore: number;
  attempted?: boolean;
};

export default function QuizCard({
  quiz,
  view,
}: {
  quiz: QuizCardData;
  view: "grid" | "list";
}) {
  const href = `/quizzes/${quiz.id}`;

  const meta = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      <span className="inline-flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        {quiz.questions} questions
      </span>
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {quiz.duration} min
      </span>
      <span className="inline-flex items-center gap-1">
        <Users className="w-3.5 h-3.5" />
        {formatCount(quiz.attempts)} attempts
      </span>
    </div>
  );

  const tags = (
    <div className="flex flex-wrap gap-1.5">
      {quiz.subject && (
        <span className="px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 text-[11px] font-semibold">
          {quiz.subject}
        </span>
      )}
      {quiz.chapter && (
        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
          {quiz.chapter}
        </span>
      )}
      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
        Pass {quiz.passingScore}%
      </span>
      {quiz.attempted && (
        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-semibold">
          Attempted
        </span>
      )}
    </div>
  );

  const action = (
    <Link
      href={href}
      className="shrink-0 px-3 py-2 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition-colors"
    >
      {quiz.attempted ? "Retake Quiz" : "Start Quiz"}
    </Link>
  );

  if (view === "grid") {
    return (
      <article className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col">
        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{quiz.title}</h3>
        <div className="mt-2">{tags}</div>
        {quiz.description && (
          <p className="text-sm text-slate-500 mt-2 line-clamp-2">{quiz.description}</p>
        )}
        <div className="mt-3">{meta}</div>
        <div className="mt-auto pt-4">{action}</div>
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-violet-50 text-[var(--primary)] flex items-center justify-center shrink-0">
        <HelpCircle className="w-5 h-5" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-900 truncate">{quiz.title}</h3>
        <div className="mt-1.5">{tags}</div>
        {quiz.description && (
          <p className="text-sm text-slate-500 mt-1.5 line-clamp-1">{quiz.description}</p>
        )}
        <div className="mt-2">{meta}</div>
      </div>
      {action}
    </article>
  );
}
