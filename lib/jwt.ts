import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || process.env.AUTH_SECRET || "fallback-dev-secret"
);

const ACCESS_TOKEN_EXPIRY = "15m";

export interface JWTPayload {
  sub: string; // user id
  email: string;
  name: string;
  role: string;
  status: string;
}

/** Mint a short-lived Bearer token so the Next.js BFF can call Express. */
export async function signAccessToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .setIssuer("getmaterials")
    .setAudience("getmaterials-mobile")
    .sign(JWT_SECRET);
}
