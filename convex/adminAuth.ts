import { ConvexError, v } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { resolveSessionSecret, verifySession } from "./adminCrypto";

// ---------------------------------------------------------------------------
// Admin gate (Kabir).
//
// Accepted credentials, checked in order:
//   1. Convex Auth identity (`ctx.auth.getUserIdentity()`) — the long-term
//      path. TODO: enforce an ADMIN_EMAILS allowlist here once Convex Auth
//      Password is wired; no call-site changes needed then.
//   2. CMS session token (`adminSecret` = `emailB64.expiryHex.hmac`, minted
//      by `/api/admin-login` after email+password verification). Verified
//      with `ADMIN_SESSION_SECRET` (same value in Vercel + Convex envs).
//   3. Legacy `ADMIN_TOKEN` exact match (temporary fallback, plan option B).
//
// Fail-closed: anonymous callers ALWAYS get UNAUTHORIZED.
//
// Returns the staff email when the credential carries one (session or
// identity), else null (legacy token). Endpoints that act AS a user
// (`adminUsers.me/changePassword`) reject the null case with a re-login
// message.
// ---------------------------------------------------------------------------

/** Spread into every admin query/mutation args object. */
export const adminSecretArgs = {
  adminSecret: v.optional(v.string()),
};

export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  adminSecret?: string,
): Promise<string | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (identity) {
    const email =
      typeof identity.email === "string" ? identity.email.toLowerCase() : null;
    return email;
  }
  const secret = (adminSecret ?? "").trim();
  if (secret) {
    const session = verifySession(
      secret,
      resolveSessionSecret(process.env.ADMIN_SESSION_SECRET),
    );
    if (session) return session.email;
    const expected = (process.env.ADMIN_TOKEN ?? "").trim();
    if (expected && secret === expected) return null;
  }
  throw new ConvexError({
    code: "UNAUTHORIZED",
    message: "Sign in required.",
  });
}

/** requireAdmin + demand a user email (else ask to sign in again). */
export async function requireAdminEmail(
  ctx: QueryCtx | MutationCtx,
  adminSecret?: string,
): Promise<string> {
  const email = await requireAdmin(ctx, adminSecret);
  if (!email) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Please sign in again with email and password.",
    });
  }
  return email;
}
