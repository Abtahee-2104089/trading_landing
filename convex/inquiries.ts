import { ConvexError, v } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import {
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { emailStatus, inquiryStatus, outboxKind, outboxStatus } from "./schema";

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

export const inquiryStatusValidator = inquiryStatus;
export const emailStatusValidator = emailStatus;

const inquiryDocValidator = v.object({
  _id: v.id("inquiries"),
  _creationTime: v.number(),
  name: v.string(),
  company: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  category: v.string(),
  message: v.string(),
  status: inquiryStatusValidator,
  emailStatus: emailStatusValidator,
  createdAt: v.number(),
  updatedAt: v.optional(v.number()),
});

const outboxDocValidator = v.object({
  _id: v.id("mailOutbox"),
  _creationTime: v.number(),
  inquiryId: v.optional(v.id("inquiries")),
  kind: outboxKind,
  to: v.string(),
  from: v.string(),
  subject: v.string(),
  status: outboxStatus,
  attempts: v.number(),
  lastError: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

// Frozen frontend contract:
// inquiries.submit({ name, company, email, phone, category, message }) -> { id }
export const submitArgs = {
  name: v.string(),
  company: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  category: v.optional(v.string()),
  message: v.string(),
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

function clean(value: string, max: number): string {
  return value.trim().replace(/\s+/g, " ").slice(0, max);
}

// ---------------------------------------------------------------------------
// Public: submit a new trade inquiry
//
// - Validates + normalizes input (convex validators + server-side checks).
// - Stores status "new" / emailStatus "pending".
// - Schedules async SMTP delivery; mail failures never fail the submit —
//   they are recorded on the inquiry (emailStatus) + mailOutbox log.
// - Never reads or returns secrets.
// ---------------------------------------------------------------------------

export const submit = mutation({
  args: submitArgs,
  returns: v.object({ id: v.id("inquiries") }),
  handler: async (ctx, args) => {
    const name = clean(args.name ?? "", 100);
    const email = (args.email ?? "").trim().slice(0, 254).toLowerCase();
    const company = clean(args.company ?? "", 120);
    const phoneRaw = (args.phone ?? "").trim().slice(0, 40);
    const category = clean(args.category ?? "General enquiry", 120) || "General enquiry";
    // Keep newlines in the message but cap length.
    const message = (args.message ?? "").trim().slice(0, 5000);

    if (name.length < 2) fail("Please provide your full name.");
    if (!EMAIL_RE.test(email)) fail("Please provide a valid email address.");
    if (message.length < 10) fail("Please describe your requirement (min 10 characters).");
    if (phoneRaw && !/^[+()\-.\s\d]{6,40}$/.test(phoneRaw)) {
      fail("Please provide a valid phone number.");
    }

    const now = Date.now();
    const id = await ctx.db.insert("inquiries", {
      name,
      company,
      email,
      ...(phoneRaw ? { phone: phoneRaw } : {}),
      category,
      message,
      status: "new",
      emailStatus: "pending",
      createdAt: now,
    });

    // Fire-and-forget email delivery (team notify + sender ack).
    await ctx.scheduler.runAfter(0, internal.emails.sendInquiryEmails, {
      inquiryId: id,
    });

    return { id };
  },
});

// ---------------------------------------------------------------------------
// Internal review workflow (NOT public — keeps customer PII off the client)
// ---------------------------------------------------------------------------

export const listInternal = internalQuery({
  args: {
    status: v.optional(inquiryStatusValidator),
    paginationOpts: paginationOptsValidator,
  },
  returns: paginationResultValidator(inquiryDocValidator),
  handler: async (ctx, args) => {
    const status = args.status;
    if (status !== undefined) {
      return await ctx.db
        .query("inquiries")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .paginate(args.paginationOpts);
    }
    return await ctx.db
      .query("inquiries")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

export const getInternal = internalQuery({
  args: { id: v.id("inquiries") },
  returns: v.union(inquiryDocValidator, v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get("inquiries", args.id);
  },
});

export const setStatus = internalMutation({
  args: {
    id: v.id("inquiries"),
    status: inquiryStatusValidator,
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

// ---------------------------------------------------------------------------
// Internal helpers used by the email action (outbox log + delivery state)
// ---------------------------------------------------------------------------

export const recordEmailStatus = internalMutation({
  args: {
    id: v.id("inquiries"),
    emailStatus: emailStatusValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("inquiries", args.id, {
      emailStatus: args.emailStatus,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const createOutboxEntry = internalMutation({
  args: {
    inquiryId: v.optional(v.id("inquiries")),
    kind: outboxKind,
    to: v.string(),
    from: v.string(),
    subject: v.string(),
  },
  returns: v.object({ id: v.id("mailOutbox") }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const id = await ctx.db.insert("mailOutbox", {
      ...(args.inquiryId !== undefined ? { inquiryId: args.inquiryId } : {}),
      kind: args.kind,
      to: args.to,
      from: args.from,
      subject: args.subject,
      status: "pending",
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    });
    return { id };
  },
});

export const markOutbox = internalMutation({
  args: {
    id: v.id("mailOutbox"),
    status: outboxStatus,
    lastError: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const entry = await ctx.db.get("mailOutbox", args.id);
    if (!entry) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Outbox entry not found." });
    }
    await ctx.db.patch("mailOutbox", args.id, {
      status: args.status,
      attempts: entry.attempts + 1,
      ...(args.lastError !== undefined
        ? { lastError: args.lastError.slice(0, 1000) }
        : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const listOutboxForInquiry = internalQuery({
  args: { inquiryId: v.id("inquiries") },
  returns: v.array(outboxDocValidator),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mailOutbox")
      .withIndex("by_inquiryId", (q) => q.eq("inquiryId", args.inquiryId))
      .order("desc")
      .take(20);
  },
});
