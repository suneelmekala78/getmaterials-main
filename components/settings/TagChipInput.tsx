"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

type Props = {
  label: string;
  hint?: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  maxItems?: number;
};

export function TagChipInput({
  label,
  hint,
  values,
  onChange,
  placeholder = "Type and press Enter",
  maxItems = 20,
}: Props) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/\s+/g, " ");
    if (!tag) return;
    if (values.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    if (values.length >= maxItems) return;
    onChange([...values, tag.slice(0, 40)]);
    setDraft("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === "Backspace" && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <div className="rounded-xl border border-slate-200 px-3 py-2.5 focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
        <div className="flex flex-wrap gap-2 mb-2">
          {values.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-semibold"
            >
              {tag}
              <button
                type="button"
                onClick={() => onChange(values.filter((item) => item !== tag))}
                className="hover:text-violet-900"
                aria-label={`Remove ${tag}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value.slice(0, 40))}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={values.length >= maxItems ? `Max ${maxItems} items` : placeholder}
          disabled={values.length >= maxItems}
          className="w-full text-sm outline-none disabled:text-slate-300"
        />
      </div>
      {hint ? <p className="text-xs text-slate-400 mt-1">{hint}</p> : null}
    </div>
  );
}
