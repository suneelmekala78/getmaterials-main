"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Code2 } from "lucide-react";

type Stats = {
  currentStreak: number;
  longestStreak: number;
  solvedCount: number;
};

export function PracticeStreakCard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/practice/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStats(data))
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mt-5 max-w-lg rounded-2xl border border-violet-100 bg-violet-50/40 p-4">
        <div className="h-4 w-24 bg-violet-100 rounded animate-pulse" />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="h-14 rounded-xl bg-white/80 animate-pulse" />
          <div className="h-14 rounded-xl bg-white/80 animate-pulse" />
          <div className="h-14 rounded-xl bg-white/80 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <Link href="/practice" className="mt-5 block max-w-lg rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-4 hover:border-violet-200">
      <span className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-2 font-bold text-slate-900">
          <Code2 className="w-4 h-4 text-[var(--primary)]" />
          Practice
        </span>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </span>
      <span className="mt-3 grid grid-cols-3 gap-2">
        <Stat label="Streak" value={`${stats.currentStreak}d`} />
        <Stat label="Best" value={`${stats.longestStreak}d`} />
        <Stat label="Solved" value={String(stats.solvedCount)} />
      </span>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-xl bg-white/80 px-2 py-2">
      <span className="block text-lg font-extrabold text-slate-900">{value}</span>
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
    </span>
  );
}
