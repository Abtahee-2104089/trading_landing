import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "./_generated/server";

// ---------------------------------------------------------------------------
// Admin gate — STUB until Kabir wires real auth (Convex Auth + Password,
// `convex/auth.config.ts`, ADMIN_EMAILS allowlist).
//
// Fail-closed: anonymous callers ALWAYS get UNAUTHORIZED today. After Kabir
// wires login, extend the check below with the allowlist/role lookup —
// every admin mutation/query already funnels through `requireAdmin`, so no
// call-site changes are needed then.
// ---------------------------------------------------------------------------

export async function requireAdmin(ctx: QueryCtx | MutationCtx): Promise<void> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Sign in required.",
    });
  }
  // TODO(Kabir): enforce ADMIN_EMAILS allowlist here, e.g.
  //   const allowlist = (process.env.ADMIN_EMAILS ?? "").split(",")...
  //   if (!allowlist.includes(identity.email ?? "")) throw UNAUTHORIZED
}
