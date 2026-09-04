"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import toast from "react-hot-toast";
import { resolveAvatarSrc } from "@/components/profile/FittedPhoto";

type FollowUser = {
  id: string;
  slug?: string;
  name: string;
  avatar?: string;
  role?: string;
};

export function FollowStatButton({
  userId,
  kind,
  count,
  label,
  isOwner = false,
}: {
  userId: string;
  kind: "followers" | "following";
  count: number;
  label: string;
  isOwner?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(count);

  useEffect(() => {
    setVisibleCount(count);
  }, [count]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left hover:border-violet-200"
      >
        <p className="text-lg font-extrabold text-slate-900">{visibleCount}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </button>
      {open ? (
        <FollowListModal
          userId={userId}
          kind={kind}
          title={label}
          isOwner={isOwner}
          onClose={() => setOpen(false)}
          onCountChange={(delta) => setVisibleCount((current) => Math.max(0, current + delta))}
        />
      ) : null}
    </>
  );
}

function FollowListModal({
  userId,
  kind,
  title,
  isOwner,
  onClose,
  onCountChange,
}: {
  userId: string;
  kind: "followers" | "following";
  title: string;
  isOwner: boolean;
  onClose: () => void;
  onCountChange: (delta: number) => void;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    fetch(`/api/follows?userId=${encodeURIComponent(userId)}&kind=${kind}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, [kind, userId]);

  const handleAction = async (user: FollowUser) => {
    const removing = kind === "followers";
    const confirmed = window.confirm(
      removing
        ? `Remove ${user.name} from your followers?`
        : `Unfollow ${user.name}?`
    );
    if (!confirmed) return;

    setBusyId(user.id);
    try {
      const endpoint = removing
        ? `/api/follows/follower?userId=${encodeURIComponent(user.id)}`
        : `/api/follows?userId=${encodeURIComponent(user.id)}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not update follow");
      setUsers((current) => current.filter((item) => item.id !== user.id));
      onCountChange(-1);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Could not update follow");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[60vh] divide-y divide-slate-50">
          {loading ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">Loading…</p>
          ) : users.length === 0 ? (
            <p className="px-5 py-8 text-sm text-slate-500 text-center">No one here yet.</p>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center gap-3 px-5 py-3">
                <Link
                  href={`/users/${user.slug || user.id}`}
                  onClick={onClose}
                  className="flex min-w-0 flex-1 items-center gap-3 hover:opacity-80"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveAvatarSrc(user.avatar, user.role)}
                    alt=""
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.role || "student"}</p>
                  </div>
                </Link>
                {isOwner ? (
                  <button
                    type="button"
                    disabled={busyId === user.id}
                    onClick={() => handleAction(user)}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold disabled:opacity-60 ${
                      kind === "followers"
                        ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                  >
                    {busyId === user.id
                      ? "Please wait…"
                      : kind === "followers"
                        ? "Remove"
                        : "Unfollow"}
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
