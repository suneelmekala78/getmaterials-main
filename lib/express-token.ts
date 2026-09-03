import { auth } from "@/lib/auth";
import { signAccessToken } from "@/lib/jwt";
import { resolveApiOrigin } from "@/lib/api-origin";

function readEnv(...parts: string[]) {
  return process.env[parts.join("_")];
}

/** Prefer an Express-issued token so JWT_SECRET mismatches cannot 401 uploads. */
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
  if (session?.accessToken) return session.accessToken;

  const user = session?.user;
  if (!user?.email) return null;

  const internal = readEnv("INTERNAL", "API", "SECRET");
  if (internal) {
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
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { accessToken?: string };
      if (res.ok && data.accessToken) return data.accessToken;
    } catch (error) {
      console.error("[express-token] session-token failed", error);
    }
  }

  return signAccessToken({
    sub: String(user.id || user.email),
    email: String(user.email),
    name: String(user.name || user.email),
    role: String(user.role || "student"),
    status: String(user.status || "active"),
  });
}
