import { ConvexError, v } from "convex/values";
import { paginationOptsValidator, paginationResultValidator } from "convex/server";
import {
  internalMutation,
  internalQuery,
  mutation,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { emailStatus, inquiryStatus, outboxKind, outboxStatus } from "./schema";
import { inquirySchema } from "./inquiryShared";
import {
  SUBMIT_HOUR_LIMIT,
  SUBMIT_HOUR_MS,
  SUBMIT_MINUTE_LIMIT,
  SUBMIT_MINUTE_MS,
  checkRateLimit,
  incrementRateLimit,
  submitRateKeys,
} from "./rateLimit";

// ---------------------------------------------------------------------------
// Shared validators
// ---------------------------------------------------------------------------

export const inquiryStatusValidator = inquiryStatus;
export const emailStatusValidator = emailStatus;

export const inquiryDocValidator = v.object({
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
  teamNotified: v.optional(v.boolean()),
  senderAcked: v.optional(v.boolean()),
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
// inquiries.submit({ name, company?, email, phone?, category, message, website? })
//   -> { id? }
// `id` is present for real submissions. Honeypot (bot) submissions get a
// silent success WITHOUT an insert, so no `id` is returned — the frontend
// must treat "no error" as success and never branch on `id` being set.
export const submitArgs = {
  name: v.string(),
  company: v.optional(v.string()),
  email: v.string(),
  phone: v.optional(v.string()),
  category: v.string(),
  message: v.string(),
  website: v.optional(v.string()),
};

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

/** Collapse inner whitespace (names/companies must be single-line). */
function singleLine(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------------------
// Public: submit a new trade inquiry
//
// Hardened (P0-1 + P1-1):
// - Honeypot (`website`): non-empty → silent fake success, no insert/mail.
// - Throttle: max 5/min and 20/hour per normalized email (RATE_LIMITED).
// - Strict validation via the shared zod `inquirySchema` (category enum,
//   lengths, formats). Over-length input throws VALIDATION_ERROR — never
//   silently truncated.
// - All user-facing errors are static safe strings (no paths, no input).
// ---------------------------------------------------------------------------

export const submit = mutation({
  args: submitArgs,
  returns: v.object({ id: v.optional(v.id("inquiries")) }),
  handler: async (ctx, args) => {
    // 1. Honeypot first (before throttle): bots always see success and get
    //    no signal they were detected. No insert, no mail, no quota burn.
    if (args.website !== undefined && args.website.trim() !== "") {
      return {};
    }

    // 2. Throttle on normalized email before doing any writes.
    const emailKey = (args.email ?? "").trim().toLowerCase();
    const { minuteKey, hourKey } = submitRateKeys(emailKey);
    await checkRateLimit(ctx, {
      key: minuteKey,
      limit: SUBMIT_MINUTE_LIMIT,
      windowMs: SUBMIT_MINUTE_MS,
    });
    await checkRateLimit(ctx, {
      key: hourKey,
      limit: SUBMIT_HOUR_LIMIT,
      windowMs: SUBMIT_HOUR_MS,
    });

    // 3. Single source of truth: zod parses + enforces everything.
    const parsed = inquirySchema.safeParse({
      name: args.name ?? "",
      company: args.company ?? "",
      email: args.email ?? "",
      phone: args.phone ?? "",
      category: args.category ?? "",
      message: args.message ?? "",
      website: args.website ?? "",
    });
    if (!parsed.success) {
      // First issue message only — static safe strings from the schema
      // (field names like "email" are fine; never internal paths/input).
      fail(parsed.error.issues[0]?.message ?? "Invalid submission.");
    }
    const input = parsed.data;

    const name = singleLine(input.name);
    const company = singleLine(input.company);
    const email = input.email; // already trimmed + lowercased by zod
    const phone = input.phone.trim();
    const message = input.message.trim(); // keep newlines, cap enforced by zod

    const now = Date.now();
    const id = await ctx.db.insert("inquiries", {
      name,
      company,
      email,
      ...(phone ? { phone } : {}),
      category: input.category,
      message,
      status: "new",
      emailStatus: "pending",
      teamNotified: false,
      senderAcked: false,
      createdAt: now,
    });

    // Successful writes burn quota (failed/blocked attempts do not).
    await incrementRateLimit(ctx, { key: minuteKey, windowMs: SUBMIT_MINUTE_MS });
    await incrementRateLimit(ctx, { key: hourKey, windowMs: SUBMIT_HOUR_MS });

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
    teamNotified: v.optional(v.boolean()),
    senderAcked: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch("inquiries", args.id, {
      emailStatus: args.emailStatus,
      ...(args.teamNotified !== undefined ? { teamNotified: args.teamNotified } : {}),
      ...(args.senderAcked !== undefined ? { senderAcked: args.senderAcked } : {}),
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
