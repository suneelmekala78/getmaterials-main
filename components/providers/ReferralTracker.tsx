"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

/**
 * Captures UTM parameters and referral codes from the URL and stores them
 * in localStorage so they persist through the signup flow.
 * 
 * Expected URL params:
 * - utm_source: where the traffic is from (instagram, youtube, twitter, etc.)
 * - utm_medium: type of traffic (social, paid, referral, etc.)
 * - utm_campaign: campaign name
 * - ref: referrer identifier (friend_a, influencer_xyz, etc.)
 * 
 * Example: https://app.getmaterials.in/?utm_source=instagram&utm_medium=social&utm_campaign=launch&ref=suneel25
 */
export function ReferralTracker() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  // Capture UTM params on page load
  useEffect(() => {
    const source = searchParams.get("utm_source");
    const medium = searchParams.get("utm_medium");
    const campaign = searchParams.get("utm_campaign");
    const referrer = searchParams.get("ref") || searchParams.get("referrer");

    // Only store if at least one param is present
    if (source || medium || campaign || referrer) {
      const referralData = {
        source: source || "",
        medium: medium || "",
        campaign: campaign || "",
        referrer: referrer || "",
        referralCode: referrer || "",
        landingPage: window.location.pathname,
        timestamp: Date.now(),
      };
      localStorage.setItem("referral_data", JSON.stringify(referralData));
    } else if (!localStorage.getItem("referral_data")) {
      // Store direct visit info if nothing is stored yet
      const referralData = {
        source: "direct",
        medium: "",
        campaign: "",
        referrer: "",
        referralCode: "",
        landingPage: window.location.pathname,
        timestamp: Date.now(),
      };
      localStorage.setItem("referral_data", JSON.stringify(referralData));
    }
  }, [searchParams]);

  // Sync referral data after login (for Google OAuth signups)
  useEffect(() => {
    if (status !== "authenticated" || !session?.user) return;

    const referralData = localStorage.getItem("referral_data");
    const alreadySynced = localStorage.getItem("referral_synced");
    if (!referralData || alreadySynced) return;

    const data = JSON.parse(referralData);
    // Only sync if there's meaningful referral data (not just "direct" with no referrer)
    if (!data.source || (data.source === "direct" && !data.referrer && !data.campaign)) {
      return;
    }

    // Send to server
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

/**
 * Get stored referral data from localStorage
 */
export function getReferralData(): {
  source: string;
  medium: string;
  campaign: string;
  referrer: string;
  referralCode: string;
  landingPage: string;
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

/**
 * Clear referral data after successful signup
 */
export function clearReferralData() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("referral_data");
  localStorage.setItem("referral_synced", "true");
}
