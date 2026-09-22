import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { mintSession, setSessionCookie } from "@/lib/admin-session";

/**
 * POST /api/admin-login { email, password } — staff sign-in.
 *
 * Verifies against the `adminUsers` table via `adminUsers.login`
 * (stretched hash + per-email throttle), then mints the `admin_session`
 * cookie that `middleware.ts` gates on and the admin UI threads as
 * `adminSecret` for Convex calls.
 */
export async function POST(request: Request) {
  const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").trim();
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Enquiry backend is not configured (NEXT_PUBLIC_CONVEX_URL)." },
      { status: 503 },
    );
  }
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
      token?: unknown;
    };
    email = typeof body.email === "string" ? body.email : "";
    password = typeof body.password === "string" ? body.password : "";
    // Back-compat: the old token form maps to the mock account in dev.
    if (!email && typeof body.token === "string" && body.token.trim() !== "") {
      email = "admin@example.com";
      password = body.token;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!email.trim() || !password) {
    return NextResponse.json(
      { error: "Email and password are required." },
      { status: 400 },
    );
  }
  try {
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.adminUsers.login, {
      email,
      password,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 },
      );
    }
    const { token, expiresAtMs } = mintSession(email.trim().toLowerCase());
    await setSessionCookie(token, expiresAtMs);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error && /too many/i.test(error.message)
        ? "Too many attempts — please try again in a minute."
        : "Sign-in failed. Check your connection.";
    return NextResponse.json({ error: message }, { status: 429 });
  }
}
