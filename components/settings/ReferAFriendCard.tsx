"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Copy, Check, Gift } from "lucide-react";
import toast from "react-hot-toast";
import { SITE_URL } from "@/lib/seo";

export function ReferAFriendCard() {
  const { data: session } = useSession();
  const slug = (session?.user as { slug?: string } | undefined)?.slug || "";
  const [copied, setCopied] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");

  useEffect(() => {
    if (slug) {
      setInviteUrl(
        `${SITE_URL.replace(/\/$/, "")}/?utm_source=referral&utm_medium=social&ref=${encodeURIComponent(slug)}`,
      );
      return;
    }
    fetch("/api/referral-tracking/my-code")
      .then((r) => r.json())
      .then((d) => {
        const code = d.code || "";
        if (d.inviteUrl) setInviteUrl(d.inviteUrl);
        else if (code) {
          setInviteUrl(
            `${SITE_URL.replace(/\/$/, "")}/?utm_source=referral&utm_medium=social&ref=${encodeURIComponent(code)}`,
          );
        }
      })
      .catch(() => {});
  }, [slug]);

  const copy = async () => {
    if (!inviteUrl) {
      toast.error("Your referral link is not ready yet");
      return;
    }
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success("Referral link copied");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy");
    }
  };

  if (!inviteUrl && !slug) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-violet-600" />
        <h2 className="text-base font-semibold text-slate-900">Refer a friend</h2>
      </div>
      <p className="text-sm text-slate-500">
        Share this link. When someone opens it, we count the visit — and if they sign up,
        you are credited as their referrer.
      </p>
      <div className="flex gap-2">
        <input
          readOnly
          value={inviteUrl}
          className="flex-1 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700"
        />
        <button
          type="button"
          onClick={copy}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      {slug ? (
        <p className="text-xs text-slate-400">
          Your referral code: <span className="font-mono text-slate-600">{slug}</span>
        </p>
      ) : null}
    </div>
  );
}
