import Link from "next/link";
import type { ReactNode } from "react";
import { subjectsHref, SUBJECT_CATEGORIES, type SubjectQuery } from "./query";
import { listHas, parseList, toggleCsv } from "@/lib/filter-list";

export default function SubjectsFilterSidebar({
  current,
  categoryCounts,
  total,
}: {
  current: SubjectQuery;
  categoryCounts: Record<string, number>;
  total: number;
}) {
  const groups = (
    <FilterGroup title="Field of Study">
      <FilterLink
        href={subjectsHref(current, { category: "" })}
        active={!parseList(current.category).length}
        label="All Fields"
        count={total}
      />
      {SUBJECT_CATEGORIES.map((item) => (
        <FilterLink
          key={item.value}
            href={subjectsHref(current, { category: toggleCsv(current.category, item.value) })}
            active={listHas(current.category, item.value)}
          label={item.label}
          count={categoryCounts[item.value] || 0}
        />
      ))}
    </FilterGroup>
  );

  return (
    <div className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)]">
      <details className="lg:hidden bg-white rounded-2xl border border-slate-100 p-4">
        <summary className="flex items-center justify-between font-bold text-slate-900 cursor-pointer list-none">
          <span>Filters</span>
          {current.category && (
            <Link href={subjectsHref(current, { category: "" })} className="text-xs font-semibold text-[var(--primary)]">
              Clear All
            </Link>
          )}
        </summary>
        <div className="mt-4">{groups}</div>
      </details>
      <aside className="hidden lg:block bg-white rounded-2xl border border-slate-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Filters</h2>
          {current.category && (
            <Link href={subjectsHref(current, { category: "" })} className="text-xs font-semibold text-[var(--primary)]">
              Clear All
            </Link>
          )}
        </div>
        {groups}
      </aside>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
  count,
}: {
  href: string;
  active: boolean;
  label: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-sm ${
        active ? "bg-violet-50 text-violet-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
          active ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-slate-300"
        }`}
      >
        {active ? "✓" : ""}
      </span>
      <span className="truncate flex-1">{label}</span>
      {typeof count === "number" && <span className="text-[11px] text-slate-400">{count}</span>}
    </Link>
  );
}
