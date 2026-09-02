import Link from "next/link";
import { BookOpen, Beaker, Code, Calculator, Palette, Scale, Lightbulb, Star } from "lucide-react";
import { categoryLabel, formatCount } from "./query";

export type SubjectCardData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  materialsCount: number;
  ratingAverage?: number;
  ratingCount?: number;
};

const categoryIcons: Record<string, typeof BookOpen> = {
  science: Beaker,
  engineering: Code,
  arts: Palette,
  commerce: Calculator,
  medical: Lightbulb,
  law: Scale,
  general: BookOpen,
};

const categoryColors: Record<string, string> = {
  science: "from-emerald-500 to-teal-500",
  engineering: "from-blue-500 to-cyan-500",
  arts: "from-pink-500 to-rose-500",
  commerce: "from-amber-500 to-orange-500",
  medical: "from-red-500 to-pink-500",
  law: "from-indigo-500 to-purple-500",
  general: "from-violet-500 to-blue-500",
};

export default function SubjectCard({
  subject,
  view,
}: {
  subject: SubjectCardData;
  view: "grid" | "list";
}) {
  const Icon = categoryIcons[subject.category] || BookOpen;
  const color = categoryColors[subject.category] || categoryColors.general;
  const href = `/subjects/${subject.slug}`;
  const showRating = (subject.ratingCount || 0) > 0 && typeof subject.ratingAverage === "number";

  const stats = (
    <p className="text-xs text-slate-500">
      {formatCount(subject.materialsCount)} Materials
      {showRating && (
        <>
          <span className="mx-1.5 text-slate-300">·</span>
          <span className="inline-flex items-center gap-1">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            {subject.ratingAverage!.toFixed(1)}
            <span className="text-slate-400">({formatCount(subject.ratingCount!)})</span>
          </span>
        </>
      )}
    </p>
  );

  const action = (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-3 py-2 rounded-xl bg-violet-50 text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition-colors"
    >
      View Materials
    </Link>
  );

  if (view === "list") {
    return (
      <article className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shrink-0`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-900 truncate">{subject.name}</h3>
          <p className="text-[11px] text-slate-400 capitalize mt-0.5">{categoryLabel(subject.category)}</p>
          <div className="mt-1">{stats}</div>
        </div>
        {action}
      </article>
    );
  }

  return (
    <article className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col items-center text-center hover:shadow-md hover:border-violet-100 transition-all">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{subject.name}</h3>
      <div className="mt-2 mb-4">{stats}</div>
      <div className="mt-auto w-full">{action}</div>
    </article>
  );
}
