"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Grid3X3, List } from "lucide-react";
import { collegesHref, type CollegesQuery } from "./query";

const sorts = [
  { value: "popular", label: "Popular" },
  { value: "name", label: "Name" },
  { value: "recent", label: "Newest" },
];

export default function CollegesToolbar({
  current,
  loggedIn,
}: {
  current: CollegesQuery;
  loggedIn: boolean;
}) {
  const router = useRouter();
  const view = current.view === "list" ? "list" : "grid";
  const sort = current.sort || "popular";
  const tab = current.tab === "mine" ? "mine" : "all";

  return (
    <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between mb-5">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200 xl:border-0">
        <Link
          href={collegesHref(current, { tab: "" })}
          className={`shrink-0 px-3 py-2 text-sm font-semibold border-b-2 ${
            tab === "all"
              ? "border-[var(--primary)] text-[var(--primary)]"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          All Colleges
        </Link>
        {loggedIn && (
          <Link
            href={collegesHref(current, { tab: "mine" })}
            className={`shrink-0 px-3 py-2 text-sm font-semibold border-b-2 ${
              tab === "mine"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            My College
          </Link>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <select
            value={sort}
            onChange={(event) => router.push(collegesHref(current, { sort: event.target.value }))}
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
            href={collegesHref(current, { view: "grid" })}
            className={`p-2 ${view === "grid" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
            aria-label="Grid view"
          >
            <Grid3X3 className="w-4 h-4" />
          </Link>
          <Link
            href={collegesHref(current, { view: "list" })}
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
