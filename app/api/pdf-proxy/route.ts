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

  // Never stream the PDF through Amplify/CloudFront — large files 413.
  return Response.redirect(url, 302);
}
