"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Filter, X } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

interface Props {
  types: FilterOption[];
  categories: FilterOption[];
  subjects: FilterOption[];
  current: { type?: string; category?: string; subject?: string; q?: string };
}

type FilterKey = "type" | "category" | "subject";

export default function MaterialFilters({
  types,
  categories,
  subjects,
  current,
}: Props) {
  const router = useRouter();
  const [openKey, setOpenKey] = useState<FilterKey | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openKey) return;

    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenKey(null);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenKey(null);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openKey]);

  const apply = (key: FilterKey, value: string) => {
    const query = new URLSearchParams();
    const next = { ...current, [key]: value || undefined };
    (["q", "type", "category", "subject"] as const).forEach((param) => {
      const paramValue = next[param];
      if (paramValue) query.set(param, paramValue);
    });
    setOpenKey(null);
    const queryString = query.toString();
    router.push(queryString ? `/materials?${queryString}` : "/materials");
  };

  const hasFilters = Boolean(
    current.type || current.category || current.subject || current.q
  );

  return (
    <div ref={containerRef} className="flex flex-wrap items-center gap-2">
      <Filter className="w-4 h-4 text-slate-400 shrink-0" />

      <Dropdown
        label="Type"
        allLabel="All Types"
        options={types}
        selected={current.type}
        open={openKey === "type"}
        onToggle={() => setOpenKey(openKey === "type" ? null : "type")}
        onSelect={(value) => apply("type", value)}
      />
      <Dropdown
        label="Category"
        allLabel="All Categories"
        options={categories}
        selected={current.category}
        open={openKey === "category"}
        onToggle={() => setOpenKey(openKey === "category" ? null : "category")}
        onSelect={(value) => apply("category", value)}
      />
      <Dropdown
        label="Subject"
        allLabel="All Subjects"
        options={subjects}
        selected={current.subject}
        open={openKey === "subject"}
        onToggle={() => setOpenKey(openKey === "subject" ? null : "subject")}
        onSelect={(value) => apply("subject", value)}
      />

      {hasFilters && (
        <button
          type="button"
          onClick={() => router.push("/materials")}
          className="inline-flex items-center gap-1 px-3 py-2 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
        >
          <X className="w-3 h-3" />
          Clear all
        </button>
      )}
    </div>
  );
}

function Dropdown({
  label,
  allLabel,
  options,
  selected,
  open,
  onToggle,
  onSelect,
}: {
  label: string;
  allLabel: string;
  options: FilterOption[];
  selected?: string;
  open: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) {
  const selectedOption = options.find((option) => option.value === selected);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-colors ${
          selectedOption
            ? "border-violet-200 bg-violet-50 text-violet-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-600"
        }`}
      >
        <span className="text-slate-400">{label}:</span>
        <span className="max-w-[10rem] truncate">
          {selectedOption ? selectedOption.label : "All"}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-20 mt-1 w-56 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1 shadow-lg"
        >
          <Option
            label={allLabel}
            active={!selectedOption}
            onClick={() => onSelect("")}
          />
          {options.map((option) => (
            <Option
              key={option.value}
              label={option.label}
              active={option.value === selected}
              onClick={() => onSelect(option.value)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Option({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium transition-colors ${
        active
          ? "bg-violet-50 text-violet-700"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      <span className="truncate">{label}</span>
      {active && <Check className="w-3.5 h-3.5 shrink-0" />}
    </button>
  );
}
