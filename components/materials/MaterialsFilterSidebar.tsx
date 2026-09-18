"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { materialsHref, type MaterialsQuery } from "./query";
import { listHas, parseList, toggleCsv, type QueryParam } from "@/lib/filter-list";

const types = [
  { value: "pdf", label: "PDFs" },
  { value: "video", label: "Videos" },
  { value: "link", label: "Links" },
  { value: "image", label: "Images" },
  { value: "assignment", label: "Assignments" },
];

const categories = [
  { value: "notes", label: "Notes" },
  { value: "question_paper", label: "Question Papers" },
  { value: "syllabus", label: "Syllabus" },
  { value: "assignment", label: "Assignments" },
  { value: "lab_manual", label: "Lab Manuals" },
  { value: "reference", label: "References" },
  { value: "other", label: "Other" },
];

const programs = [
  { value: "btech", label: "B.Tech" },
  { value: "mtech", label: "M.Tech" },
  { value: "mca", label: "MCA" },
  { value: "bca", label: "BCA" },
  { value: "bsc", label: "B.Sc" },
  { value: "msc", label: "M.Sc" },
  { value: "mba", label: "MBA" },
  { value: "bba", label: "BBA" },
  { value: "diploma", label: "Diploma" },
  { value: "phd", label: "Ph.D" },
  { value: "other", label: "Other" },
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MaterialsFilterSidebar({
  current,
  subjects,
  chapters,
  colleges,
  basePath = "/materials",
  hideSubjects = false,
  hideColleges = false,
}: {
  current: MaterialsQuery;
  subjects: { value: string; label: string }[];
  chapters: { value: string; label: string }[];
  colleges: { value: string; label: string }[];
  basePath?: string;
  hideSubjects?: boolean;
  hideColleges?: boolean;
}) {
  const [subjectQuery, setSubjectQuery] = useState("");
  const [chapterQuery, setChapterQuery] = useState("");
  const [collegeQuery, setCollegeQuery] = useState("");
  const scrollRef = useRef<HTMLElement>(null);

  const filteredSubjects = useSearchable(subjects, subjectQuery, current.subject);
  const filteredChapters = useSearchable(chapters, chapterQuery, current.chapter);
  const filteredCollegesRaw = useSearchable(colleges, collegeQuery, current.college);
  const filteredColleges = useMemo(() => {
    const seen = new Set<string>();
    return filteredCollegesRaw.filter((item) => {
      if (seen.has(item.value)) return false;
      seen.add(item.value);
      return true;
    });
  }, [filteredCollegesRaw]);

  const hasFilters = Boolean(
    current.type ||
      current.category ||
      current.subject ||
      current.semester ||
      current.tag ||
      current.q ||
      current.college ||
      current.chapter ||
      current.program
  );

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      event.stopPropagation();
      el.scrollTop += event.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const groups = (
    <>
      <FilterGroup title="Material Type">
        {types.map((item) => (
          <FilterLink
            key={item.value}
            href={materialsHref(current, { type: toggleCsv(current.type, item.value) }, basePath)}
            active={listHas(current.type, item.value)}
            label={item.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Category">
        {categories.map((item) => (
          <FilterLink
            key={item.value}
            href={materialsHref(current, { category: toggleCsv(current.category, item.value) }, basePath)}
            active={listHas(current.category, item.value)}
            label={item.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Program">
        {programs.map((item) => (
          <FilterLink
            key={item.value}
            href={materialsHref(current, { program: toggleCsv(current.program, item.value) }, basePath)}
            active={listHas(current.program, item.value)}
            label={item.label}
          />
        ))}
      </FilterGroup>

      {!hideSubjects ? (
      <FilterGroup title="Subjects">
        <input
          type="search"
          value={subjectQuery}
          onChange={(event) => setSubjectQuery(event.target.value)}
          placeholder="Search subjects"
          className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-violet-400"
        />
        {filteredSubjects.map((item) => (
          <FilterLink
            key={item.value}
            href={materialsHref(current, { subject: toggleCsv(current.subject, item.value) }, basePath)}
            active={listHas(current.subject, item.value)}
            label={item.label}
          />
        ))}
      </FilterGroup>
      ) : null}

      <FilterGroup title="Chapter">
        <p className="text-[11px] text-slate-400 mb-2">
          {current.subject || hideSubjects
            ? "Chapters for this subject"
            : "Select a subject to narrow chapters"}
        </p>
        <input
          type="search"
          value={chapterQuery}
          onChange={(event) => setChapterQuery(event.target.value)}
          placeholder="Search chapters"
          className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-violet-400"
        />
        {filteredChapters.length ? (
          filteredChapters.map((item, index) => (
            <FilterLink
              key={`${item.value}-${index}`}
              href={materialsHref(current, { chapter: toggleCsv(current.chapter, item.value) }, basePath)}
              active={listHas(current.chapter, item.value)}
              label={item.label}
            />
          ))
        ) : (
          <p className="text-xs text-slate-400 px-2 py-1">No chapters found.</p>
        )}
      </FilterGroup>

      {!hideColleges ? (
      <FilterGroup title="College">
        <input
          type="search"
          value={collegeQuery}
          onChange={(event) => setCollegeQuery(event.target.value)}
          placeholder="Search colleges"
          className="w-full mb-2 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-violet-400"
        />
        {filteredColleges.map((item, index) => (
          <FilterLink
            key={`${item.value}-${index}`}
            href={materialsHref(current, { college: toggleCsv(current.college, item.value) }, basePath)}
            active={listHas(current.college, item.value)}
            label={item.label}
            title={item.label}
          />
        ))}
      </FilterGroup>
      ) : null}

      <FilterGroup title="Semester">
        {semesters.map((sem) => (
          <FilterLink
            key={sem}
            href={materialsHref(current, { semester: toggleCsv(current.semester, String(sem)) }, basePath)}
            active={listHas(current.semester, String(sem))}
            label={`Semester ${sem}`}
          />
        ))}
      </FilterGroup>
    </>
  );

  return (
    <div className="min-w-0 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)]">
      <details className="lg:hidden bg-white rounded-2xl border border-slate-100 p-4">
        <summary className="flex items-center justify-between font-bold text-slate-900 cursor-pointer list-none">
          <span>Filters</span>
          {hasFilters && (
            <Link href={basePath} className="text-xs font-semibold text-[var(--primary)] hover:underline">
              Clear All
            </Link>
          )}
        </summary>
        <div className="mt-4 max-h-[60vh] overflow-y-auto overscroll-contain">{groups}</div>
      </details>
      <aside
        ref={scrollRef}
        className="hidden lg:flex flex-col h-full max-h-[calc(100vh-7rem)] overflow-y-auto overscroll-contain bg-white rounded-2xl border border-slate-100 p-5"
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="font-bold text-slate-900">Filters</h2>
          {hasFilters && (
            <Link href={basePath} className="text-xs font-semibold text-[var(--primary)] hover:underline">
              Clear All
            </Link>
          )}
        </div>
        {groups}
      </aside>
    </div>
  );
}

function useSearchable(
  items: { value: string; label: string }[],
  query: string,
  selectedCsv?: QueryParam
) {
  return useMemo(() => {
    const q = query.trim().toLowerCase();
    const selectedValues = parseList(selectedCsv);
    const selected = items.filter((item) => selectedValues.includes(item.value));
    const matches = q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    const rest = matches.filter((item) => !selectedValues.includes(item.value));
    return selected.length ? [...selected, ...rest.filter((item) => !q || item.label.toLowerCase().includes(q))] : rest;
  }, [items, query, selectedCsv]);
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-5 pb-5 border-b border-slate-100 last:mb-0 last:pb-0 last:border-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  label,
  title,
}: {
  href: string;
  active: boolean;
  label: string;
  title?: string;
}) {
  return (
    <Link
      href={href}
      title={title || label}
      className={`flex items-start gap-2.5 px-2 py-1.5 rounded-lg text-sm min-w-0 ${
        active ? "bg-violet-50 text-violet-700 font-semibold" : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span
        className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center text-[10px] leading-none ${
          active ? "bg-[var(--primary)] border-[var(--primary)] text-white" : "border-slate-300 bg-white"
        }`}
      >
        {active ? "✓" : ""}
      </span>
      <span className="min-w-0 flex-1 break-words leading-snug">{label}</span>
    </Link>
  );
}
