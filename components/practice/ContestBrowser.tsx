"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Trophy } from "lucide-react";
import { Breadcrumb, ListSkeleton } from "./practice-ui";

type Contest = {
  id: string;
  title: string;
  slug: string;
  phase: "upcoming" | "live" | "ended";
  startAt: string;
  endAt: string;
  problemCount: number;
};

const phaseStyle: Record<Contest["phase"], string> = {
  live: "bg-emerald-50 text-emerald-700",
  upcoming: "bg-violet-50 text-violet-700",
  ended: "bg-slate-100 text-slate-600",
};

export default function ContestBrowser() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/practice/contests")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "Could not load contests");
        setContests(data.contests || []);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ href: "/", label: "Home" }, { href: "/practice", label: "Practice" }, { label: "Contests" }]} />
      <div className="flex items-start gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center">
          <Trophy className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Contests</h1>
          <p className="text-slate-500 mt-1">Timed sets of problems. Ranking uses solves, then time plus a 5-minute penalty for each wrong submit.</p>
        </div>
      </div>
      <div className="space-y-3">
        {contests.map((contest) => (
          <Link key={contest.id} href={`/practice/contests/${contest.slug}`} className="block bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-violet-200 transition">
            <div className="flex items-center justify-between gap-3">
              <p className="font-extrabold text-slate-900">{contest.title}</p>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${phaseStyle[contest.phase]}`}>{contest.phase}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500 inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(contest.startAt).toLocaleString()} – {new Date(contest.endAt).toLocaleString()}
            </p>
            <p className="text-xs text-slate-400 mt-1">{contest.problemCount} problems</p>
          </Link>
        ))}
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && contests.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <p className="font-bold text-slate-800">No contests yet</p>
            <p className="text-sm text-slate-500 mt-1">When an admin publishes one, it will show up here.</p>
          </div>
        ) : null}
        {loading ? <ListSkeleton rows={4} /> : null}
      </div>
    </div>
  );
}
