import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const protectedPaths = [
  "/dashboard",
  "/upload",
  "/bookmarks",
  "/settings",
  "/profile",
  "/teacher",
  "/quizzes",
  "/requests",
  "/my-materials",
];

// API routes that require authentication
const protectedApiPaths = [
  "/api/bookmarks",
  "/api/upload",
  "/api/quizzes",
  "/api/requests",
  "/api/role-change-requests",
  "/api/reviews",
  "/api/teacher",
  "/api/user",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow auth API routes, public API routes, and static assets
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/materials") ||
    pathname.startsWith("/api/subjects") ||
    pathname.startsWith("/api/chapters") ||
    pathname.startsWith("/api/search") ||
    pathname.startsWith("/api/college-assignments") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/feedback") ||
    pathname.startsWith("/api/college-directory") ||
    pathname.startsWith("/api/profiles") ||
    pathname.startsWith("/api/polls")
  ) {
    return NextResponse.next();
  }

  const sessionCookie =
    req.cookies.get("getmaterials-main-session") ||
    req.cookies.get("__Secure-getmaterials-main-session");

  // Auth pages — redirect to dashboard if already logged in
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/reset-password")
  ) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  }

  const matchesPath = (path: string) =>
    pathname === path || pathname.startsWith(`${path}/`);

  // Check protected page routes
  const isProtectedPage = protectedPaths.some(matchesPath);

  // Check protected API routes
  const isProtectedApi = protectedApiPaths.some(matchesPath);

  if (isProtectedPage && !sessionCookie) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtectedApi && !sessionCookie) {
    // Allow Bearer token auth (mobile app) — actual validation happens in route handler via getUser()
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|public/).*)"],
};
