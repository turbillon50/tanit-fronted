import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "tanit_auth";
const PUBLIC_ROUTES = ["/login", "/api/auth"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow login routes and API auth
  for (const r of PUBLIC_ROUTES) {
    if (pathname.startsWith(r)) return NextResponse.next();
  }

  // Allow Next.js internals and static assets (defensive — matcher already excludes most)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".") // any file extension (icons, images, robots.txt, etc.)
  ) {
    return NextResponse.next();
  }

  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    // No password configured → fail open. Better than locking everyone out by mistake.
    return NextResponse.next();
  }

  const cookie = req.cookies.get(COOKIE_NAME);
  if (cookie?.value === expected) {
    return NextResponse.next();
  }

  // Redirect to login, preserving the original destination so we can return after auth
  const loginUrl = new URL("/login", req.url);
  if (pathname !== "/") {
    loginUrl.searchParams.set("next", pathname);
  }
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Run on everything except static files
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|icon-light-32x32.png|icon-dark-32x32.png|images|placeholder).*)",
  ],
};
