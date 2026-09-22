import type { NextRequest } from "next/server";
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// UploadThing API endpoint — handles browser uploads + callbacks.
//
// Guard: without UPLOADTHING_TOKEN every request would fail deep inside
// UploadThing with an opaque client-side `FetchError`. Return the real
// reason as JSON instead so the admin UI can show it.
const handlers = createRouteHandler({
  router: ourFileRouter,
});

function requireToken(): Response | null {
  const token = (process.env.UPLOADTHING_TOKEN ?? "").trim();
  if (token === "") {
    return Response.json(
      {
        error:
          "UPLOADTHING_TOKEN is not set. Copy it from the UploadThing dashboard (app → API keys) into .env.local and restart the dev server.",
      },
      { status: 500 },
    );
  }
  // A v7 token is a base64 JSON blob { apiKey, appId, regions }. The most
  // common mistake is pasting the Secret key (sk_live_…) or the App ID
  // instead — catch that here with a plain message, never echoing the value.
  let shapeOk = false;
  try {
    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8"),
    ) as { apiKey?: unknown; appId?: unknown };
    shapeOk =
      typeof decoded.apiKey === "string" &&
      typeof decoded.appId === "string";
  } catch {
    shapeOk = false;
  }
  if (!shapeOk) {
    const hint = token.startsWith("sk_live_")
      ? "This looks like the Secret key (sk_live_…) — copy the Token field instead (it starts with eyJ). "
      : "It should be the Token field (a long value starting with eyJ), not the App ID or Secret key. ";
    return Response.json(
      {
        error: `UPLOADTHING_TOKEN has the wrong format. ${hint}Paste it into .env.local with no quotes or spaces, then restart the dev server.`,
      },
      { status: 500 },
    );
  }
  return null;
}

export async function GET(request: NextRequest): Promise<Response> {
  return requireToken() ?? handlers.GET(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return requireToken() ?? handlers.POST(request);
}
