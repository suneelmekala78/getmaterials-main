"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, ChevronLeft, Lock, Play, Send } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Breadcrumb, DifficultyBadge, ListSkeleton } from "./practice-ui";

const Editor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
  loading: () => <div className="h-[460px] bg-slate-50 animate-pulse" />,
});

type Lang = "javascript" | "python" | "java" | "cpp";
const LANGS: { id: Lang; label: string; monaco: string }[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python", monaco: "python" },
  { id: "java", label: "Java", monaco: "java" },
  { id: "cpp", label: "C++", monaco: "cpp" },
];

type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: "easy" | "medium" | "hard";
  tags: string[];
  statement: string;
  constraints: string;
  examples: { input: string; output: string; explanation?: string }[];
  starterCode: Record<Lang, string>;
  acceptance: number;
  status: string;
  contestLocked: boolean;
  functionName: string;
  sampleTests: { input: unknown; expected: unknown }[];
};

type CaseResult = {
  index: number;
  hidden: boolean;
  passed: boolean;
  input?: unknown;
  expected?: unknown;
  actual?: unknown;
  error?: string;
};

type Report = {
  verdict: string;
  passed: number;
  total: number;
  runtimeMs: number;
  cases: CaseResult[];
};

type Post = {
  id: string;
  body: string;
  authorName: string;
  authorId: string;
  upvotes: number;
  voted: boolean;
  createdAt?: string;
  replies?: Post[];
};

type Submission = {
  id: string;
  language: Lang;
  verdict: string;
  passed: number;
  total: number;
  runtimeMs: number;
  createdAt: string;
  code: string;
};

const tabs = [
  { id: "result", label: "Result" },
  { id: "submissions", label: "Submissions" },
  { id: "discussion", label: "Discussion" },
  { id: "solution", label: "Solution" },
] as const;

