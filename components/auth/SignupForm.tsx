"use client";

import { useState } from "react";
import { getReferralData, clearReferralData } from "@/components/providers/ReferralTracker";
import { VerifiableField } from "./VerifiableField";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const emailVerified = Boolean(emailToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailToken) {
      setError("Please verify your email address first");
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

      clearReferralData();
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => {
        window.location.href = "/login?registered=true";
      }, 1200);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      <button
        type="submit"
        disabled={loading || !emailVerified || password.length < 8 || name.trim().length < 2}
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
  );
}
