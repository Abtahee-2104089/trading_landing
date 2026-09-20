import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { inquiryStatus } from "./schema";

/**
 * Admin inquiry triage (Pal /admin/inquiries UI).
 * TODO(auth): Kabir gates list/get/setStatus with requireAdmin.
 * Reads stay paginated desc; status writes validate the enum.
 */

export const list = query({
  args: {
    status: v.optional(inquiryStatus),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    if (args.status !== undefined) {
      return await ctx.db
        .query("inquiries")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("inquiries")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const get = query({
  args: { id: v.id("inquiries") },
  handler: async (ctx, args) => {
    return await ctx.db.get("inquiries", args.id);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: inquiryStatus,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("inquiries", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Inquiry not found." });
    }
    await ctx.db.patch("inquiries", args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return null;
  },
});
