import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const inquiryStatus = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("qualified"),
  v.literal("closed"),
);

export const emailStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
);

export const outboxKind = v.union(
  v.literal("team_notify"),
  v.literal("sender_ack"),
);

export const outboxStatus = v.union(
  v.literal("pending"),
  v.literal("sent"),
  v.literal("failed"),
  v.literal("skipped"),
);

export default defineSchema({
  // Customer trade inquiries submitted from the landing page.
  // Written by the public `inquiries.submit` mutation; read only by
  // internal queries for team review (never exposed in bulk to clients).
  inquiries: defineTable({
    name: v.string(),
    company: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    category: v.string(),
    message: v.string(),
    status: inquiryStatus,
    emailStatus: emailStatus,
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_email", ["email"])
    .index("by_emailStatus", ["emailStatus"]),

  // Outbox / delivery log for SMTP sends. One row per attempted email
  // (team notification + sender auto-acknowledgement). Failure details go
  // here — never any SMTP credentials.
  mailOutbox: defineTable({
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
  })
    .index("by_inquiryId", ["inquiryId"])
    .index("by_status", ["status"])
    .index("by_kind_and_status", ["kind", "status"]),
});
