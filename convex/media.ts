import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Media library (Pal admin uploader). Caps enforced client + server hint.
 * TODO(auth): Kabir gates generateUploadUrl/save/remove with requireAdmin.
 */

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const save = mutation({
  args: {
    storageId: v.string(),
    alt: v.string(),
    usedBy: v.optional(v.string()),
    contentType: v.optional(v.string()),
    size: v.optional(v.number()),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, args) => {
    const alt = args.alt.trim();
    if (alt.length < 2 || alt.length > 200) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Alt text must be 2-200 characters." });
    }
    if (args.contentType && !ALLOWED_TYPES.includes(args.contentType)) {
      throw new ConvexError({
        code: "VALIDATION_ERROR",
        message: "Only jpg, png, webp, or svg images are allowed.",
      });
    }
    if (args.size !== undefined && args.size > MAX_BYTES) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Image must be 5 MB or smaller." });
    }
    const url = await ctx.storage.getUrl(args.storageId as never);
    if (!url) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Uploaded file not found." });
    }
    await ctx.db.insert("media", {
      storageId: args.storageId,
      url,
      alt: alt.slice(0, 200),
      ...(args.usedBy ? { usedBy: args.usedBy.trim().slice(0, 200) } : {}),
      createdAt: Date.now(),
    });
    return { url };
  },
});

export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("media"),
      _creationTime: v.number(),
      storageId: v.string(),
      url: v.string(),
      alt: v.string(),
      usedBy: v.optional(v.string()),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("media").order("desc").take(100);
  },
});

export const remove = mutation({
  args: { id: v.id("media") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get("media", args.id);
    if (!doc) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Media not found." });
    }
    try {
      await ctx.storage.delete(doc.storageId as never);
    } catch {
      // Storage row may already be gone — still remove the registry row.
    }
    await ctx.db.delete("media", args.id);
    return null;
  },
});
