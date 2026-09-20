import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-safe guard for /admin routes.
 *
 * It only checks for the PRESENCE of the session cookie, so no database
 * access happens here. The real session validation (cookie → database)
 * happens in the admin layout and in every server action — those are the
 * security boundary; this proxy just sends unauthenticated visitors to the
 * login page quickly.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Login and first-run setup must stay reachable.
  if (pathname === "/admin/login" || pathname === "/admin/setup") {
    return NextResponse.next();
  }

  const hasSessionCookie = request.cookies.has("mbn_admin_session");

  if (!hasSessionCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
