import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { mintSession, setSessionCookie } from "@/lib/admin-session";

/**
 * POST /api/admin-setup { email, password } — first-run account creation.
 *
 * Succeeds ONLY while no admin account exists (`setupFirstAdmin`
 * enforces this server-side). Mints a session on success so setup flows
 * straight into `/admin`.
 */
export async function POST(request: Request) {
  const convexUrl = (process.env.NEXT_PUBLIC_CONVEX_URL ?? "").trim();
  if (!convexUrl) {
    return NextResponse.json(
      { error: "Backend is not configured (NEXT_PUBLIC_CONVEX_URL)." },
      { status: 503 },
    );
  }
  let email = "";
  let password = "";
  try {
    const body = (await request.json()) as {
      email?: unknown;
      password?: unknown;
    };
    email = typeof body.email === "string" ? body.email : "";
    password = typeof body.password === "string" ? body.password : "";
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
    const result = await client.mutation(api.adminUsers.setupFirstAdmin, {
      email,
      password,
    });
    const { token, expiresAtMs } = mintSession(result.email);
    await setSessionCookie(token, expiresAtMs);
    return NextResponse.json({ ok: true, email: result.email });
  } catch (error) {
    const message =
      error instanceof Error ? error.message.slice(0, 300) : "Setup failed.";
    const status = /already exists|closed/i.test(message) ? 403 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
