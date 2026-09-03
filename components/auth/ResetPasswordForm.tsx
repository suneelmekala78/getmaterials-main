"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Could not resend the code");
        return;
      }
      setInfo("A new code has been sent to your email.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">✅</span>
        </div>
        <p className="text-sm text-gray-600">
          Your password has been reset successfully!
        </p>
        <Link
          href="/login"
          className="auth-btn"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
          {error}
        </div>
      )}
      {info && (
        <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl">
          {info}
        </div>
      )}

      <label className="block">
        <span className="auth-label">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="auth-input"
        />
      </label>

      <label className="block">
        <span className="auth-label">Reset code</span>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          required
          maxLength={6}
          autoComplete="one-time-code"
          className="auth-input text-center tracking-[0.4em] font-mono font-semibold"
        />
        <button
          type="button"
          onClick={handleResend}
          disabled={resending || !email.trim()}
          className="mt-1.5 text-sm font-medium text-[var(--primary)] hover:underline disabled:opacity-50"
        >
          {resending ? "Sending..." : "Resend code"}
        </button>
      </label>

      <label className="block">
        <span className="auth-label">New password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
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

      <label className="block">
        <span className="auth-label">Confirm password</span>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="auth-input pr-16"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="auth-toggle absolute right-3.5 top-1/2 -translate-y-1/2"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={loading || code.length !== 6}
        className="auth-btn"
      >
        {loading ? "Resetting..." : "Reset password"}
      </button>

      <p className="text-center text-sm text-slate-400">
        Didn&apos;t request this?{" "}
        <Link href="/login" className="text-[var(--primary)] font-semibold hover:underline">
          Back to login
        </Link>
      </p>
    </form>
  );
}
