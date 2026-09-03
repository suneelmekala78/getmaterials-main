import { SignJWT } from "jose";

const ACCESS_TOKEN_EXPIRY = "15m";

function getSecret() {
  return new TextEncoder().encode(
    process.env.JWT_SECRET ||
      process.env.AUTH_SECRET ||
      process.env.NEXTAUTH_SECRET ||
      "fallback-dev-secret",
  );
}

export interface JWTPayload {
  sub: string;
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
    .sign(getSecret());
}
