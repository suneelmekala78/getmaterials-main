"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Grid3X3, List } from "lucide-react";
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

export default function QuizzesToolbar({
  current,
  showMine,
}: {
  current: QuizzesQuery;
  showMine: boolean;
}) {
  const router = useRouter();
  const view = current.view === "grid" ? "grid" : "list";
  const sort = current.sort || (current.tab === "popular" ? "attempts" : "latest");
  const tab = current.tab || "all";

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

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <form action="/quizzes" className="flex-1">
          {current.subject && <input type="hidden" name="subject" value={current.subject} />}
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
        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => router.push(quizzesHref(current, { sort: event.target.value }))}
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
              href={quizzesHref(current, { view: "list" })}
              className={`p-2 ${view === "list" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Link>
            <Link
              href={quizzesHref(current, { view: "grid" })}
              className={`p-2 ${view === "grid" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
