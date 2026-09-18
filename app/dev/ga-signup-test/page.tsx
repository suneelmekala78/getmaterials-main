"use client";

import { useState } from "react";
import { trackSignUp, GA_MEASUREMENT_ID } from "@/lib/analytics";

/**
 * Local-only helper to verify GA4 sign_up collect hits.
 * Visit /dev/ga-signup-test while running next dev.
 */
export default function GaSignupTestPage() {
  const [log, setLog] = useState("");

  if (process.env.NODE_ENV === "production") {
    return <p>Not available in production.</p>;
  }

  return (
    <main style={{ padding: 24, fontFamily: "sans-serif" }}>
      <h1>GA4 sign_up test</h1>
      <p>Measurement ID: {GA_MEASUREMENT_ID}</p>
      <button
        type="button"
        id="fire-signup"
        onClick={async () => {
          setLog("firing…");
          await trackSignUp("email");
          setLog("trackSignUp resolved");
        }}
      >
        Fire trackSignUp(email)
      </button>
      <p id="status">{log}</p>
    </main>
  );
}
