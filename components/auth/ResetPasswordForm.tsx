"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-red-600">Invalid reset link. Please request a new one.</p>
        <Link href="/forgot-password" className="text-sm text-[var(--primary)] font-semibold hover:underline">
          Request new link
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
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
          className="inline-block px-6 py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg text-sm hover:-translate-y-0.5 transition-all"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-medium">New Password</span>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            required
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--primary)] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        <p className="mt-1 text-xs text-gray-400">Min 8 chars, 1 uppercase, 1 number</p>
      </label>

      <label className="block">
        <span className="text-sm font-medium">Confirm Password</span>
        <div className="relative">
          <input
            type={showConfirm ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
            className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--primary)] transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
          >
            {showConfirm ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}
