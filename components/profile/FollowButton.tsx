"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export function FollowButton({
  userId,
  initialFollowing,
  loggedIn,
  callbackUrl,
}: {
  userId: string;
  initialFollowing: boolean;
  loggedIn: boolean;
  callbackUrl: string;
}) {
  const router = useRouter();
  const [following, setFollowing] = useState(initialFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!loggedIn) {
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        following ? `/api/follows?userId=${encodeURIComponent(userId)}` : "/api/follows",
        {
          method: following ? "DELETE" : "POST",
          headers: following ? undefined : { "Content-Type": "application/json" },
          body: following ? undefined : JSON.stringify({ userId }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update follow");
      setFollowing(!following);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Could not update follow");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold shrink-0 disabled:opacity-60 ${
        following
          ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          : "bg-[var(--primary)] text-white hover:opacity-90"
      }`}
    >
      {busy ? "Please wait…" : following ? "Following" : "Follow"}
    </button>
  );
}
