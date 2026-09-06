import { NextRequest, NextResponse } from "next/server";
import { resolveApiOrigin } from "@/lib/api-origin";

async function proxy(req: NextRequest, suffix: string) {
  const target = `${resolveApiOrigin()}/api/referral-tracking/${suffix}`;
  const headers = new Headers();
  const contentType = req.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const auth = req.headers.get("authorization");
  if (auth) headers.set("authorization", auth);

  try {
    const { getExpressAccessToken } = await import("@/lib/express-token");
    const token = await getExpressAccessToken();
    if (token) headers.set("authorization", `Bearer ${token}`);
  } catch {
    // public endpoints work without auth
  }

  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = Buffer.from(await req.arrayBuffer());
  }

  try {
    const upstream = await fetch(target, init);
    return new NextResponse(upstream.body, {
      status: upstream.status,
      headers: { "content-type": upstream.headers.get("content-type") || "application/json" },
    });
  } catch {
    return NextResponse.json({ error: "API unavailable" }, { status: 502 });
  }
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}
