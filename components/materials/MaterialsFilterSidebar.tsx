"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { materialsHref, type MaterialsQuery } from "./query";

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
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function MaterialsFilterSidebar({
  current,
  subjects,
}: {
  current: MaterialsQuery;
  subjects: { value: string; label: string }[];
}) {
  const [subjectQuery, setSubjectQuery] = useState("");
  const scrollRef = useRef<HTMLElement>(null);

  const filteredSubjects = useMemo(() => {
    const q = subjectQuery.trim().toLowerCase();
    const selected = subjects.find((item) => item.value === current.subject);
    const matches = q
      ? subjects.filter((item) => item.label.toLowerCase().includes(q))
      : subjects;
    const rest = matches.filter((item) => item.value !== current.subject);
    return selected && (!q || selected.label.toLowerCase().includes(q))
      ? [selected, ...rest]
      : rest;
  }, [subjectQuery, subjects, current.subject]);

  const hasFilters = Boolean(
    current.type || current.category || current.subject || current.semester || current.tag || current.q || current.college
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
            href={materialsHref(current, { type: current.type === item.value ? "" : item.value })}
            active={current.type === item.value}
            label={item.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Category">
        {categories.map((item) => (
          <FilterLink
            key={item.value}
            href={materialsHref(current, {
              category: current.category === item.value ? "" : item.value,
            })}
            active={current.category === item.value}
            label={item.label}
          />
        ))}
      </FilterGroup>

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
            href={materialsHref(current, {
              subject: current.subject === item.value ? "" : item.value,
            })}
            active={current.subject === item.value}
            label={item.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Semester">
        {semesters.map((sem) => (
          <FilterLink
            key={sem}
            href={materialsHref(current, {
              semester: current.semester === String(sem) ? "" : String(sem),
            })}
            active={current.semester === String(sem)}
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
            <Link href="/materials" className="text-xs font-semibold text-[var(--primary)] hover:underline">
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
            <Link href="/materials" className="text-xs font-semibold text-[var(--primary)] hover:underline">
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
}: {
  href: string;
  active: boolean;
  label: string;
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
      <span className="truncate">{label}</span>
    </Link>
  );
}
