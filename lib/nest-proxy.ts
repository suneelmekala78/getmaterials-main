import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signAccessToken } from "@/lib/jwt";

const API_ORIGIN =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

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
  const targetUrl = `${API_ORIGIN}${nestPath}${incoming.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  try {
    const session = await auth();
    const user = session?.user as any;
    if (user?.id && user?.email) {
      const accessToken = await signAccessToken({
        sub: String(user.id),
        email: String(user.email),
        name: String(user.name || user.email),
        role: String(user.role || "student"),
        status: String(user.status || "active"),
      });
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
      { error: "API server unavailable. Is Nest running on port 4000?" },
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
