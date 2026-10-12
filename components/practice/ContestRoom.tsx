"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Breadcrumb, DifficultyBadge, ListSkeleton } from "./practice-ui";

type Contest = {
  title: string;
  slug: string;
  phase: "upcoming" | "live" | "ended";
  startAt: string;
  endAt: string;
  problems: { slug: string; title: string; difficulty: string; points: number }[];
};

type Row = { rank: number; name: string; slug: string; solved: number; penaltySeconds: number };

function formatPenalty(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  if (hours) return `${hours}h ${minutes}m`;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const phaseStyle = {
  live: "bg-emerald-50 text-emerald-700",
  upcoming: "bg-violet-50 text-violet-700",
  ended: "bg-slate-100 text-slate-600",
};

export default function ContestRoom({ slug }: { slug: string }) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [missing, setMissing] = useState(false);
  const [board, setBoard] = useState<Row[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = () => {
      fetch(`/api/practice/contests/${slug}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (cancelled) return;
          if (!res.ok || !data.contest) {
            setMissing(true);
            return;
          }
          setContest(data.contest);
        })
        .catch(() => {
          if (!cancelled) setMissing(true);
        });
      fetch(`/api/practice/contests/${slug}/leaderboard`)
        .then((res) => (res.ok ? res.json() : { leaderboard: [] }))
        .then((data) => {
          if (!cancelled) setBoard(data.leaderboard || []);
        })
        .catch(() => undefined);
    };
    load();
    const timer = setInterval(load, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [slug]);

  if (missing) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-extrabold">Contest not found</h1>
        <Link href="/practice/contests" className="inline-flex mt-4 font-bold text-[var(--primary)]">All contests</Link>
      </div>
    );
  }

  if (!contest) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
        <ListSkeleton rows={4} />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb items={[{ href: "/practice", label: "Practice" }, { href: "/practice/contests", label: "Contests" }, { label: contest.title }]} />
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <h1 className="text-3xl font-extrabold text-slate-900">{contest.title}</h1>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${phaseStyle[contest.phase]}`}>{contest.phase}</span>
      </div>
      <p className="text-sm text-slate-500 mb-6">
        {new Date(contest.startAt).toLocaleString()} – {new Date(contest.endAt).toLocaleString()}
      </p>

      {contest.phase === "upcoming" ? (
        <div className="rounded-2xl border border-violet-100 bg-violet-50 px-4 py-4 text-sm text-violet-900 mb-6">
          Problems appear when the contest starts. You can watch the ranking once people begin submitting.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
          {contest.problems.map((problem, index) => (
            <Link
              key={problem.slug}
              href={`/practice/${problem.slug}?contest=${contest.slug}`}
              className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-violet-50/40"
            >
              <span className="w-6 text-sm font-bold text-slate-400">{index + 1}</span>
              <span className="flex-1 font-semibold text-slate-900">{problem.title}</span>
              <DifficultyBadge difficulty={problem.difficulty} />
            </Link>
          ))}
          {contest.problems.length === 0 ? <p className="p-4 text-sm text-slate-500">No problems in this contest.</p> : null}
        </div>
      )}

      <h2 className="font-extrabold text-slate-900 mb-2">Ranking</h2>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100">
          <span>#</span>
          <span>Student</span>
          <span>Solved</span>
          <span className="text-right">Penalty</span>
        </div>
        {board.map((row) => (
          <div key={row.slug} className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-2 items-center px-4 py-3 border-b border-slate-100 last:border-b-0 text-sm">
            <span className={`font-extrabold ${row.rank <= 3 ? "text-[var(--primary)]" : "text-slate-400"}`}>{row.rank}</span>
            <Link href={`/users/${row.slug}`} className="font-semibold text-slate-900 hover:text-[var(--primary)] truncate">{row.name}</Link>
            <span>{row.solved}</span>
            <span className="text-right text-slate-500">{formatPenalty(row.penaltySeconds)}</span>
          </div>
        ))}
        {board.length === 0 ? <p className="p-4 text-sm text-slate-500">No submissions yet.</p> : null}
      </div>
    </div>
  );
}
