import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/admin-session";

/** POST /api/admin-logout — clears the `admin_session` cookie. */
export async function POST() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
