import { SignJWT } from "jose";

const ACCESS_TOKEN_EXPIRY = "15m";

/** Avoid Next.js build-time inlining so Amplify runtime secrets are used. */
function readEnv(...parts: string[]) {
  return process.env[parts.join("_")];
}

function getSecret() {
  return new TextEncoder().encode(
    readEnv("JWT", "SECRET") ||
      readEnv("AUTH", "SECRET") ||
      readEnv("NEXTAUTH", "SECRET") ||
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

/** Mint a Bearer token so the Next.js BFF can call Express (default 7d to match web sessions). */
export async function signAccessToken(
  payload: JWTPayload,
  expiresIn: string = "7d",
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn || ACCESS_TOKEN_EXPIRY)
    .setIssuer("getmaterials")
    .setAudience("getmaterials-mobile")
    .sign(getSecret());
}
