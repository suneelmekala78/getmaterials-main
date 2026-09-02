"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Grid3X3, List, Search } from "lucide-react";
import { subjectsHref, type SubjectQuery } from "./query";

const sorts = [
  { value: "az", label: "A - Z" },
  { value: "za", label: "Z - A" },
  { value: "materials", label: "Most materials" },
  { value: "newest", label: "Newest" },
];

export default function SubjectsToolbar({ current }: { current: SubjectQuery }) {
  const router = useRouter();
  const view = current.view === "list" ? "list" : "grid";
  const sort = current.sort || "az";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <form action="/subjects" className="relative flex-1">
        {current.category && <input type="hidden" name="category" value={current.category} />}
        {current.sort && <input type="hidden" name="sort" value={current.sort} />}
        {current.view && <input type="hidden" name="view" value={current.view} />}
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="search"
          name="q"
          defaultValue={current.q || ""}
          placeholder="Search subjects..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-violet-500"
        />
      </form>
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative">
          <select
            value={sort}
            onChange={(event) => router.push(subjectsHref(current, { sort: event.target.value }))}
            className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
          >
            {sorts.map((item) => (
              <option key={item.value} value={item.value}>
                Sort by: {item.label}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <div className="flex rounded-xl border border-slate-200 overflow-hidden">
          <Link
            href={subjectsHref(current, { view: "grid" })}
            className={`p-2 ${view === "grid" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </Link>
          <Link
            href={subjectsHref(current, { view: "list" })}
            className={`p-2 ${view === "list" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
            aria-label="List view"
          >
            <List className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
