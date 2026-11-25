"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Loader2,
  MessagesSquare,
  Plus,
} from "lucide-react";

type MaterialItem = {
  id: string;
  title: string;
  slug: string;
};

type QuizItem = {
  id: string;
  title: string;
  slug: string;
  duration?: number | null;
};

type ThreadItem = {
  id: string;
  title: string;
  replyCount: number;
};

export default function MySemesterSubjectPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [notes, setNotes] = useState<MaterialItem[]>([]);
  const [papers, setPapers] = useState<MaterialItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [discussions, setDiscussions] = useState<ThreadItem[]>([]);
  const [counts, setCounts] = useState({
    notes: 0,
    papers: 0,
    quizzes: 0,
    discussions: 0,
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/study/my-semester/subjects/${encodeURIComponent(id)}`)
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          throw new Error(data.error || "Not found");
        }
        return r.json();
      })
      .then((data) => {
        setSubjectName(data.subject?.name || "Subject");
        setNotes(data.notes?.items || []);
        setPapers(data.papers?.items || []);
        setQuizzes(data.quizzes?.items || []);
        setDiscussions(data.discussions?.items || []);
        setCounts({
          notes: data.notes?.count || 0,
          papers: data.papers?.count || 0,
          quizzes: data.quizzes?.count || 0,
          discussions: data.discussions?.count || 0,
        });
      })
      .catch((e) => setError(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-3">
        <p className="text-slate-600">{error}</p>
        <Link href="/my-semester" className="text-sm font-semibold text-violet-600 hover:underline">
          ← My Semester
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div>
        <Link href="/my-semester" className="text-sm text-violet-600 hover:underline font-medium">
          ← My Semester
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
          {subjectName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Notes, previous papers, quizzes, and discussions for this subject.
        </p>
      </div>

      <Section
        icon={BookOpen}
        title="Notes"
        count={counts.notes}
        empty="No notes yet for this subject."
      >
        {notes.map((item) => (
          <ListLink key={item.id} href={`/materials/${item.slug}`} title={item.title} />
        ))}
      </Section>

      <Section
        icon={FileText}
        title="Previous papers"
        count={counts.papers}
        empty="No question papers yet."
      >
        {papers.map((item) => (
          <ListLink key={item.id} href={`/materials/${item.slug}`} title={item.title} />
        ))}
      </Section>

      <Section
        icon={ClipboardCheck}
        title="Quizzes"
        count={counts.quizzes}
        empty="No quizzes for this subject yet."
      >
        {quizzes.map((item) => (
          <ListLink
            key={item.id}
            href={`/quizzes/${item.slug}`}
            title={item.title}
            meta={item.duration ? `${item.duration} min` : undefined}
          />
        ))}
      </Section>

      <Section
        icon={MessagesSquare}
        title="Discussions"
        count={counts.discussions}
        empty="No discussions yet — ask the first question."
        action={
          <Link
            href={`/community/new?topic=subject-help&subject=${encodeURIComponent(id)}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Ask in this subject
          </Link>
        }
      >
        {discussions.map((item) => (
          <ListLink
            key={item.id}
            href={`/community/thread/${item.id}`}
            title={item.title}
            meta={`${item.replyCount || 0} replies`}
          />
        ))}
      </Section>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  count,
  empty,
  action,
  children,
}: {
  icon: typeof BookOpen;
  title: string;
  count: number;
  empty: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children)
    ? children.length > 0
    : Boolean(children);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-violet-600" />
          <h2 className="font-bold text-slate-900">{title}</h2>
          <span className="text-xs font-semibold text-slate-400 tabular-nums">
            {count}
          </span>
        </div>
        {action}
      </div>
      {hasItems ? (
        <ul className="bg-white border border-slate-100 rounded-2xl divide-y divide-slate-100">
          {children}
        </ul>
      ) : (
        <p className="text-sm text-slate-500 bg-slate-50 border border-dashed border-slate-200 rounded-2xl px-4 py-6">
          {empty}
        </p>
      )}
    </section>
  );
}

function ListLink({
  href,
  title,
  meta,
}: {
  href: string;
  title: string;
  meta?: string;
}) {
  return (
    <li>
      <Link
        href={href}
        className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50/80"
      >
        <span className="font-medium text-slate-900 text-sm line-clamp-1">
          {title}
        </span>
        {meta ? (
          <span className="text-xs text-slate-400 shrink-0">{meta}</span>
        ) : null}
      </Link>
    </li>
  );
}