function pretty(value: unknown) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export default function ProblemWorkspace({ slug }: { slug: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const contest = params.get("contest") || "";
  const { data: session, status: authStatus } = useSession();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const [problem, setProblem] = useState<Problem | null>(null);
  const [missing, setMissing] = useState(false);
  const [language, setLanguage] = useState<Lang>("javascript");
  const [drafts, setDrafts] = useState<Partial<Record<Lang, string>>>({});
  const [tab, setTab] = useState<(typeof tabs)[number]["id"]>("result");
  const [report, setReport] = useState<Report | null>(null);
  const [busy, setBusy] = useState<"run" | "submit" | null>(null);
  const [error, setError] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [discussionLocked, setDiscussionLocked] = useState(false);
  const [comment, setComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [solution, setSolution] = useState<{ unlocked?: boolean; reason?: string; explanation?: string; solutionCode?: Record<Lang, string> } | null>(null);
  const [copied, setCopied] = useState(false);
  const [posting, setPosting] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [votingId, setVotingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);

  useEffect(() => {
    setProblem(null);
    setMissing(false);
    setReport(null);
    setError("");
    fetch(`/api/practice/problems/${slug}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.problem) {
          setMissing(true);
          return;
        }
        setProblem(data.problem);
      })
      .catch(() => setMissing(true));
  }, [slug]);

  const code = drafts[language] ?? problem?.starterCode?.[language] ?? "";
  const monaco = LANGS.find((item) => item.id === language)?.monaco || "javascript";

  useEffect(() => {
    if (tab === "result") return;
    let cancelled = false;
    setPanelLoading(true);
    const finish = () => {
      if (!cancelled) setPanelLoading(false);
    };
    if (tab === "submissions") {
      fetch(`/api/practice/problems/${slug}/submissions`)
        .then((res) => (res.ok ? res.json() : { submissions: [] }))
        .then((data) => {
          if (!cancelled) setSubmissions(data.submissions || []);
        })
        .finally(finish);
    } else if (tab === "discussion") {
      fetch(`/api/practice/problems/${slug}/discussion`)
        .then((res) => res.json())
        .then((data) => {
          if (cancelled) return;
          setDiscussionLocked(Boolean(data.locked));
          setPosts(data.posts || []);
        })
        .finally(finish);
    } else if (tab === "solution") {
      fetch(`/api/practice/problems/${slug}/solution`)
        .then(async (res) => {
          const data = await res.json().catch(() => ({}));
          if (!cancelled) {
            setSolution(res.ok ? data : { unlocked: false, reason: data.error || "Sign in and solve this problem to view the official solution." });
          }
        })
        .finally(finish);
    }
    return () => {
      cancelled = true;
    };
  }, [tab, slug]);

  const signIn = () => {
    const back = `/practice/${slug}${contest ? `?contest=${contest}` : ""}`;
    router.push(`/login?callbackUrl=${encodeURIComponent(back)}`);
  };

  const execute = async (mode: "run" | "submit") => {
    if (!session) {
      signIn();
      return;
    }
    setBusy(mode);
    setError("");
    setTab("result");
    try {
      const res = await fetch(`/api/practice/problems/${slug}/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, contestSlug: contest || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 401) {
        signIn();
        return;
      }
      if (!res.ok) {
        setError(data.error || "Could not run your code");
        setReport(null);
        return;
      }
      setReport(data);
      if (mode === "submit") {
        setProblem((prev) => (prev ? { ...prev, status: data.verdict === "Accepted" ? "solved" : "attempted" } : prev));
        if (data.verdict === "Accepted") setSolution(null);
      }
    } catch {
      setError("Could not reach the code runner. Start Piston and try again.");
    } finally {
      setBusy(null);
    }
  };

  const sendComment = async () => {
    if (!session) {
      signIn();
      return;
    }
    const text = comment.trim();
    if (!text) {
      setCommentError("Write a comment before posting.");
      return;
    }
    if (text.length > 2000) {
      setCommentError("Comments are limited to 2000 characters.");
      return;
    }
    setPosting(true);
    setCommentError("");
    try {
      const res = await fetch(`/api/practice/problems/${slug}/discussion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text, parentId: replyTo || undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setCommentError(data.error || "Could not post");
        return;
      }
      setComment("");
      setReplyTo(null);
      setPosts(data.posts || []);
    } finally {
      setPosting(false);
    }
  };

  const vote = async (id: string) => {
    if (!session) {
      signIn();
      return;
    }
    if (votingId) return;
    setVotingId(id);
    try {
      const res = await fetch(`/api/practice/discussions/${id}/upvote`, { method: "POST" });
      if (res.ok) {
        const data = await fetch(`/api/practice/problems/${slug}/discussion`).then((next) => next.json());
        setDiscussionLocked(Boolean(data.locked));
        setPosts(data.posts || []);
      }
    } finally {
      setVotingId(null);
    }
  };

  const removePost = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/practice/discussions/${pendingDelete}`, { method: "DELETE" });
      if (res.ok) {
        const data = await fetch(`/api/practice/problems/${slug}/discussion`).then((next) => next.json());
        setPosts(data.posts || []);
      }
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const copySolution = async () => {
    const text = solution?.solutionCode?.[language] || "";
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (missing) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h1 className="text-2xl font-extrabold text-slate-900">Problem not found</h1>
        <p className="text-slate-500 mt-2">It may have been unpublished.</p>
        <Link href="/practice" className="inline-flex mt-6 font-bold text-[var(--primary)]">Back to practice</Link>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="h-4 w-40 bg-slate-200 rounded animate-pulse" />
        <div className="h-10 w-72 bg-slate-200 rounded animate-pulse" />
        <div className="grid lg:grid-cols-2 gap-4">
          <div className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          <div className="h-80 bg-white border border-slate-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  const accepted = report?.verdict === "Accepted";

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: contest ? `/practice/contests/${contest}` : "/practice", label: contest ? "Contest" : "Practice" },
          { label: problem.title },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <Link href={contest ? `/practice/contests/${contest}` : "/practice"} className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[var(--primary)] mb-2">
            <ChevronLeft className="w-4 h-4" />
            {contest ? "Back to contest" : "All problems"}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{problem.title}</h1>
            <DifficultyBadge difficulty={problem.difficulty} />
            {problem.status === "solved" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold">
                <Check className="w-3 h-3" /> Solved
              </span>
            ) : problem.status === "attempted" ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold">Attempted</span>
            ) : null}
          </div>
          <p className="text-sm text-slate-500 mt-1">{problem.acceptance}% accepted · {problem.tags.join(" · ") || "General"}</p>
        </div>
      </div>

      {problem.contestLocked ? (
        <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <Lock className="w-4 h-4 mt-0.5 shrink-0" />
          <p>This problem is in a live contest. Solutions and discussions stay hidden until the contest ends.</p>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-4 items-start">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-5">
          <div className="text-[15px] leading-relaxed text-slate-700 [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1" dangerouslySetInnerHTML={{ __html: problem.statement }} />
          {problem.examples.length ? (
            <div className="space-y-3">
              <h2 className="text-sm font-extrabold text-slate-900">Examples</h2>
              {problem.examples.map((example, index) => (
                <div key={index} className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-sm space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Example {index + 1}</p>
                  <p><span className="font-bold text-slate-700">Input</span><span className="block font-mono text-[13px] mt-0.5">{example.input}</span></p>
                  <p><span className="font-bold text-slate-700">Output</span><span className="block font-mono text-[13px] mt-0.5">{example.output}</span></p>
                  {example.explanation ? <p className="text-slate-500">{example.explanation}</p> : null}
                </div>
              ))}
            </div>
          ) : null}
          {problem.constraints ? (
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 mb-2">Constraints</h2>
              <div className="text-sm text-slate-600 [&_p]:mb-1" dangerouslySetInnerHTML={{ __html: problem.constraints }} />
            </div>
          ) : null}
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden lg:sticky lg:top-4">
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50/80">
            <div className="flex flex-wrap gap-1">
              {LANGS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLanguage(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    language === item.id ? "bg-white text-[var(--primary)] shadow-sm" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={Boolean(busy)} onClick={() => execute("run")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm font-bold disabled:opacity-60">
                <Play className="w-3.5 h-3.5" />
                {busy === "run" ? "Running…" : "Run"}
              </button>
              <button type="button" disabled={Boolean(busy)} onClick={() => execute("submit")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-sm font-bold disabled:opacity-60">
                <Send className="w-3.5 h-3.5" />
                {busy === "submit" ? "Submitting…" : "Submit"}
              </button>
            </div>
          </div>
          <p className="px-3 py-2 text-xs text-slate-500 border-b border-slate-100">
            Tests call <span className="font-mono font-bold text-slate-700">{problem.functionName || "solve"}</span>. Keep that name, or the run cannot find your function.
          </p>
          <Editor
            height="460px"
            language={monaco}
            theme="vs-light"
            value={code}
            onChange={(value) => setDrafts((prev) => ({ ...prev, [language]: value || "" }))}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              scrollBeyondLastLine: false,
              padding: { top: 12 },
              wordWrap: "on",
              automaticLayout: true,
            }}
          />
        </div>
      </div>

      <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="flex gap-1 px-2 pt-2 border-b border-slate-100 overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`px-3 py-2 text-sm font-bold border-b-2 -mb-px ${
                tab === item.id ? "border-[var(--primary)] text-[var(--primary)]" : "border-transparent text-slate-500"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="p-4 space-y-3 text-sm">
          {error ? <p className="rounded-xl bg-rose-50 text-rose-700 px-3 py-2">{error}</p> : null}

          {tab === "result" && report ? (
            <div className="space-y-3">
              <div className={`rounded-2xl px-4 py-3 ${accepted ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"}`}>
                <p className="text-lg font-extrabold">{report.verdict}</p>
                <p className="text-sm opacity-80">{report.passed} of {report.total} tests passed · {report.runtimeMs} ms</p>
              </div>
              {report.cases.map((item) => (
                <div key={item.index} className={`rounded-xl border p-3 ${item.passed ? "border-emerald-100" : "border-rose-100"}`}>
                  <p className="font-bold text-slate-800">
                    {item.passed ? "Passed" : "Failed"} · Test {item.index}
                    {item.hidden ? " · Hidden" : ""}
                  </p>
                  {item.error ? <pre className="mt-2 text-xs text-rose-700 whitespace-pre-wrap">{item.error}</pre> : null}
                  {!item.hidden && !item.passed ? (
                    <div className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
                      <CaseBlock label="Input" value={pretty(item.input)} />
                      <CaseBlock label="Expected" value={pretty(item.expected)} />
                      <CaseBlock label="Yours" value={pretty(item.actual)} />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {tab === "result" && !report && !error ? (
            <div className="space-y-2">
              <p className="text-slate-500">Run checks the sample tests. Submit also runs the hidden tests and saves the attempt.</p>
              {(problem.sampleTests || []).map((sample, index) => (
                <div key={index} className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-mono text-slate-600">
                  Sample {index + 1}: {pretty(sample.input)} → {pretty(sample.expected)}
                </div>
              ))}
            </div>
          ) : null}

          {tab === "submissions" && panelLoading ? <ListSkeleton rows={3} bare /> : null}
          {tab === "submissions" && !panelLoading && submissions.length === 0 ? (
            <p className="text-slate-500">{authStatus === "authenticated" ? "No submissions yet. Submit a solution to keep a history." : "Sign in to see your submissions."}</p>
          ) : null}
          {tab === "submissions" && !panelLoading
            ? submissions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="w-full text-left rounded-xl border border-slate-200 px-3 py-2.5 hover:border-violet-200"
                  onClick={() => {
                    setLanguage(item.language);
                    setDrafts((prev) => ({ ...prev, [item.language]: item.code }));
                  }}
                >
                  <span className={`font-bold ${item.verdict === "Accepted" ? "text-emerald-700" : "text-slate-800"}`}>{item.verdict}</span>
                  <span className="text-slate-500"> · {LANGS.find((lang) => lang.id === item.language)?.label || item.language} · {item.passed}/{item.total} · {new Date(item.createdAt).toLocaleString()}</span>
                  <span className="block text-xs text-slate-400 mt-0.5">Click to restore this code</span>
                </button>
              ))
            : null}

          {tab === "discussion" && discussionLocked ? (
            <p className="text-slate-500">Discussions open when the contest ends.</p>
          ) : null}
          {tab === "discussion" && !discussionLocked && panelLoading ? <ListSkeleton rows={3} bare /> : null}
          {tab === "discussion" && !discussionLocked && !panelLoading ? (
            <div className="space-y-3">
              {posts.length === 0 ? <p className="text-slate-500">No comments yet. Share an approach, not the full answer.</p> : null}
              {posts.map((post) => (
                <article key={post.id} className="rounded-xl border border-slate-200 p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-violet-100 text-[var(--primary)] text-xs font-extrabold inline-flex items-center justify-center">
                      {(post.authorName || "S").slice(0, 1).toUpperCase()}
                    </span>
                    <p className="font-bold text-slate-900">{post.authorName}</p>
                  </div>
                  <p className="whitespace-pre-wrap text-slate-700">{post.body}</p>
                  <div className="flex gap-3 text-xs font-bold text-slate-500">
                    <button type="button" disabled={votingId === post.id} onClick={() => vote(post.id)} className={`disabled:opacity-60 ${post.voted ? "text-[var(--primary)]" : ""}`}>
                      {votingId === post.id ? "Upvoting…" : post.voted ? "Upvoted" : "Upvote"} · {post.upvotes}
                    </button>
                    <button type="button" onClick={() => setReplyTo(post.id)}>Reply</button>
                    {userId && userId === post.authorId ? (
                      <button type="button" onClick={() => setPendingDelete(post.id)} className="text-rose-600">Delete</button>
                    ) : null}
                  </div>
                  {(post.replies || []).map((reply) => (
                    <div key={reply.id} className="ml-4 border-l-2 border-violet-100 pl-3 space-y-1">
                      <p className="font-bold">{reply.authorName}</p>
                      <p className="whitespace-pre-wrap text-slate-700">{reply.body}</p>
                      <div className="flex gap-3 text-xs font-bold text-slate-500">
                        <button type="button" disabled={votingId === reply.id} onClick={() => vote(reply.id)} className={`disabled:opacity-60 ${reply.voted ? "text-[var(--primary)]" : ""}`}>
                          {votingId === reply.id ? "Upvoting…" : reply.voted ? "Upvoted" : "Upvote"} · {reply.upvotes}
                        </button>
                        {userId && userId === reply.authorId ? (
                          <button type="button" onClick={() => setPendingDelete(reply.id)} className="text-rose-600">Delete</button>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </article>
              ))}
              {replyTo ? (
                <p className="text-xs text-slate-500">
                  Replying to a thread. <button type="button" className="font-bold text-[var(--primary)]" onClick={() => setReplyTo(null)}>Cancel</button>
                </p>
              ) : null}
              <textarea
                value={comment}
                onChange={(e) => {
                  setComment(e.target.value);
                  if (commentError) setCommentError("");
                }}
                maxLength={2000}
                placeholder={session ? (replyTo ? "Write a reply" : "Share a hint or a question") : "Sign in to join the discussion"}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 min-h-24 outline-none focus:border-violet-300"
              />
              <div className="flex items-center justify-between gap-3">
                <p className={`text-xs ${commentError ? "text-rose-600" : "text-slate-400"}`}>
                  {commentError || `${comment.trim().length}/2000`}
                </p>
                <button
                  type="button"
                  onClick={sendComment}
                  disabled={Boolean(session) && (posting || comment.trim().length === 0)}
                  className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white font-bold disabled:opacity-50"
                >
                  {!session ? "Sign in to post" : posting ? "Posting…" : "Post"}
                </button>
              </div>
            </div>
          ) : null}

          {tab === "solution" && panelLoading ? <ListSkeleton rows={2} bare /> : null}
          {tab === "solution" && !panelLoading && solution ? (
            solution.unlocked ? (
              <div className="space-y-3">
                {solution.explanation ? (
                  <div className="text-slate-700 leading-relaxed [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: solution.explanation }} />
                ) : null}
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{LANGS.find((item) => item.id === language)?.label}</p>
                  <button type="button" onClick={copySolution} className="text-xs font-bold text-[var(--primary)]">
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <pre className="text-xs bg-slate-950 text-slate-100 rounded-xl p-4 overflow-auto">{solution.solutionCode?.[language] || "No official solution for this language yet."}</pre>
              </div>
            ) : (
              <div className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-6 text-center">
                <Lock className="w-5 h-5 mx-auto text-slate-400" />
                <p className="mt-2 font-bold text-slate-800">{solution.reason || "Solve this problem to view the official solution."}</p>
              </div>
            )
          ) : null}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete this comment?"
        message="This removes the comment from the discussion."
        confirmLabel={deleting ? "Deleting…" : "Delete"}
        onConfirm={() => {
          if (!deleting) void removePost();
        }}
        onCancel={() => {
          if (!deleting) setPendingDelete(null);
        }}
      />
    </div>
  );
}

function CaseBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="font-bold text-slate-500 mb-1">{label}</p>
      <pre className="whitespace-pre-wrap break-all text-slate-800">{value}</pre>
    </div>
  );
}
