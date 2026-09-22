import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { resolveSessionSecret, verifySession } from "@/convex/adminCrypto";

// ---------------------------------------------------------------------------
// UploadThing FileRouter — the single image-upload entry point for the CMS.
//
// Auth: only signed-in staff (`admin_session` cookie, same credential as
// the Convex admin API). Limits: images only, ≤5 MB client-enforced with an
// 8 MB server hard cap, max 4 files per request.
// Requires `UPLOADTHING_TOKEN` (UploadThing dashboard → API keys).
// ---------------------------------------------------------------------------

const f = createUploadthing();

function assertStaff(req: Request): { email: string } {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const raw = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("admin_session="))
    ?.slice("admin_session=".length);
  const session = raw
    ? verifySession(
        decodeURIComponent(raw),
        resolveSessionSecret(process.env.ADMIN_SESSION_SECRET),
      )
    : null;
  if (!session) throw new UploadThingError("Unauthorized");
  return { email: session.email };
}

export const ourFileRouter = {
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 4 },
  })
    .middleware(async ({ req }) => assertStaff(req))
    .onUploadComplete(async ({ metadata, file }) => ({
      uploadedBy: metadata.email,
      key: file.key,
      url: file.ufsUrl,
    })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
