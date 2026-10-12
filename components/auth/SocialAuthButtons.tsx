"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { deviceNameFromUa, getOrCreateDeviceId } from "@/lib/device-id";
import { redirectAfterLogin } from "@/lib/post-login";

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "377241660777-hs3iovq384958o21a1d284hg3ibr294p.apps.googleusercontent.com";
const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID || "";
const GOOGLE_SDK = "https://accounts.google.com/gsi/client";
const APPLE_SDK =
  "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

const ERRORS: Record<string, string> = {
  suspended: "Your account has been suspended.",
  disposable_email: "Temporary email addresses can't be used on GetMaterials.",
  email_required: "We need a verified email from your account to sign you in.",
  account_deleted: "This account has been permanently deleted.",
  social_failed: "We couldn't sign you in. Please try again.",
};

type Provider = "google" | "apple";

declare global {
  interface Window {
    google?: any;
    AppleID?: any;
  }
}

const scripts = new Map<string, Promise<void>>();

function loadScript(src: string) {
  const cached = scripts.get(src);
  if (cached) return cached;
  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scripts.delete(src);
      reject(new Error(`Failed to load ${src}`));
    };
    document.head.appendChild(script);
  });
  scripts.set(src, promise);
  return promise;
}

function AppleLogo() {
  return (
    <svg viewBox="0 0 17 20" aria-hidden="true" className="h-[18px] w-[18px] fill-current">
      <path d="M14.06 10.62c-.02-2.2 1.8-3.26 1.88-3.31-1.03-1.5-2.62-1.7-3.19-1.73-1.36-.14-2.65.8-3.34.8-.69 0-1.75-.78-2.88-.76-1.48.02-2.85.86-3.61 2.19-1.54 2.67-.39 6.62 1.11 8.79.73 1.06 1.6 2.25 2.75 2.21 1.1-.04 1.52-.71 2.85-.71 1.33 0 1.71.71 2.88.69 1.19-.02 1.94-1.08 2.66-2.15.84-1.23 1.19-2.42 1.21-2.48-.03-.01-2.31-.89-2.32-3.54ZM11.87 4.15c.61-.74 1.02-1.76.91-2.78-.88.04-1.94.59-2.57 1.32-.56.65-1.06 1.69-.93 2.69.98.08 1.98-.5 2.59-1.23Z" />
    </svg>
  );
}

export function SocialAuthButtons({ mode }: { mode: "login" | "signup" }) {
  const googleRef = useRef<HTMLDivElement>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState("");

  const finish = async (provider: Provider, token: string, firstName = "", lastName = "") => {
    setBusy(provider);
    setError("");
    try {
      const result = await signIn("social", {
        provider,
        token,
        firstName,
        lastName,
        deviceId: getOrCreateDeviceId(),
        deviceName: deviceNameFromUa(),
        userAgent: navigator.userAgent,
        redirect: false,
      });
      if (result?.error) {
        const message = ERRORS[result.code || ""] || ERRORS.social_failed;
        setError(message);
        toast.error(message);
        setBusy(null);
        return;
      }
      toast.success(mode === "signup" ? "Welcome to GetMaterials!" : "Login successful!");
      await redirectAfterLogin(provider);
    } catch {
      setError(ERRORS.social_failed);
      toast.error(ERRORS.social_failed);
      setBusy(null);
    }
  };

  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    let cancelled = false;
    loadScript(GOOGLE_SDK)
      .then(() => {
        const container = googleRef.current;
        if (cancelled || !container || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          ux_mode: "popup",
          context: mode === "signup" ? "signup" : "signin",
          callback: (response: { credential?: string }) => {
            if (response.credential) void finishRef.current("google", response.credential);
          },
        });
        container.innerHTML = "";
        window.google.accounts.id.renderButton(container, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "center",
          width: Math.min(400, Math.max(220, Math.floor(container.offsetWidth))),
        });
        setGoogleReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("Google sign-in couldn't load. Check your connection and refresh.");
      });
    return () => {
      cancelled = true;
    };
  }, [mode]);

  const handleApple = async () => {
    if (busy) return;
    setBusy("apple");
    setError("");
    try {
      await loadScript(APPLE_SDK);
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: process.env.NEXT_PUBLIC_APPLE_REDIRECT_URI || `${window.location.origin}/login`,
        usePopup: true,
      });
      const data = await window.AppleID.auth.signIn();
      const token = data?.authorization?.id_token;
      if (!token) throw new Error("missing token");
      await finish("apple", token, data?.user?.name?.firstName || "", data?.user?.name?.lastName || "");
    } catch (err: any) {
      const code = err?.error || "";
      if (code !== "popup_closed_by_user" && code !== "user_cancelled_authorize") {
        setError(ERRORS.social_failed);
        toast.error(ERRORS.social_failed);
      }
      setBusy(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className={`space-y-3 ${busy ? "pointer-events-none opacity-60" : ""}`} aria-busy={Boolean(busy)}>
        <div className="relative flex justify-center min-h-[44px]">
          {!googleReady ? (
            <div className="absolute inset-0 rounded-full border border-slate-200 bg-slate-50 animate-pulse" />
          ) : null}
          <div ref={googleRef} className="w-full flex justify-center" />
        </div>

        {APPLE_CLIENT_ID ? (
          <button
            type="button"
            onClick={handleApple}
            disabled={Boolean(busy)}
            className="w-full max-w-[400px] mx-auto flex items-center justify-center gap-2.5 h-11 rounded-full bg-black text-white text-[15px] font-semibold hover:bg-slate-900 transition-colors disabled:cursor-not-allowed"
          >
            <AppleLogo />
            Continue with Apple
          </button>
        ) : null}

        {busy ? (
          <p className="text-center text-xs font-medium text-slate-500">
            Signing you in with {busy === "google" ? "Google" : "Apple"}...
          </p>
        ) : null}
        {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          or {mode === "signup" ? "sign up" : "log in"} with email
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    </div>
  );
}
