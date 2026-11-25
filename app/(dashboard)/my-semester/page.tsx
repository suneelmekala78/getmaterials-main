"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Loader2,
  MessagesSquare,
} from "lucide-react";

type Headline = {
  program: string;
  branch: string;
  year: string;
  semester: string;
  collegeName: string;
};

type SubjectCard = {
  id: string;
  name: string;
  slug: string;
  counts: {
    notes: number;
    papers: number;
    quizzes: number;
    discussions: number;
  };
};

export default function MySemesterPage() {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [headline, setHeadline] = useState<Headline | null>(null);
  const [subjects, setSubjects] = useState<SubjectCard[]>([]);

  useEffect(() => {
    fetch("/api/study/my-semester")
      .then((r) => r.json())
      .then((data) => {
        setNeedsSetup(Boolean(data.needsSetup));
        setHeadline(data.headline || null);
        setSubjects(data.subjects || []);
      })
      .catch(() => setNeedsSetup(true))
      .finally(() => setLoading(false));
  }, []);

  const headlineText = headline
    ? [headline.program, headline.branch, headline.year, headline.semester]
        .filter(Boolean)
        .join(" · ")
    : "";

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (needsSetup || subjects.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mx-auto">
          <GraduationCap className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Set up My Semester</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Tell us your college, course, branch, and semester so we can build your
          academic workspace with notes, papers, quizzes, and discussions.
        </p>
        <Link
          href="/welcome?next=/my-semester"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-semibold"
        >
          Complete study profile
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
            My Semester
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {headlineText || "Your semester"}
          </h1>
          {headline?.collegeName ? (
            <p className="text-sm text-slate-500 mt-1">{headline.collegeName}</p>
          ) : null}
        </div>
        <Link
          href="/welcome?next=/my-semester"
          className="text-sm font-semibold text-violet-600 hover:underline"
        >
          Edit study profile
        </Link>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-slate-900">Subjects</h2>
          <p className="text-sm text-slate-500">{subjects.length} subjects</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {subjects.map((subject) => (
            <Link
              key={subject.id}
              href={`/my-semester/subject/${subject.id}`}
              className="block bg-white border border-slate-100 rounded-2xl p-5 hover:border-violet-200 hover:shadow-sm transition"
            >
              <h3 className="font-bold text-slate-900 text-lg">{subject.name}</h3>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Bucket
                  icon={BookOpen}
                  label="Notes"
                  count={subject.counts.notes}
                />
                <Bucket
                  icon={FileText}
                  label="Papers"
                  count={subject.counts.papers}
                />
                <Bucket
                  icon={ClipboardCheck}
                  label="Quizzes"
                  count={subject.counts.quizzes}
                />
                <Bucket
                  icon={MessagesSquare}
                  label="Discussions"
                  count={subject.counts.discussions}
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function Bucket({
  icon: Icon,
  label,
  count,
}: {
  icon: typeof BookOpen;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <Icon className="w-3.5 h-3.5 text-violet-600 shrink-0" />
      <span className="text-xs font-medium text-slate-600">{label}</span>
      <span className="ml-auto text-xs font-bold tabular-nums text-slate-900">
        {count}
      </span>
    </div>
  );
}
