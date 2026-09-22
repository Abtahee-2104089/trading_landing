"use client";

/**
 * CMS staff session credential.
 *
 * The `admin_session` cookie is set by `/api/admin-login` after
 * email+password verification (or by `/api/admin-setup` for the first
 * account) and read by `middleware.ts` to gate `/admin/*`. Admin pages
 * thread the same value as `adminSecret` into every Convex admin
 * query/mutation (verified in `convex/adminAuth.ts` via HMAC).
 *
 * The cookie is readable by client JS (needed for Convex calls) — a
 * documented tradeoff; the step up is Convex Auth with httpOnly cookies.
 */

const COOKIE_NAME = "admin_session";

export function getAdminSecret(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const value = match?.slice(COOKIE_NAME.length + 1).trim();
  return value ? decodeURIComponent(value) : undefined;
}

/** Args snippet for admin Convex calls — omit when signed out. */
export function adminAuthArgs(): { adminSecret: string } | Record<string, never> {
  const secret = getAdminSecret();
  return secret ? { adminSecret: secret } : {};
}
