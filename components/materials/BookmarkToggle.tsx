"use client";

import { useRouter } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useState } from "react";

export default function BookmarkToggle({
  materialId,
  initialBookmarked,
  loggedIn,
  label,
  className,
  callbackUrl = "/materials",
}: {
  materialId: string;
  initialBookmarked: boolean;
  loggedIn: boolean;
  label?: string;
  className?: string;
  callbackUrl?: string;
}) {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [pending, setPending] = useState(false);

  const toggle = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!loggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    if (pending) return;
    setPending(true);
    const next = !bookmarked;
    setBookmarked(next);
    try {
      await fetch("/api/bookmarks", {
        method: next ? "POST" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materialId }),
      });
    } catch {
      setBookmarked(!next);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
      className={
        className ||
        `p-1.5 rounded-lg transition-colors ${
          bookmarked ? "text-[var(--primary)] bg-violet-50" : "text-slate-400 hover:text-[var(--primary)] hover:bg-violet-50"
        }`
      }
    >
      {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {label ? <span>{bookmarked ? "Saved" : label}</span> : null}
    </button>
  );
}
