"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Grid3X3, List, ChevronDown } from "lucide-react";
import { listHas, parseList } from "@/lib/filter-list";
import { materialsHref, type MaterialsQuery } from "./query";

const tabs = [
  { key: "all", label: "All Materials", params: {} },
  { key: "notes", label: "Notes", params: { category: "notes" } },
  { key: "videos", label: "Videos", params: { type: "video" } },
  { key: "pdfs", label: "PDFs", params: { type: "pdf" } },
  { key: "papers", label: "Question Papers", params: { category: "question_paper" } },
  { key: "assignments", label: "Assignments", params: { category: "assignment" } },
  { key: "syllabus", label: "Syllabus", params: { category: "syllabus" } },
  { key: "links", label: "Links", params: { type: "link" } },
];

const sorts = [
  { value: "latest", label: "Latest" },
  { value: "popular", label: "Most viewed" },
  { value: "downloads", label: "Most downloaded" },
  { value: "rating", label: "Top rated" },
];

function activeTab(current: MaterialsQuery) {
  const types = parseList(current.type);
  const categories = parseList(current.category);
  if (listHas(current.category, "notes") && types.length === 0 && categories.length === 1) return "notes";
  if (listHas(current.type, "video") && categories.length === 0 && types.length === 1) return "videos";
  if (listHas(current.type, "pdf") && categories.length === 0 && types.length === 1) return "pdfs";
  if (listHas(current.category, "question_paper") && categories.length === 1) return "papers";
  if (listHas(current.category, "assignment") && categories.length === 1) return "assignments";
  if (listHas(current.category, "syllabus") && categories.length === 1) return "syllabus";
  if (listHas(current.type, "link") && types.length === 1) return "links";
  if (!types.length && !categories.length) return "all";
  return "";
}

export default function MaterialsToolbar({
  current,
}: {
  current: MaterialsQuery;
}) {
  const router = useRouter();
  const currentTab = activeTab(current);
  const view = current.view === "list" ? "list" : "grid";
  const sort = current.sort || "latest";

  return (
    <div className="space-y-4">
      <div className="flex flex-col xl:flex-row xl:items-center gap-3 justify-between">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {tabs.map((tab) => {
            const active = currentTab === tab.key;
            const params: MaterialsQuery = {
              q: current.q,
              subject: current.subject,
              tag: current.tag,
              sort: current.sort,
              view: current.view,
              semester: current.semester,
              college: current.college,
              chapter: current.chapter,
              program: current.program,
              ...tab.params,
            };
            return (
              <Link
                key={tab.key}
                href={materialsHref({}, params)}
                className={`shrink-0 px-3.5 py-2 rounded-full text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--primary)] text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="relative">
            <select
              value={sort}
              onChange={(event) => router.push(materialsHref(current, { sort: event.target.value }))}
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
              href={materialsHref(current, { view: "grid" })}
              className={`p-2 ${view === "grid" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
              aria-label="Grid view"
            >
              <Grid3X3 className="w-4 h-4" />
            </Link>
            <Link
              href={materialsHref(current, { view: "list" })}
              className={`p-2 ${view === "list" ? "bg-violet-50 text-[var(--primary)]" : "text-slate-400 hover:text-slate-700"}`}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
