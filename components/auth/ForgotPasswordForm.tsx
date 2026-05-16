"use client";

import { useState } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center space-y-4">
        <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
          <span className="text-2xl">📧</span>
        </div>
        <p className="text-sm text-gray-600">
          If an account exists with <span className="font-semibold">{email}</span>,
          you&apos;ll receive a password reset link shortly.
        </p>
        <p className="text-xs text-gray-400">Check your spam folder if you don&apos;t see it.</p>
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
        <span className="text-sm font-medium">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--primary)] transition"
        />
      </label>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send reset link"}
      </button>
    </form>
  );
}
