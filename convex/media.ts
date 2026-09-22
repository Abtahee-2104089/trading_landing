import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { mediaValidator } from "./schema";
import { adminSecretArgs, requireAdmin } from "./adminAuth";

// ---------------------------------------------------------------------------
// Media library: UploadThing (utfs.io) files + `media` rows.
//
// Flow (used by every admin image picker + `/admin/media`):
//   1. Upload in the browser via the UploadThing FileRouter
//      (`app/api/uploadthing`) — images only, ≤5 MB.
//   2. `save({url, alt, usedBy, key?})` records the public URL + alt text.
//
// Every image field elsewhere (site hero/about, section image, product
// image) stores the public URL. Legacy Convex Storage rows keep resolving
// through `storageId` in `cms.*` resolvers.
// ---------------------------------------------------------------------------

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

const mediaAdminValidator = mediaValidator.extend({
  _id: v.id("media"),
  _creationTime: v.number(),
});

function cleanUrl(raw: string): string {
  const url = raw.trim();
  if (url.length < 1) fail("Image URL is required.");
  if (url.length > 2000) fail("Image URL is too long (max 2000 characters).");
  if (!/^https:\/\//.test(url)) {
    fail("Image URL must be an https:// URL.");
  }
  return url;
}

export const save = mutation({
  args: {
    url: v.string(),
    alt: v.string(),
    usedBy: v.string(),
    key: v.optional(v.string()),
    ...adminSecretArgs,
  },
  returns: v.object({ id: v.id("media"), url: v.string() }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);

    const url = cleanUrl(args.url);
    const alt = args.alt.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
    if (alt.length < 1) fail("Alt text is required.");
    if (alt.length > 200) fail("Alt text is too long (max 200 characters).");
    const usedBy = args.usedBy.replace(/\s+/g, " ").trim().slice(0, 200);
    if (usedBy.length < 1) fail("usedBy is required (e.g. products/<slug>).");
    const key = (args.key ?? "").trim().slice(0, 300);

    const id = await ctx.db.insert("media", {
      url,
      alt,
      usedBy,
      ...(key !== "" ? { key } : {}),
      createdAt: Date.now(),
    });
    return { id, url };
  },
});

export const remove = mutation({
  args: { id: v.id("media"), ...adminSecretArgs },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    const existing = await ctx.db.get("media", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Media not found." });
    }
    // Deletes the library row. The file itself stays on UploadThing (delete
    // it from the UploadThing dashboard if needed) — the URL simply stops
    // being referenced once no entity uses it.
    await ctx.db.delete("media", args.id);
    return null;
  },
});

export const list = query({
  args: { ...adminSecretArgs },
  returns: v.array(mediaAdminValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    return await ctx.db.query("media").order("desc").take(100);
  },
});
