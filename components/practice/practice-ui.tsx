import Link from "next/link";

export function difficultyClass(difficulty: string) {
  if (difficulty === "easy") return "bg-emerald-50 text-emerald-700";
  if (difficulty === "medium") return "bg-amber-50 text-amber-800";
  return "bg-rose-50 text-rose-700";
}

export function Breadcrumb({
  items,
}: {
  items: { href?: string; label: string }[];
}) {
  return (
    <p className="text-sm text-slate-400 mb-4">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`}>
          {index > 0 ? <span className="mx-1.5">›</span> : null}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--primary)]">
              {item.label}
            </Link>
          ) : (
            <span className="text-slate-600">{item.label}</span>
          )}
        </span>
      ))}
    </p>
  );
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide ${difficultyClass(difficulty)}`}>
      {difficulty}
    </span>
  );
}

export function ListSkeleton({ rows = 6, bare = false }: { rows?: number; bare?: boolean }) {
  const body = Array.from({ length: rows }, (_, index) => (
    <div key={index} className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-2/3 max-w-xs bg-slate-100 rounded animate-pulse" />
        <div className="h-3 w-1/3 max-w-[8rem] bg-slate-100 rounded animate-pulse" />
      </div>
      <div className="h-5 w-14 bg-slate-100 rounded-full animate-pulse" />
    </div>
  ));
  if (bare) return <div>{body}</div>;
  return <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">{body}</div>;
}
