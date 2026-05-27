import { NextRequest, NextResponse } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = [
  "/shopproof/dashboard",
  "/shopproof/new",
  "/shopproof/jobs",
  "/account",
];

// Routes that should redirect authenticated users away (login/signup)
const AUTH_ROUTES = ["/login"];

// Public routes that never need auth
const PUBLIC_PREFIXES = [
  "/shopproof/sign",  // customer signing flow — token-based, no auth
  "/pricing",
  "/reset-password",
  "/api",
  "/_next",
  "/favicon",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public paths
  for (const prefix of PUBLIC_PREFIXES) {
    if (pathname.startsWith(prefix)) return NextResponse.next();
  }

  // Read Supabase session cookie
  // Supabase sets sb-<ref>-auth-token cookies
  const hasCookie = req.cookies.getAll().some(
    (c) => c.name.includes("auth-token") || c.name.includes("sb-") && c.name.includes("-auth")
  );

  // Redirect unauthenticated users away from protected routes
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasCookie) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from login page
  const isAuthRoute = AUTH_ROUTES.some((p) => pathname.startsWith(p));
  if (isAuthRoute && hasCookie) {
    const next = req.nextUrl.searchParams.get("next");
    const url = req.nextUrl.clone();
    url.pathname = next || "/shopproof/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
