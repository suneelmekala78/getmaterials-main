import { auth } from "@/lib/auth";
import { verifyAccessToken, type JWTPayload } from "@/lib/jwt";
import { headers } from "next/headers";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
}

/**
 * Unified auth helper — checks NextAuth session (web) OR Bearer JWT (mobile).
 * Use this in API routes that need to support both web and mobile clients.
 */
export async function getUser(): Promise<AuthUser | null> {
  // First, try NextAuth session (web)
  const session = await auth();
  if (session?.user) {
    const user = session.user as any;
    return {
      id: user.id,
      email: user.email!,
      name: user.name!,
      role: user.role,
      status: user.status,
    };
  }

  // Then, try Bearer token (mobile)
  const headersList = await headers();
  const authorization = headersList.get("authorization");
  if (authorization?.startsWith("Bearer ")) {
    const token = authorization.slice(7);
    const payload = await verifyAccessToken(token);
    if (payload) {
      return {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role,
        status: payload.status,
      };
    }
  }

  return null;
}

/**
 * Same as getUser() but throws/returns 401 response data if unauthenticated.
 * Convenience for API routes.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (user.status === "suspended") {
    throw new Error("SUSPENDED");
  }
  return user;
}
