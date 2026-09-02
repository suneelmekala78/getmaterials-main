"use client";

import { useEffect, useState } from "react";

export type VerifyChannel = "email" | "phone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIAN_MOBILE_RE = /^[6-9]\d{9}$/;

interface VerifiableFieldProps {
  channel: VerifyChannel;
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Verification proof returned by the API, or null when unverified. */
  token: string | null;
  onTokenChange: (token: string | null) => void;
  disabled?: boolean;
}

/**
 * Input with a Verify button docked on the right. Sending an OTP reveals an
 * inline code box; a confirmed code yields a token the signup call must send.
 */
export function VerifiableField({
  channel,
  label,
  value,
  onChange,
  token,
  onTokenChange,
  disabled,
}: VerifiableFieldProps) {
  const [codeSent, setCodeSent] = useState(false);
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const verified = Boolean(token);
  const isValid =
    channel === "phone"
      ? INDIAN_MOBILE_RE.test(value)
      : EMAIL_RE.test(value.trim());

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleValueChange = (next: string) => {
    onChange(next);
    if (verified) onTokenChange(null);
    setCodeSent(false);
    setCode("");
    setError("");
    setInfo("");
  };

  const sendCode = async () => {
    setError("");
    setInfo("");
    setSending(true);
    try {
      const res = await fetch("/api/auth/verify/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, value: value.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Could not send the code");
        return;
      }
      setCodeSent(true);
      setCooldown(30);
      setInfo(
        data.message ||
          (channel === "phone"
            ? "OTP sent to your mobile number"
            : "Code sent to your inbox. Check spam too.")
      );
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const confirmCode = async () => {
    setError("");
    setInfo("");
    setConfirming(true);
    try {
      const res = await fetch("/api/auth/verify/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, value: value.trim(), code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Invalid code");
        return;
      }
      onTokenChange(data.token);
      setCodeSent(false);
      setCode("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setConfirming(false);
    }
  };

  const verifyButton = (
    <button
      type="button"
      onClick={sendCode}
      disabled={disabled || sending || !isValid || cooldown > 0}
      className="shrink-0 px-3 text-xs font-semibold text-[var(--primary)] hover:bg-[var(--primary)]/5 disabled:text-gray-300 disabled:hover:bg-transparent disabled:cursor-not-allowed transition"
    >
      {sending
        ? "Sending..."
        : cooldown > 0
          ? `Resend ${cooldown}s`
          : codeSent
            ? "Resend"
            : "Verify"}
    </button>
  );

  const verifiedBadge = (
    <span className="shrink-0 inline-flex items-center gap-1 px-3 text-xs font-semibold text-green-600">
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="w-4 h-4"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 0 1 1.4-1.4l3.3 3.3 6.8-6.8a1 1 0 0 1 1.4 0Z"
          clipRule="evenodd"
        />
      </svg>
      Verified
    </span>
  );

  return (
    <div className="block">
      <span className="text-sm font-medium">{label}</span>

      <div
        className={`mt-1 flex items-stretch rounded-lg border overflow-hidden transition ${
          verified
            ? "border-green-300 bg-green-50/40"
            : "border-gray-200 focus-within:border-[var(--primary)]"
        }`}
      >
        {channel === "phone" && (
          <span className="inline-flex items-center px-3 bg-gray-50 text-sm font-medium text-gray-600 border-r border-gray-200">
            +91
          </span>
        )}
        <input
          type={channel === "phone" ? "tel" : "email"}
          inputMode={channel === "phone" ? "numeric" : "email"}
          value={value}
          onChange={(e) =>
            handleValueChange(
              channel === "phone"
                ? e.target.value.replace(/\D/g, "").slice(0, 10)
                : e.target.value
            )
          }
          placeholder={channel === "phone" ? "98765 43210" : "you@example.com"}
          required
          disabled={disabled || verified}
          maxLength={channel === "phone" ? 10 : undefined}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm bg-transparent focus:outline-none disabled:text-gray-500"
        />
        {verified ? verifiedBadge : verifyButton}
      </div>

      {codeSent && !verified && (
        <div className="mt-2 flex items-center gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
              setError("");
            }}
            placeholder="000000"
            maxLength={6}
            autoComplete="one-time-code"
            className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-center tracking-[0.4em] font-mono font-semibold focus:outline-none focus:border-[var(--primary)] transition"
          />
          <button
            type="button"
            onClick={confirmCode}
            disabled={confirming || code.length !== 6}
            className="shrink-0 px-4 py-2 text-xs font-semibold text-white bg-[var(--primary)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {confirming ? "Checking..." : "Confirm"}
          </button>
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {!error && info && !verified && (
        <p className="mt-1 text-xs text-gray-500">{info}</p>
      )}
      {!error && !info && !verified && (
        <p className="mt-1 text-xs text-gray-400">
          {channel === "phone"
            ? "Tap Verify to receive an OTP by SMS"
            : "Tap Verify to receive a code by email"}
        </p>
      )}
    </div>
  );
}
