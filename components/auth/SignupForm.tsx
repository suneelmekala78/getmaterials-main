"use client";

import { useState } from "react";
import { getReferralData, clearReferralData } from "@/components/providers/ReferralTracker";
import { VerifiableField } from "./VerifiableField";

export function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [emailToken, setEmailToken] = useState<string | null>(null);
  const [phoneToken, setPhoneToken] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const bothVerified = Boolean(emailToken && phoneToken);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!emailToken) {
      setError("Please verify your email address first");
      return;
    }
    if (!phoneToken) {
      setError("Please verify your mobile number first");
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
          phone,
          password,
          role,
          emailToken,
          phoneToken,
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg">
          {success}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">Full name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition"
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

      <VerifiableField
        channel="phone"
        label="Mobile number"
        value={phone}
        onChange={setPhone}
        token={phoneToken}
        onTokenChange={setPhoneToken}
        disabled={loading}
      />

      <label className="block">
        <span className="text-sm font-medium">Password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-14 text-sm focus:outline-none focus:border-[var(--primary)] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">
          Min 8 chars, 1 uppercase, 1 number
        </p>
      </label>

      <label className="block">
        <span className="text-sm font-medium">I am a</span>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition"
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={loading || !bothVerified || password.length < 8 || name.trim().length < 2}
        className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? "Creating account..." : "Sign up"}
      </button>

      {!bothVerified && (
        <p className="text-center text-xs text-gray-400">
          Verify both your email and mobile number to continue
        </p>
      )}
    </form>
  );
}
