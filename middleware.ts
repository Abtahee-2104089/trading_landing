import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveSessionSecret, verifySession } from "@/convex/adminCrypto";

/**
 * Edge gate for `/admin/*` — email+password sessions.
 *
 * - `/admin/login` and `/admin/setup` are always reachable.
 * - Every other `/admin/*` route requires a valid `admin_session` cookie
 *   (HMAC-verified with `ADMIN_SESSION_SECRET`, 7-day expiry); otherwise
 *   redirect to `/admin/login`.
 * - The same token is threaded as `adminSecret` into Convex admin calls
 *   (see `convex/adminAuth.ts`) — the cookie alone is UX, Convex enforces.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }
  if (
    pathname === "/admin/login" ||
    pathname.startsWith("/admin/login/") ||
    pathname === "/admin/setup" ||
    pathname.startsWith("/admin/setup/")
  ) {
    return NextResponse.next();
  }
  const token = request.cookies.get("admin_session")?.value ?? "";
  const session = token
    ? verifySession(
        token,
        resolveSessionSecret(process.env.ADMIN_SESSION_SECRET),
      )
    : null;
  if (session) {
    return NextResponse.next();
  }
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
