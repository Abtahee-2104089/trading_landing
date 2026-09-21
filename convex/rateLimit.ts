import { ConvexError } from "convex/values";
import type { MutationCtx } from "./_generated/server";

// ---------------------------------------------------------------------------
// P0-1 throttle helper for `inquiries.submit`.
//
// One `rateLimits` row per key: { key, count, windowStart }. Windows are
// fixed (60s / 3600s) per key suffix — the caller picks the key, limit, and
// window. Call `checkRateLimit` BEFORE the write and `incrementRateLimit`
// AFTER a successful write so blocked/failed attempts don't burn quota.
//
// NOTE on races: concurrent mutations may both pass the check before either
// increments (read-then-write). This bounds abuse to ~2x the limit under
// concurrency — acceptable for a contact form; a strict token-bucket would
// need the `@convex-dev/rate-limiter` component (Kabir can swap this module
// without touching call sites).
// ---------------------------------------------------------------------------

export const RATE_LIMIT_CODE = "RATE_LIMITED";

export function rateLimitExceeded(message = "Too many requests. Please try again in a minute."): never {
  throw new ConvexError({ code: RATE_LIMIT_CODE, message });
}

export async function checkRateLimit(
  ctx: MutationCtx,
  opts: { key: string; limit: number; windowMs: number },
): Promise<void> {
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", opts.key))
    .unique();
  if (!existing) return;
  const now = Date.now();
  if (now - existing.windowStart >= opts.windowMs) return; // window expired
  if (existing.count >= opts.limit) {
    rateLimitExceeded();
  }
}

export async function incrementRateLimit(
  ctx: MutationCtx,
  opts: { key: string; windowMs: number },
): Promise<void> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", opts.key))
    .unique();
  if (!existing || now - existing.windowStart >= opts.windowMs) {
    if (existing) await ctx.db.delete("rateLimits", existing._id);
    await ctx.db.insert("rateLimits", {
      key: opts.key,
      count: 1,
      windowStart: now,
    });
    return;
  }
  await ctx.db.patch("rateLimits", existing._id, {
    count: existing.count + 1,
  });
}

// Throttle policy for the public inquiry form.
export const SUBMIT_MINUTE_LIMIT = 5;
export const SUBMIT_MINUTE_MS = 60_000;
export const SUBMIT_HOUR_LIMIT = 20;
export const SUBMIT_HOUR_MS = 3_600_000;

export function submitRateKeys(email: string): { minuteKey: string; hourKey: string } {
  const normalized = email.trim().toLowerCase();
  return {
    minuteKey: `submit:email:${normalized}:minute`,
    hourKey: `submit:email:${normalized}:hour`,
  };
}
