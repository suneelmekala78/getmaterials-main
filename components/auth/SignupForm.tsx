"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { getReferralData, clearReferralData } from "@/components/providers/ReferralTracker";
import { trackSignUp } from "@/lib/analytics";
import { VerifiableField } from "./VerifiableField";
import { SocialAuthButtons } from "./SocialAuthButtons";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  /** Ensures one GA4 sign_up per successful account creation (no re-render/retry dupes). */
  const signUpTrackedRef = useRef(false);

  const emailVerified = Boolean(emailToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (loading) return;

    if (!emailToken) {
      setError("Please verify your email address first");
      return;
    }
    if (!acceptedTerms) {
      setError("Please agree to the Terms & Conditions and Privacy Policy");
      return;
    }

    setLoading(true);
    try {
      const referralData = getReferralData();
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "student",
          emailToken,
          referral: referralData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }

      // Account was created — fire GA4 sign_up once, then redirect.
      // Await GA event_callback/timeout so hard navigation cannot drop the hit.
      if (!signUpTrackedRef.current) {
        signUpTrackedRef.current = true;
        await trackSignUp("email");
      }

      clearReferralData();
      setSuccess("Account created! Redirecting to login...");
      window.location.href = "/login?registered=true";
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
    <SocialAuthButtons mode="signup" />
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl">
          {success}
        </div>
      )}

      <label className="block">
        <span className="auth-label">Full name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          className="auth-input"
        />
      </label>

      <VerifiableField
        channel="email"
        label="Email"
        value={email}
        onChange={setEmail}
        token={emailToken}
        onTokenChange={setEmailToken}
        disabled={loading}
      />

      <label className="block">
        <span className="auth-label">Password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
            className="auth-input pr-16"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="auth-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-slate-400">Min 8 characters, 1 uppercase, 1 number</p>
      </label>

      <label className="flex items-start gap-2.5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]"
        />
        <span className="text-sm text-slate-600 leading-snug">
          I agree to the{" "}
          <Link href="/terms" target="_blank" className="font-semibold text-[var(--primary)] hover:underline">
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link href="/privacy" target="_blank" className="font-semibold text-[var(--primary)] hover:underline">
            Privacy Policy
          </Link>
          .
        </span>
      </label>

      <button
        type="submit"
        disabled={
          loading ||
          !emailVerified ||
          !acceptedTerms ||
          password.length < 8 ||
          name.trim().length < 2
        }
        className="auth-btn mt-1"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>

      {!emailVerified && (
        <p className="text-center text-xs text-slate-400">
          Verify your email address to continue
        </p>
      )}
    </form>
    </div>
  );
}
