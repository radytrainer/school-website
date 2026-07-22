import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse, type NextFetchEvent } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";
import { recordPageview } from "@/lib/analytics";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

const ADMIN_PATH = /^\/[a-z]{2}\/admin(\/.*)?$/;
const AUTH_PATH = /^\/[a-z]{2}\/auth(\/.*)?$/;

// Anonymous, cookie-free visitor id for the "unique visitors" count: hashes
// IP + User-Agent + the current day, so the same visitor can't be
// correlated across days and nothing is stored client-side.
async function hashVisitor(ip: string, userAgent: string, day: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}|${userAgent}|${day}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // Run next-intl middleware first for locale detection
  const response = intlMiddleware(request);

  // Count real page visits — skip prefetches (Link hover/viewport) and
  // admin/auth routes, and never block the response on it.
  const isPrefetch = request.headers.get("next-router-prefetch") === "1";
  if (request.method === "GET" && !isPrefetch && !ADMIN_PATH.test(pathname) && !AUTH_PATH.test(pathname)) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const day = new Date().toISOString().slice(0, 10);
    event.waitUntil(hashVisitor(ip, userAgent, day).then((hash) => recordPageview(hash, day)));
  }

  // Protect admin routes — check for session cookie set after Firebase login
  if (ADMIN_PATH.test(pathname)) {
    const sessionCookie = request.cookies.get("__session");

    if (!sessionCookie?.value) {
      const locale = pathname.split("/")[1] ?? defaultLocale;
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_PATH.test(pathname)) {
    const sessionCookie = request.cookies.get("__session");
    if (sessionCookie?.value) {
      const locale = pathname.split("/")[1] ?? defaultLocale;
      return NextResponse.redirect(new URL(`/${locale}/admin`, request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|googlebd902d9dccd415dd\\.html|.*\\.(?:svg|SVG|png|PNG|jpg|JPG|jpeg|JPEG|gif|GIF|webp|WEBP|ico|ICO|css|js|woff|woff2)).*)",
  ],
};
