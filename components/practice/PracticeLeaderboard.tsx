"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { Breadcrumb, ListSkeleton } from "./practice-ui";

type Row = {
  rank: number;
  name: string;
  slug: string;
  solvedCount: number;
  currentStreak: number;
  longestStreak: number;
};

export default function PracticeLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/practice/leaderboard")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load the leaderboard");
        setRows(data.leaderboard || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ href: "/", label: "Home" }, { href: "/practice", label: "Practice" }, { label: "Leaderboard" }]} />
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Leaderboard</h1>
          <p className="text-slate-500 mt-1">Ranked by problems solved, then by the current streak. A streak only counts if you solved something today or yesterday.</p>
        </div>
      </div>
      {loading ? <ListSkeleton /> : null}
      {!loading ? <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        {rows.map((row) => (
          <Link key={row.slug} href={`/users/${row.slug}`} className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-violet-50/40">
            <span className={`w-8 text-center font-extrabold ${row.rank <= 3 ? "text-[var(--primary)]" : "text-slate-400"}`}>{row.rank}</span>
            <span className="w-9 h-9 rounded-full bg-violet-100 text-[var(--primary)] text-sm font-extrabold inline-flex items-center justify-center">
              {(row.name || "S").slice(0, 1).toUpperCase()}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block font-bold text-slate-900 truncate">{row.name}</span>
              <span className="text-xs text-slate-500">{row.currentStreak} day streak · best {row.longestStreak}</span>
            </span>
            <span className="text-sm font-bold text-slate-700">{row.solvedCount} solved</span>
          </Link>
        ))}
        {error ? <p className="p-4 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && rows.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Solve a problem to appear here.</p> : null}
      </div> : null}
    </div>
  );
}
