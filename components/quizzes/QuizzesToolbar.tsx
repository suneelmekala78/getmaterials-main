"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Grid3X3, List, X } from "lucide-react";
import { firstParam } from "@/lib/filter-list";
import { quizzesHref, type QuizzesQuery } from "./query";

const tabs = [
  { key: "all", label: "All Quizzes" },
  { key: "new", label: "Newly Added" },
  { key: "popular", label: "Most Attempted" },
  { key: "mine", label: "My Quizzes" },
];

const sorts = [
  { value: "latest", label: "Latest" },
  { value: "attempts", label: "Most attempted" },
  { value: "duration", label: "Duration" },
];

const kinds = [
  { value: "", label: "All types" },
  { value: "subject", label: "Subject" },
  { value: "general_knowledge", label: "General knowledge" },
  { value: "other", label: "Other" },
];

export default function QuizzesToolbar({
  current,
  showMine,
  subjects = [],
}: {
  current: QuizzesQuery;
  showMine: boolean;
  subjects?: { value: string; label: string; count: number }[];
}) {
  const router = useRouter();
  const view = current.view !== "list" ? "grid" : "list";
  const sort = current.sort || (current.tab === "popular" ? "attempts" : "latest");
  const tab = current.tab || "all";
  const selectedSubject = firstParam(current.subject);
  const selectedKind = current.kind || "";
  const hasFilters = Boolean(current.q || selectedSubject || selectedKind);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar border-b border-slate-200">
        {tabs
          .filter((item) => item.key !== "mine" || showMine)
          .map((item) => (
            <Link
              key={item.key}
              href={quizzesHref(current, {
                tab: item.key === "all" ? "" : item.key,
                sort:
                  item.key === "popular"
                    ? "attempts"
                    : item.key === "mine"
                      ? current.sort
                      : "latest",
              })}
              className={`shrink-0 px-3 py-2 text-sm font-semibold border-b-2 ${
                tab === item.key
                  ? "border-[var(--primary)] text-[var(--primary)]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              {item.label}
            </Link>
          ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row lg:items-center gap-3">
          <form action="/quizzes" className="flex-1 min-w-0">
            {selectedSubject && <input type="hidden" name="subject" value={selectedSubject} />}
            {selectedKind && <input type="hidden" name="kind" value={selectedKind} />}
            {current.tab && <input type="hidden" name="tab" value={current.tab} />}
            {current.sort && <input type="hidden" name="sort" value={current.sort} />}
            {current.view && <input type="hidden" name="view" value={current.view} />}
            <input
              type="search"
              name="q"
              defaultValue={current.q || ""}
              placeholder="Search quizzes..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-violet-500"
            />
          </form>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(event) =>
                  router.push(
                    quizzesHref(current, {
                      subject: event.target.value || undefined,
                    })
                  )
                }
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 min-w-[140px] max-w-[200px]"
                aria-label="Filter by subject"
              >
                <option value="">All subjects</option>
                {subjects.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label} ({item.count})
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={selectedKind}
                onChange={(event) =>
                  router.push(
                    quizzesHref(current, {
                      kind: event.target.value || undefined,
                    })
                  )
                }
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 min-w-[130px]"
                aria-label="Filter by type"
              >
                {kinds.map((item) => (
                  <option key={item.value || "all"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(event) => router.push(quizzesHref(current, { sort: event.target.value }))}
                className="appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700"
              >
                {sorts.map((item) => (
                  <option key={item.value} value={item.value}>
                    Sort: {item.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            <div className="flex rounded-xl border border-slate-200 overflow-hidden">
              <Link
                href={quizzesHref(current, { view: "list" })}
                className={`p-2.5 ${view === "list" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
                aria-label="List view"
              >
                <List className="w-4 h-4" />
              </Link>
              <Link
                href={quizzesHref(current, { view: "grid" })}
                className={`p-2.5 ${view === "grid" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
                aria-label="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {hasFilters ? (
          <div className="flex items-center gap-2 flex-wrap">
            {current.q ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-600">
                Search: {current.q}
              </span>
            ) : null}
            {selectedSubject ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-50 text-xs font-medium text-violet-700">
                {subjects.find((s) => s.value === selectedSubject)?.label || selectedSubject}
              </span>
            ) : null}
            {selectedKind ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-xs font-medium text-amber-700">
                {kinds.find((k) => k.value === selectedKind)?.label || selectedKind}
              </span>
            ) : null}
            <Link
              href={quizzesHref({ view: current.view, tab: current.tab, sort: current.sort })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[var(--primary)]"
            >
              <X className="w-3.5 h-3.5" />
              Clear filters
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
