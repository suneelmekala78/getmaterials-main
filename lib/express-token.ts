import { auth } from "@/lib/auth";
import { signAccessToken } from "@/lib/jwt";
import { resolveApiOrigin } from "@/lib/api-origin";

function readEnv(...parts: string[]) {
  return process.env[parts.join("_")];
}

/** Read JWT `exp` (ms) without verifying — only used to decide when to remint. */
function accessTokenExpiryMs(token: string): number | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(
      part.replace(/-/g, "+").replace(/_/g, "/"),
      "base64",
    ).toString("utf8");
    const payload = JSON.parse(json) as { exp?: number };
    return typeof payload.exp === "number" ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function isUsableAccessToken(token?: string | null) {
  if (!token) return false;
  const exp = accessTokenExpiryMs(token);
  if (exp == null) return true;
  // Remint a couple minutes early so mid-request expiry is rare.
  return exp - Date.now() > 2 * 60 * 1000;
}

async function mintViaSessionToken(user: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
  role?: string;
  status?: string;
}) {
  const internal = readEnv("INTERNAL", "API", "SECRET");
  if (!internal || !user.email) return null;
  try {
    const res = await fetch(`${resolveApiOrigin()}/api/auth/session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": internal,
      },
      body: JSON.stringify({
        userId: user.id || user.email,
        email: user.email,
        name: user.name || user.email,
        role: user.role || "student",
        status: user.status || "active",
        expiresIn: "7d",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { accessToken?: string };
    if (res.ok && data.accessToken) return data.accessToken;
  } catch (error) {
    console.error("[express-token] session-token failed", error);
  }
  return null;
}

/** Prefer a live Express-issued token; remint when the stored one is expired. */
export async function getExpressAccessToken() {
  const session = (await auth()) as {
    accessToken?: string;
    user?: {
      id?: string | null;
      email?: string | null;
      name?: string | null;
      role?: string;
      status?: string;
    };
  } | null;

  if (isUsableAccessToken(session?.accessToken)) {
    return session!.accessToken!;
  }

  const user = session?.user;
  if (!user?.email) return null;

  const minted = await mintViaSessionToken(user);
  if (minted) return minted;

  return signAccessToken({
    sub: String(user.id || user.email),
    email: String(user.email),
    name: String(user.name || user.email),
    role: String(user.role || "student"),
    status: String(user.status || "active"),
  });
}
