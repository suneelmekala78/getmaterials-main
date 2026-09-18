"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export default function SaveJobButton({
  slug,
  initialSaved = false,
  className,
}: {
  slug: string;
  initialSaved?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { status } = useSession();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, setPending] = useState(false);

  const toggle = async () => {
    if (status !== "authenticated") {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/careers/${slug}`)}`,
      );
      return;
    }
    if (pending) return;
    setPending(true);
    const next = !saved;
    setSaved(next);
    try {
      const res = await fetch(`/api/jobs/${encodeURIComponent(slug)}/save`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not update saved job");
      setSaved(Boolean(data.saved));
      toast.success(data.saved ? "Job saved" : "Removed from saved");
    } catch (err: any) {
      setSaved(!next);
      toast.error(err.message || "Failed to save job");
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={saved ? "Unsave job" : "Save job"}
      className={
        className ||
        `inline-flex items-center gap-2 px-5 py-2.5 border-2 font-semibold rounded-xl transition-colors text-sm disabled:opacity-50 ${
          saved
            ? "border-[var(--primary)] bg-violet-50 text-[var(--primary)]"
            : "border-slate-200 text-slate-700 hover:border-violet-300 hover:text-violet-600"
        }`
      }
    >
      {saved ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {saved ? "Saved" : "Save"}
    </button>
  );
}
