import { ConvexError, v } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import { mutation, query } from "./_generated/server";
import { inquiryDocValidator, inquiryStatusValidator } from "./inquiries";
import { requireAdmin, adminSecretArgs } from "./adminAuth";

// ---------------------------------------------------------------------------
// Admin-only inquiry wrappers for `/admin/inquiries` (Pal).
//
// The internal `listInternal`/`setStatus` stay internal (scheduler/ops use);
// these STAFF wrappers add the `requireAdmin` gate (stubbed fail-closed
// until Kabir wires Convex Auth). Read-only table + status changer; PII
// (emails) is visible ONLY here, never in URLs.
// ---------------------------------------------------------------------------

export const list = query({
  args: {
    status: v.optional(inquiryStatusValidator),
    paginationOpts: paginationOptsValidator,
    ...adminSecretArgs,
  },
  returns: paginationResultValidator(inquiryDocValidator),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
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
  args: { id: v.id("inquiries"), ...adminSecretArgs },
  returns: v.union(inquiryDocValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
    return await ctx.db.get("inquiries", args.id);
  },
});

export const setStatus = mutation({
  args: {
    id: v.id("inquiries"),
    status: inquiryStatusValidator,
    ...adminSecretArgs,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.adminSecret);
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
