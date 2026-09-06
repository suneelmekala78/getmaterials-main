"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { useSession } from "next-auth/react";
import { withReferredBy } from "@/components/providers/ReferralTracker";

interface ShareButtonProps {
  title: string;
  description: string;
  url: string;
  className?: string;
}

function visitorKey() {
  try {
    let key = localStorage.getItem("gm_visitor_key");
    if (!key) {
      key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}`;
      localStorage.setItem("gm_visitor_key", key);
    }
    return key;
  } catch {
    return `v-${Date.now()}`;
  }
}

export function ShareButton({ title, description, url, className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { data: session } = useSession();
  const slug = (session?.user as { slug?: string } | undefined)?.slug;

  const shareUrl = withReferredBy(url, slug);

  const trackShare = () => {
    if (!slug) return;
    try {
      const path = new URL(shareUrl).pathname;
      fetch("/api/referral-tracking/track-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referredBy: slug,
          path,
          visitorKey: visitorKey(),
        }),
      }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const handleShare = async () => {
    trackShare();
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url: shareUrl });
      } catch (err: any) {
        if (err.name !== "AbortError") {
          await copyToClipboard();
        }
      }
    } else {
      await copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={
        className ||
        "inline-flex items-center gap-2 px-5 py-2.5 border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-violet-300 hover:text-violet-600 transition-colors text-sm"
      }
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-green-600" /> Link Copied!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" /> Share
        </>
      )}
    </button>
  );
}
