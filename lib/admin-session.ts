import { cookies } from "next/headers";
import {
  SESSION_TTL_MS,
  resolveSessionSecret,
  signSession,
} from "@/convex/adminCrypto";

/**
 * Server-side session helpers (Next routes share these; middleware
 * verifies directly with `@/convex/adminCrypto` since `next/headers`
 * is unavailable there).
 * The session secret MUST be identical in Vercel (`ADMIN_SESSION_SECRET`)
 * and Convex (`bunx convex env set ADMIN_SESSION_SECRET …`) — both sides
 * verify the same HMAC.
 */

export const SESSION_COOKIE = "admin_session";

export function sessionSecret(): string {
  return resolveSessionSecret(process.env.ADMIN_SESSION_SECRET);
}

export function mintSession(email: string): {
  token: string;
  expiresAtMs: number;
} {
  const expiresAtMs = Date.now() + SESSION_TTL_MS;
  return { token: signSession(email, expiresAtMs, sessionSecret()), expiresAtMs };
}

export async function setSessionCookie(
  token: string,
  expiresAtMs: number,
): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: false, // client JS threads it as `adminSecret` for Convex calls
    sameSite: "lax",
    secure: process.env.VERCEL_ENV === "production",
    path: "/",
    expires: new Date(expiresAtMs),
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, "", {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
