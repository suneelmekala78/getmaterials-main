"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { PhoneInput, formatPhoneDisplay } from "./PhoneInput";

type AuthMode = "email" | "phone";
type PhoneStep = "phone" | "otp";

export function LoginForm() {
  const [mode, setMode] = useState<AuthMode>("email");
  const [phoneStep, setPhoneStep] = useState<PhoneStep>("phone");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered")) {
      setSuccess("Account created successfully. Please log in.");
    }
  }, []);

  const redirectAfterLogin = async () => {
    setSuccess("Login successful! Redirecting...");
    toast.success("Login successful!");
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const userRole = sessionData?.user?.role;
    window.location.href =
      userRole === "teacher" ? "/teacher/dashboard" : "/dashboard";
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          const msg =
            "Please verify your account before logging in.";
          setError(msg);
          toast.error(msg);
        } else {
          setError("Invalid email or password");
          toast.error("Invalid email or password");
        }
        setLoading(false);
      } else {
        await redirectAfterLogin();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/phone/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "login" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send OTP");
        toast.error(data.error || "Failed to send OTP");
      } else {
        setPhoneStep("otp");
        setSuccess(`OTP sent to ${formatPhoneDisplay(phone)}`);
        toast.success("OTP sent!");
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const result = await signIn("phone", {
        phone,
        code: otp,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid or expired OTP");
        toast.error("Invalid or expired OTP");
        setLoading(false);
      } else {
        await redirectAfterLogin();
      }
    } catch {
      setError("Something went wrong. Please try again.");
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setSuccess("");
    setPhoneStep("phone");
    setOtp("");
  };

  return (
    <div className="space-y-5">
      <div className="flex rounded-lg border border-gray-200 p-1 bg-gray-50">
        <button
          type="button"
          onClick={() => switchMode("email")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            mode === "email"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Email
        </button>
        <button
          type="button"
          onClick={() => switchMode("phone")}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition ${
            mode === "phone"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Phone (+91)
        </button>
      </div>

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

      {mode === "email" ? (
        <form onSubmit={handleEmailSubmit} className="space-y-4">
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

          <label className="block">
            <span className="text-sm font-medium">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
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
          </label>

          <div className="flex justify-end">
            <a
              href="/forgot-password"
              className="text-xs text-[var(--primary)] font-medium hover:underline"
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>
      ) : phoneStep === "phone" ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Mobile number</span>
            <PhoneInput value={phone} onChange={setPhone} required />
          </label>

          <button
            type="submit"
            disabled={loading || phone.length !== 10}
            className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={handlePhoneVerify} className="space-y-4">
          <p className="text-sm text-gray-600">
            Enter the 6-digit code sent to{" "}
            <span className="font-semibold text-gray-900">
              {formatPhoneDisplay(phone)}
            </span>
          </p>

          <label className="block">
            <span className="text-sm font-medium">OTP</span>
            <input
              type="text"
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              maxLength={6}
              className="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-center tracking-[0.4em] font-mono font-semibold focus:outline-none focus:border-[var(--primary)] transition"
            />
          </label>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full py-2.5 bg-[var(--primary)] text-white font-semibold rounded-lg shadow-[0_6px_18px_rgba(177,0,255,0.12)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify & log in"}
          </button>

          <button
            type="button"
            onClick={() => {
              setPhoneStep("phone");
              setOtp("");
              setSuccess("");
            }}
            className="w-full text-xs text-gray-500 hover:text-gray-700"
          >
            Change number
          </button>
        </form>
      )}
    </div>
  );
}
