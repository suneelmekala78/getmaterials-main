import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signAccessToken } from "@/lib/jwt";

const API_ORIGIN =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

type Ctx = { params: Promise<{ path: string[] }> };

export const runtime = "nodejs";
export const maxDuration = 300;

async function proxy(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  const targetPath = path.join("/");
  const incoming = new URL(req.url);
  const targetUrl = `${API_ORIGIN}/api/${targetPath}${incoming.search}`;

  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  // Convert NextAuth session → Nest Bearer JWT so Nest guards work
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
    }
  } catch {
    // public routes still work without a session
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
  const pass = ["content-type", "cache-control"];
  for (const key of pass) {
    const value = upstream.headers.get(key);
    if (value) outHeaders.set(key, value);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: outHeaders,
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
