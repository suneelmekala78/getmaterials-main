"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function JobApplyForm({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  const { data: session, status } = useSession();
  const [phone, setPhone] = useState("");
  const [coverNote, setCoverNote] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (status === "loading") {
    return <p className="text-sm text-gray-500">Checking login…</p>;
  }

  if (!session?.user) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Sign in to apply for <span className="font-semibold">{title}</span>.
        </p>
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(`/careers/${slug}`)}`}
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition"
        >
          Log in to apply
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3 text-sm text-emerald-800">
        Application submitted. We&apos;ll review it and get back to you.
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(slug)}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim() || undefined,
          coverNote: coverNote.trim() || undefined,
          resumeUrl: resumeUrl.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not submit application");
      setDone(true);
      toast.success("Application submitted");
    } catch (err: any) {
      toast.error(err.message || "Failed to apply");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-gray-500">
        Applying as{" "}
        <span className="font-medium text-slate-800">
          {session.user.name || session.user.email}
        </span>
      </p>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Phone (optional)
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)]"
          placeholder="10-digit mobile"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Cover note (optional)
        </label>
        <textarea
          rows={4}
          value={coverNote}
          onChange={(e) => setCoverNote(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)] resize-none"
          placeholder="Why are you a good fit?"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Resume URL (optional)
        </label>
        <input
          type="url"
          value={resumeUrl}
          onChange={(e) => setResumeUrl(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[var(--primary)]"
          placeholder="https://…"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50"
      >
        {submitting ? "Submitting…" : "Submit application"}
      </button>
    </form>
  );
}
