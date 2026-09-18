import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { categoryLabel, formatCount } from "./query";

export type SubjectCardData = {
  id: string;
  name: string;
  slug: string;
  category: string;
  materialsCount: number;
  icon?: string | null;
  ratingAverage?: number;
  ratingCount?: number;
};

const DEFAULT_SUBJECT_IMAGE = "/images/default-subject.png";

function SubjectLogo({
  subject,
  size = "md",
}: {
  subject: SubjectCardData;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const box =
    size === "xl"
      ? "w-28 h-28 rounded-3xl sm:w-32 sm:h-32"
      : size === "lg"
        ? "w-24 h-24 rounded-2xl"
        : size === "sm"
          ? "w-14 h-14 rounded-xl"
          : "w-20 h-20 rounded-2xl";
  const src = subject.icon?.trim() || DEFAULT_SUBJECT_IMAGE;

  return (
    <div className={`${box} relative overflow-hidden bg-white border border-slate-100 shrink-0 shadow-sm`}>
      <Image
        src={src}
        alt=""
        fill
        className="object-contain p-1.5"
        sizes={size === "xl" ? "128px" : size === "lg" ? "96px" : size === "sm" ? "56px" : "80px"}
      />
    </div>
  );
}

export default function SubjectCard({
  subject,
  view,
}: {
  subject: SubjectCardData;
  view: "grid" | "list";
}) {
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
        <SubjectLogo subject={subject} size="lg" />
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
      <div className="mb-4">
        <SubjectLogo subject={subject} size="xl" />
      </div>
      <h3 className="font-bold text-slate-900 leading-snug line-clamp-2">{subject.name}</h3>
      <div className="mt-2 mb-4">{stats}</div>
      <div className="mt-auto w-full">{action}</div>
    </article>
  );
}

export { SubjectLogo, DEFAULT_SUBJECT_IMAGE };
