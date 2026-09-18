import { NextRequest, NextResponse } from "next/server";
import { getExpressAccessToken } from "@/lib/express-token";
import { resolveApiOrigin } from "@/lib/api-origin";

/**
 * Proxies a request to Nest, attaching a Bearer JWT when a NextAuth session exists.
 * Use for dedicated routes under /api/auth/* that must not hit NextAuth catch-all.
 */
export async function proxyToNest(
  req: NextRequest,
  nestPath: string,
  opts?: { requireSession?: boolean }
) {
  const incoming = new URL(req.url);
  const targetUrl = `${resolveApiOrigin()}${nestPath}${incoming.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  const ua = req.headers.get("user-agent");
  if (ua) headers.set("user-agent", ua);
  const forwarded =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    undefined;
  if (forwarded) headers.set("x-forwarded-for", forwarded);
  headers.set(
    "x-client-platform",
    req.headers.get("x-client-platform") ||
      req.headers.get("x-app-platform") ||
      "website",
  );

  try {
    const accessToken = await getExpressAccessToken();
    if (accessToken) {
      headers.set("authorization", `Bearer ${accessToken}`);
    } else if (opts?.requireSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch {
    if (opts?.requireSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  let upstream: Response;
  try {
    upstream = await fetch(targetUrl, init);
  } catch (error) {
    console.error("API proxy error:", targetUrl, error);
    return NextResponse.json(
      { error: "API server unavailable. Please try again." },
      { status: 502 }
    );
  }

  const outHeaders = new Headers();
  for (const key of ["content-type", "cache-control"]) {
    const value = upstream.headers.get(key);
    if (value) outHeaders.set(key, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export function nestAuthProxy(nestSuffix: string) {
  return (req: NextRequest) => proxyToNest(req, `/api/auth/${nestSuffix}`);
}
