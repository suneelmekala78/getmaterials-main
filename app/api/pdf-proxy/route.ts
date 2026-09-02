import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_HOSTS = new Set(["media.getmaterials.in", "localhost", "127.0.0.1"]);

function isAllowedPdfUrl(raw: string) {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (ALLOWED_HOSTS.has(host)) return true;
    if (host.endsWith(".amazonaws.com")) return true;
    if (host.endsWith(".cloudfront.net")) return true;
    return false;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url || !isAllowedPdfUrl(url)) {
    return new Response("Invalid PDF url", { status: 400 });
  }

  const upstream = await fetch(url, { cache: "force-cache" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Unable to load PDF", { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "application/pdf";
  return new Response(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType.includes("pdf") ? "application/pdf" : "application/pdf",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
