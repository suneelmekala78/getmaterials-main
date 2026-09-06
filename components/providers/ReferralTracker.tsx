"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const VISITOR_KEY = "gm_visitor_key";
const OPEN_PREFIX = "gm_ref_open:";

function getVisitorKey() {
  try {
    let key = localStorage.getItem(VISITOR_KEY);
    if (!key) {
      key =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `v-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, key);
    }
    return key;
  } catch {
    return `v-${Date.now()}`;
  }
}

/**
 * Captures UTM / ref params, records link opens, and attributes signups.
 *
 * Example: /?utm_source=instagram&utm_medium=social&utm_campaign=launch&ref=suneel25
 * Share opens also use: /materials/foo?ref=suneel
 */
export function ReferralTracker() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  useEffect(() => {
    const source = searchParams.get("utm_source");
    const medium = searchParams.get("utm_medium");
    const campaign = searchParams.get("utm_campaign");
    const referrer =
      searchParams.get("ref") ||
      searchParams.get("referrer") ||
      searchParams.get("referredby") ||
      searchParams.get("referredBy");

    if (source || medium || campaign || referrer) {
      const referralData = {
        source: source || (referrer ? "referral" : "direct"),
        medium: medium || (referrer ? "share" : ""),
        campaign: campaign || "",
        referrer: referrer || "",
        referralCode: referrer || "",
        landingPage: window.location.pathname,
        timestamp: Date.now(),
      };
      localStorage.setItem("referral_data", JSON.stringify(referralData));
      localStorage.removeItem("referral_synced");
    } else if (!localStorage.getItem("referral_data")) {
      localStorage.setItem(
        "referral_data",
        JSON.stringify({
          source: "direct",
          medium: "",
          campaign: "",
          referrer: "",
          referralCode: "",
          landingPage: window.location.pathname,
          timestamp: Date.now(),
        }),
      );
    }

    // Count a real open of a shared link (once per visitor + path + referrer).
    if (referrer) {
      const path = window.location.pathname || "/";
      const openKey = `${OPEN_PREFIX}${referrer}:${path}`;
      let shouldTrack = true;
      try {
        if (sessionStorage.getItem(openKey)) shouldTrack = false;
        else sessionStorage.setItem(openKey, "1");
      } catch {
        // continue
      }
      if (shouldTrack) {
        fetch("/api/referral-tracking/track-open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referredBy: referrer,
            path,
            visitorKey: getVisitorKey(),
          }),
        }).catch(() => {});
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const referralData = localStorage.getItem("referral_data");
    const alreadySynced = localStorage.getItem("referral_synced");
    if (!referralData || alreadySynced) return;

    let data: Record<string, string>;
    try {
      data = JSON.parse(referralData);
    } catch {
      return;
    }

    fetch("/api/auth/track-referral", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (res.ok) {
          localStorage.setItem("referral_synced", "true");
          localStorage.removeItem("referral_data");
        }
      })
      .catch(() => {});
  }, [status, session]);

  return null;
}

export function getReferralData(): {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
  referralCode: string;
  landingPage: string;
  referredBy?: string;
} | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("referral_data");
    if (!data) return null;
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearReferralData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("referral_data");
  localStorage.setItem("referral_synced", "true");
}

/** Build a share URL tagged with the current user's slug via `ref=`. */
export function withReferredBy(url: string, slug?: string | null) {
  if (!slug) return url;
  try {
    const u = new URL(url, typeof window !== "undefined" ? window.location.origin : "https://getmaterials.in");
    u.searchParams.set("ref", slug);
    return u.toString();
  } catch {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}ref=${encodeURIComponent(slug)}`;
  }
}
