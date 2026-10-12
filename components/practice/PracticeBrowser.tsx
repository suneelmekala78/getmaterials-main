"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Check, Circle, Code2, Flame, Search, Trophy } from "lucide-react";
import { Breadcrumb, DifficultyBadge, ListSkeleton } from "./practice-ui";

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  acceptance: number;
  status: "todo" | "attempted" | "solved";
};

type Streak = { currentStreak: number; longestStreak: number; solvedCount: number } | null;

const difficulties = [
  { id: "", label: "All" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

const statuses = [
  { id: "", label: "Any status" },
  { id: "todo", label: "Todo" },
  { id: "attempted", label: "Attempted" },
  { id: "solved", label: "Solved" },
];

export default function PracticeBrowser() {
  const { status: authStatus } = useSession();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [streak, setStreak] = useState<Streak>(null);
  const [q, setQ] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tag, setTag] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (difficulty) params.set("difficulty", difficulty);
    if (tag) params.set("tag", tag);
    if (status) params.set("status", status);
    const timer = setTimeout(() => {
      setLoading(true);
      setError("");
      fetch(`/api/practice/problems?${params}`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error || "Could not load problems");
          setProblems(data.problems || []);
          setTags(data.tags || []);
          setStreak(data.streak || null);
        })
        .catch((err: Error) => {
          setProblems([]);
          setError(err.message || "Could not load problems");
        })
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(timer);
  }, [q, difficulty, tag, status]);

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb items={[{ href: "/", label: "Home" }, { label: "Practice" }]} />

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-[var(--primary)] flex items-center justify-center shrink-0">
            <Code2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Practice</h1>
            <p className="text-slate-500 mt-1 max-w-xl">
              Solve original coding problems in JavaScript, Python, Java, and C++. Run samples, then submit against hidden tests.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/practice/contests" className="inline-flex items-center gap-2 border border-slate-200 bg-white text-slate-700 font-bold px-4 py-2.5 rounded-xl text-sm hover:border-violet-200">
            Contests
          </Link>
          <Link href="/practice/leaderboard" className="inline-flex items-center gap-2 bg-[var(--primary)] text-white font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90">
            <Trophy className="w-4 h-4" />
            Leaderboard
          </Link>
        </div>
      </div>

      {streak ? (
        <div className="grid sm:grid-cols-3 gap-3 mb-6">
          <Metric icon={<Flame className="w-4 h-4" />} label="Current streak" value={`${streak.currentStreak} day${streak.currentStreak === 1 ? "" : "s"}`} hint="A new accepted problem keeps the day going" />
          <Metric icon={<Trophy className="w-4 h-4" />} label="Longest streak" value={`${streak.longestStreak} day${streak.longestStreak === 1 ? "" : "s"}`} hint="Your best run so far" />
          <Metric icon={<Check className="w-4 h-4" />} label="Solved" value={String(streak.solvedCount)} hint="Accepted at least once" />
        </div>
      ) : authStatus === "unauthenticated" ? (
        <Link href="/login?callbackUrl=%2Fpractice" className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm">
          <span className="text-slate-700">Sign in to save streaks, submissions, and solved problems.</span>
          <span className="font-bold text-[var(--primary)] shrink-0">Sign in</span>
        </Link>
      ) : null}

      <div className="bg-white border border-slate-200 rounded-2xl p-3 mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-violet-300"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((item) => (
            <FilterChip key={item.id || "all-diff"} active={difficulty === item.id} onClick={() => setDifficulty(item.id)}>
              {item.label}
            </FilterChip>
          ))}
          <span className="w-px bg-slate-200 mx-1 hidden sm:block" />
          {statuses.map((item) => (
            <FilterChip key={item.id || "any-status"} active={status === item.id} onClick={() => setStatus(item.id)}>
              {item.label}
            </FilterChip>
          ))}
          {tags.map((item) => (
            <FilterChip key={item} active={tag === item} onClick={() => setTag(tag === item ? "" : item)}>
              {item}
            </FilterChip>
          ))}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="hidden sm:grid grid-cols-[2.5rem_1fr_7rem_5rem] gap-3 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-400 border-b border-slate-100">
          <span />
          <span>Problem</span>
          <span>Difficulty</span>
          <span className="text-right">Accepted</span>
        </div>
        {problems.map((problem, index) => (
          <Link
            key={problem.id}
            href={`/practice/${problem.slug}`}
            className="grid sm:grid-cols-[2.5rem_1fr_7rem_5rem] gap-2 sm:gap-3 items-center px-4 py-3.5 border-b border-slate-100 last:border-b-0 hover:bg-violet-50/40 transition"
          >
            <span className="hidden sm:flex justify-center">
              <StatusMark status={problem.status} index={index + 1} />
            </span>
            <span className="min-w-0">
              <span className="flex items-center gap-2">
                <span className="sm:hidden"><StatusMark status={problem.status} index={index + 1} /></span>
                <span className="font-semibold text-slate-900 truncate">{problem.title}</span>
              </span>
              <span className="mt-1 flex flex-wrap gap-1.5">
                {problem.tags.map((item) => (
                  <span key={item} className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                    {item}
                  </span>
                ))}
              </span>
            </span>
            <DifficultyBadge difficulty={problem.difficulty} />
            <span className="text-sm text-slate-500 sm:text-right">{problem.acceptance}%</span>
          </Link>
        ))}
        {error ? <p className="p-6 text-sm text-rose-600">{error}</p> : null}
        {!loading && !error && problems.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-bold text-slate-800">No problems match</p>
            <p className="text-sm text-slate-500 mt-1">Clear a filter or try another search.</p>
          </div>
        ) : null}
        {loading && problems.length === 0 && !error ? <ListSkeleton bare /> : null}
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
        active ? "bg-[var(--primary)] text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

function StatusMark({ status, index }: { status: Problem["status"]; index: number }) {
  if (status === "solved") {
    return (
      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 inline-flex items-center justify-center" title="Solved">
        <Check className="w-3.5 h-3.5" />
      </span>
    );
  }
  if (status === "attempted") {
    return (
      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 inline-flex items-center justify-center text-[11px] font-bold" title="Attempted">
        {index}
      </span>
    );
  }
  return (
    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 inline-flex items-center justify-center" title="Todo">
      <Circle className="w-3 h-3" />
    </span>
  );
}

function Metric({
  icon,
  label,
  value,
  hint,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3">
      <div className="flex items-center gap-2 text-[var(--primary)]">{icon}<span className="text-xs font-bold text-slate-500">{label}</span></div>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400 mt-0.5">{hint}</p>
    </div>
  );
}
