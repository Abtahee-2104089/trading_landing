import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { mediaValidator } from "./schema";
import { requireAdmin } from "./adminAuth";

// ---------------------------------------------------------------------------
// Media library: Convex Storage files + `media` rows.
//
// Flow (used by every admin image picker + `/admin/media`):
//   1. `generateUploadUrl()` -> POST the file to that URL
//   2. `save({ storageId, alt, usedBy })` -> validates + returns public URL
//
// Caps: jpg/png/webp/svg, ≤5 MB. Every image field elsewhere stores the
// `storageId`; public reads resolve URLs via `cms.*` (never expose this
// module's admin list publicly).
// ---------------------------------------------------------------------------

const MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
] as const;

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

const mediaAdminValidator = mediaValidator.extend({
  _id: v.id("media"),
  _creationTime: v.number(),
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    storageId: v.id("_storage"),
    alt: v.string(),
    usedBy: v.string(),
  },
  returns: v.object({ id: v.id("media"), url: v.string() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const alt = args.alt.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (alt.length < 1) fail("Alt text is required.");
    if (alt.length > 200) fail("Alt text is too long (max 200 characters).");
    const usedBy = args.usedBy.replace(/\s+/g, " ").trim().slice(0, 200);
    if (usedBy.length < 1) fail("usedBy is required (e.g. products/<slug>).");

    // Enforce type/size caps from the stored file's real metadata.
    const meta = (await ctx.db.system.get("_storage", args.storageId)) as {
      contentType?: string;
      size: number;
    } | null;
    if (!meta) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Uploaded file not found." });
    }
    if (meta.contentType && !(ALLOWED_TYPES as readonly string[]).includes(meta.contentType)) {
      await ctx.storage.delete(args.storageId);
      fail(`Unsupported file type. Allowed: jpg, png, webp, svg.`);
    }
    if (meta.size > MAX_BYTES) {
      await ctx.storage.delete(args.storageId);
      fail("File is too large (max 5 MB).");
    }

    const url = await ctx.storage.getUrl(args.storageId);
    if (!url) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Uploaded file not found." });
    }
    const id = await ctx.db.insert("media", {
      storageId: args.storageId,
      url,
      alt,
      usedBy,
      createdAt: Date.now(),
    });
    return { id, url };
  },
});

export const remove = mutation({
  args: { id: v.id("media") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("media", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Media not found." });
    }
    await ctx.storage.delete(existing.storageId);
    await ctx.db.delete("media", args.id);
    return null;
  },
});

export const list = query({
  args: {},
  returns: v.array(mediaAdminValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("media").order("desc").take(100);
  },
});
