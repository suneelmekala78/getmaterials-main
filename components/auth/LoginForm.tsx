"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import {
  deviceNameFromUa,
  getOrCreateDeviceId,
  reportLoginDevice,
} from "@/lib/device-id";
// Phone login is disabled until SMS provider is ready.
// import { PhoneInput, formatPhoneDisplay } from "./PhoneInput";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    // Backup recognition if web-session did not get a deviceId.
    await reportLoginDevice();
    const sessionRes = await fetch("/api/auth/session");
    const sessionData = await sessionRes.json();
    const userRole = sessionData?.user?.role;
    const userStatus = sessionData?.user?.status;
    window.location.href =
      userRole === "teacher" && userStatus !== "pending"
        ? "/teacher/dashboard"
        : "/dashboard";
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
        deviceId: getOrCreateDeviceId(),
        deviceName: deviceNameFromUa(),
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("EMAIL_NOT_VERIFIED")) {
          const msg = "Please verify your account before logging in.";
          setError(msg);
          toast.error(msg);
        } else if (result.error.includes("ACCOUNT_DELETED")) {
          const msg = "This account has been permanently deleted.";
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

  return (
    <div className="space-y-5">
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

      <form onSubmit={handleEmailSubmit} className="space-y-5">
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
          <span className="auth-label">Password</span>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
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
        </label>

        <div className="flex justify-end -mt-1">
          <a
            href="/forgot-password"
            className="text-sm font-medium text-[var(--primary)] hover:underline"
          >
            Forgot password?
          </a>
        </div>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
