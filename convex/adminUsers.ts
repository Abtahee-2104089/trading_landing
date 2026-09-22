import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { hashPassword, verifyPassword } from "./adminCrypto";
import { adminSecretArgs, requireAdminEmail } from "./adminAuth";
import {
  SUBMIT_MINUTE_LIMIT,
  SUBMIT_MINUTE_MS,
  checkRateLimit,
  incrementRateLimit,
} from "./rateLimit";

// ---------------------------------------------------------------------------
// CMS staff accounts (email + password).
//
// - `/admin/setup` (public, first-run only): `setupNeeded` + `setupFirstAdmin`.
// - Login verification: `login({email, password}) -> {ok}` — called by the
//   Next `/api/admin-login` route, which mints the session cookie on `ok`.
//   Throttled per email (failed attempts burn quota, successes don't).
// - `/admin/account`: `me` + `changePassword` (both session-gated).
//
// Passwords NEVER leave this module in plaintext and are NEVER stored —
// only salt + stretched hash. The login oracle is online-only (same as any
// login form) and throttled.
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

function normalizeEmail(raw: string): string {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) fail("Enter a valid email address.");
  if (email.length > 254) fail("Email is too long.");
  return email;
}

function checkPasswordShape(password: string): void {
  if (password.length < 8) fail("Password must be at least 8 characters.");
  if (password.length > 128) fail("Password must be at most 128 characters.");
}

/** True while no staff account exists — the setup page is allowed. */
export const setupNeeded = query({
  args: {},
  returns: v.boolean(),
  handler: async (ctx) => {
    const existing = await ctx.db.query("adminUsers").first();
    return existing === null;
  },
});

/** Create the FIRST staff account. Fails once any account exists. */
export const setupFirstAdmin = mutation({
  args: { email: v.string(), password: v.string() },
  returns: v.object({ email: v.string() }),
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("adminUsers").first();
    if (existing) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Setup is closed — an admin account already exists.",
      });
    }
    const email = normalizeEmail(args.email);
    checkPasswordShape(args.password);
    const record = hashPassword(args.password);
    await ctx.db.insert("adminUsers", {
      email,
      salt: record.salt,
      hash: record.hash,
      iterations: record.iterations,
      createdAt: Date.now(),
    });
    return { email };
  },
});

/**
 * Verify credentials for the login route. Returns `{ ok }` only — no user
 * details, noreason codes (prevents account enumeration beyond the boolean).
 */
export const login = mutation({
  args: { email: v.string(), password: v.string() },
  returns: v.object({ ok: v.boolean() }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const key = `login:email:${email || "(empty)"}:minute`;
    await checkRateLimit(ctx, {
      key,
      limit: SUBMIT_MINUTE_LIMIT,
      windowMs: SUBMIT_MINUTE_MS,
    });
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    const ok =
      user !== null &&
      verifyPassword(args.password, {
        salt: user.salt,
        hash: user.hash,
        iterations: user.iterations,
      });
    if (!ok) {
      await incrementRateLimit(ctx, { key, windowMs: SUBMIT_MINUTE_MS });
    }
    return { ok };
  },
});

/** Current staff email for `/admin/account` (session-gated). */
export const me = query({
  args: { ...adminSecretArgs },
  returns: v.object({ email: v.string() }),
  handler: async (ctx, args) => {
    const email = await requireAdminEmail(ctx, args.adminSecret);
    return { email };
  },
});

/**
 * All staff accounts (emails only — hashes never leave the table).
 * Shown in `/admin/account` → Team admins.
 */
export const list = query({
  args: { ...adminSecretArgs },
  returns: v.array(
    v.object({ email: v.string(), createdAt: v.number() }),
  ),
  handler: async (ctx, args) => {
    await requireAdminEmail(ctx, args.adminSecret);
    const users = await ctx.db.query("adminUsers").order("asc").take(50);
    return users.map((u) => ({ email: u.email, createdAt: u.createdAt }));
  },
});

/**
 * Add another staff admin (email + password).
 *
 * Verification: the caller must present a valid staff session — the token
 * is HMAC-verified against `ADMIN_SESSION_SECRET` from the environment
 * (same secret the middleware and login route use), so only a signed-in
 * admin can invite others. Rejects duplicates and weak passwords.
 */
export const createAdmin = mutation({
  args: { email: v.string(), password: v.string(), ...adminSecretArgs },
  returns: v.object({ email: v.string() }),
  handler: async (ctx, args) => {
    await requireAdminEmail(ctx, args.adminSecret);
    const email = normalizeEmail(args.email);
    checkPasswordShape(args.password);
    const existing = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (existing) fail("An admin with this email already exists.");
    const record = hashPassword(args.password);
    await ctx.db.insert("adminUsers", {
      email,
      salt: record.salt,
      hash: record.hash,
      iterations: record.iterations,
      createdAt: Date.now(),
    });
    return { email };
  },
});

/**
 * Remove a staff admin. Guards: cannot remove yourself (avoids instant
 * lockout) and cannot remove the last remaining account.
 */
export const removeAdmin = mutation({
  args: { email: v.string(), ...adminSecretArgs },
  returns: v.null(),
  handler: async (ctx, args) => {
    const requester = await requireAdminEmail(ctx, args.adminSecret);
    const email = normalizeEmail(args.email);
    if (email === requester) {
      fail("You cannot remove your own account while signed in as it.");
    }
    const target = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (!target) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Admin not found." });
    }
    const total = (await ctx.db.query("adminUsers").take(50)).length;
    if (total <= 1) fail("Cannot remove the last admin account.");
    await ctx.db.delete("adminUsers", target._id);
    return null;
  },
});

/** Change the staff password (verifies the current one first). */
export const changePassword = mutation({
  args: {
    currentPassword: v.string(),
    newPassword: v.string(),
    ...adminSecretArgs,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const email = await requireAdminEmail(ctx, args.adminSecret);
    checkPasswordShape(args.newPassword);
    const user = await ctx.db
      .query("adminUsers")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();
    if (
      !user ||
      !verifyPassword(args.currentPassword, {
        salt: user.salt,
        hash: user.hash,
        iterations: user.iterations,
      })
    ) {
      throw new ConvexError({
        code: "UNAUTHORIZED",
        message: "Current password is incorrect.",
      });
    }
    const record = hashPassword(args.newPassword);
    await ctx.db.patch("adminUsers", user._id, {
      salt: record.salt,
      hash: record.hash,
      iterations: record.iterations,
      updatedAt: Date.now(),
    });
    return null;
  },
});
