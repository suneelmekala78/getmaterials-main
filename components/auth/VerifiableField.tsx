"use client";

import { useEffect, useState } from "react";
import { OtpCodeInput } from "./OtpCodeInput";
import {
  disposableEmailMessage,
  fakePhoneMessage,
  isDisposableEmail,
  isFakeIndianMobile,
} from "@/lib/contact-guard";

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
    if (channel === "email" && isDisposableEmail(value)) {
      setError(disposableEmailMessage());
      return;
    }
    if (channel === "phone" && isFakeIndianMobile(value)) {
      setError(fakePhoneMessage());
      return;
    }
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
      className="shrink-0 h-[46px] px-4 rounded-xl text-sm font-semibold bg-[#F3E8FF] text-[var(--primary)] hover:bg-[#ead5ff] disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition"
    >
      {sending
        ? "Sending..."
        : cooldown > 0
          ? `${cooldown}s`
          : codeSent
            ? "Resend"
            : "Verify"}
    </button>
  );

  const verifiedBadge = (
    <span className="shrink-0 inline-flex h-[46px] items-center gap-1 px-3 text-sm font-semibold text-emerald-600">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
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
      <span className="auth-label">{label}</span>

      <div className="flex items-center gap-2">
        <div
          className={`flex min-w-0 flex-1 items-stretch overflow-hidden rounded-xl border ${
            verified
              ? "border-emerald-300 bg-emerald-50/50"
              : "border-slate-200 bg-slate-50 focus-within:border-[var(--primary)] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(177,0,255,0.1)]"
          }`}
        >
          {channel === "phone" && (
            <span className="inline-flex items-center px-3 text-sm font-medium text-slate-600 border-r border-slate-200">
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
            className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-[0.9375rem] outline-none disabled:text-slate-500"
          />
        </div>
        {verified ? verifiedBadge : verifyButton}
      </div>

      {codeSent && !verified && (
        <div className="mt-3 space-y-2">
          <OtpCodeInput
            value={code}
            onChange={(next) => {
              setCode(next);
              setError("");
            }}
            disabled={confirming}
            autoFocus
          />
          <button
            type="button"
            onClick={confirmCode}
            disabled={confirming || code.length !== 6}
            className="auth-btn"
          >
            {confirming ? "Checking..." : "Confirm"}
          </button>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
      {!error && info && !verified && (
        <p className="mt-1.5 text-xs text-slate-500">{info}</p>
      )}
      {!error && !info && !verified && (
        <p className="mt-1.5 text-xs text-slate-400">
          {channel === "phone"
            ? "We’ll send a 6-digit code to this number"
            : "We’ll send a 6-digit code to this email"}
        </p>
      )}
    </div>
  );
}
