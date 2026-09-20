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
  // Honeypot marker rows (P0-1): bot submissions flagged closed/skipped,
  // never scheduled for delivery, invisible to the default triage view.
  v.literal("skipped"),
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
  // --- CMS tables (Pal frontend/admin reads; Kabir gates admin writes) ---

  // Single-doc site settings (site text, hero, footer, contact block).
  siteSettings: defineTable({
    siteName: v.string(),
    tagline: v.string(),
    description: v.string(),
    primaryCta: v.string(),
    heroBadge: v.optional(v.string()),
    heroHeadline: v.optional(v.string()),
    heroSub: v.optional(v.string()),
    heroImageUrl: v.optional(v.string()),
    heroImageAlt: v.optional(v.string()),
    footerAbout: v.optional(v.string()),
    footerBottomBar: v.optional(v.string()),
    contact: v.object({
      office: v.string(),
      email: v.string(),
      phoneDisplay: v.string(),
      phoneHref: v.string(),
      whatsappHref: v.optional(v.string()),
      hours: v.optional(v.string()),
      responseNote: v.optional(v.string()),
    }),
    nav: v.optional(
      v.array(v.object({ href: v.string(), label: v.string() })),
    ),
    updatedAt: v.optional(v.number()),
  }),

  // Keyed content sections: hero|about|network|trust|contact|footer.
  sections: defineTable({
    key: v.string(),
    eyebrow: v.optional(v.string()),
    headline: v.optional(v.string()),
    body: v.optional(v.string()),
    steps: v.optional(
      v.array(v.object({ title: v.string(), text: v.string() })),
    ),
    imageUrl: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
    updatedAt: v.optional(v.number()),
  }).index("by_key", ["key"]),

  // Trading categories (= products, 6 cards).
  products: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    items: v.array(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.string()),
    alt: v.optional(v.string()),
    sortOrder: v.number(),
    isPublished: v.boolean(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  // Global network capabilities (= services).
  services: defineTable({
    title: v.string(),
    slug: v.string(),
    description: v.string(),
    meta: v.optional(v.string()),
    sortOrder: v.number(),
    isPublished: v.boolean(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  // Uploaded media registry (Convex Storage ids + public urls).
  media: defineTable({
    storageId: v.string(),
    url: v.string(),
    alt: v.string(),
    usedBy: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_storageId", ["storageId"]),
});
