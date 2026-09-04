"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { collegesHref, type CollegesQuery } from "./query";
import { listHas, parseList, toggleCsv } from "@/lib/filter-list";

export default function CollegesFilterSidebar({
  current,
  locations,
  branches,
  programs,
}: {
  current: CollegesQuery;
  locations: string[];
  branches: string[];
  programs: { value: string; label: string }[];
}) {
  const scrollRef = useRef<HTMLElement>(null);
  const hasFilters = Boolean(current.location || current.branch || current.program || current.q);

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
      <FilterGroup title="Location">
        <FilterLink
          href={collegesHref(current, { location: "" })}
          active={!parseList(current.location).length}
          label="All locations"
        />
        {locations.map((location) => (
          <FilterLink
            key={location}
            href={collegesHref(current, { location: toggleCsv(current.location, location) })}
            active={listHas(current.location, location)}
            label={location}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Program">
        <FilterLink href={collegesHref(current, { program: "" })} active={!parseList(current.program).length} label="All programs" />
        {programs.map((item) => (
          <FilterLink
            key={item.value}
            href={collegesHref(current, { program: toggleCsv(current.program, item.value) })}
            active={listHas(current.program, item.value)}
            label={item.label}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Branch">
        <FilterLink href={collegesHref(current, { branch: "" })} active={!parseList(current.branch).length} label="All branches" />
        {branches.map((branch) => (
          <FilterLink
            key={branch}
            href={collegesHref(current, { branch: toggleCsv(current.branch, branch) })}
            active={listHas(current.branch, branch)}
            label={branch}
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
            <Link href="/colleges" className="text-xs font-semibold text-[var(--primary)] hover:underline">
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900">Filters</h2>
          {hasFilters && (
            <Link href="/colleges" className="text-xs font-semibold text-[var(--primary)] hover:underline">
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

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
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
