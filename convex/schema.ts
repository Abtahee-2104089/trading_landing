import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ---------------------------------------------------------------------------
// Existing review workflow (unchanged names — do not break `inquiries.*`).
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// CMS content validators (shared by `convex/cms.ts`, `convex/media.ts`,
// `convex/seed.ts` — single definition, no duplication).
// ---------------------------------------------------------------------------

export const SECTION_KEYS = [
  "hero",
  "about",
  "network",
  "trust",
  "contact",
  "footer",
] as const;

export const contactValidator = v.object({
  office: v.string(),
  email: v.string(),
  phoneDisplay: v.string(),
  phoneHref: v.string(),
  whatsappHref: v.optional(v.string()),
  hours: v.optional(v.string()),
  responseNote: v.optional(v.string()),
});

export const heroAssuranceValidator = v.object({
  title: v.string(),
  text: v.string(),
});

export const heroValidator = v.object({
  badge: v.string(),
  headline: v.string(),
  sub: v.string(),
  assurances: v.array(heroAssuranceValidator),
  ctaPrimaryLabel: v.optional(v.string()),
  ctaPrimaryHref: v.optional(v.string()),
  ctaSecondaryLabel: v.optional(v.string()),
  ctaSecondaryHref: v.optional(v.string()),
});

export const footerValidator = v.object({
  about: v.string(),
  bottomBar: v.string(),
});

export const navItemValidator = v.object({
  href: v.string(),
  label: v.string(),
});

export const siteSettingsValidator = v.object({
  siteName: v.string(),
  tagline: v.string(),
  description: v.string(),
  primaryCta: v.string(),
  hero: heroValidator,
  footer: footerValidator,
  contact: contactValidator,
  nav: v.array(navItemValidator),
  // Legacy Convex Storage image refs (kept as fallback for old rows).
  heroImageStorageId: v.optional(v.id("_storage")),
  aboutImageStorageId: v.optional(v.id("_storage")),
  // Primary image source: UploadThing (utfs.io) URLs, set at /admin/site.
  // Empty string = cleared (resolver treats "" as absent).
  heroImageUrl: v.optional(v.string()),
  aboutImageUrl: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
});

export const sectionItemValidator = v.object({
  title: v.string(),
  // `meta` disambiguates rendering: network step number ("01"),
  // hub/transit label, or "stat" for trust stat cards.
  meta: v.optional(v.string()),
  text: v.string(),
});

export const sectionValidator = v.object({
  key: v.string(),
  eyebrow: v.string(),
  headline: v.string(),
  body: v.string(),
  items: v.optional(v.array(sectionItemValidator)),
  imageStorageId: v.optional(v.id("_storage")),
  // Primary image source: UploadThing URL ("" = cleared). Sections are
  // fixed slots (hero|about|network|trust|contact|footer) — every slot's
  // text AND image is editable, new entries are products/services/media.
  imageUrl: v.optional(v.string()),
  updatedAt: v.optional(v.number()),
});

export const productValidator = v.object({
  title: v.string(),
  slug: v.string(),
  description: v.string(),
  items: v.array(v.string()),
  imageStorageId: v.optional(v.id("_storage")),
  imageUrlFallback: v.optional(v.string()),
  alt: v.string(),
  sortOrder: v.number(),
  isPublished: v.boolean(),
  updatedAt: v.optional(v.number()),
});

export const serviceValidator = v.object({
  title: v.string(),
  description: v.string(),
  icon: v.optional(v.string()),
  // e.g. hub transit label "2–4 day GCC transit".
  meta: v.optional(v.string()),
  sortOrder: v.number(),
  isPublished: v.boolean(),
  updatedAt: v.optional(v.number()),
});

export const mediaValidator = v.object({
  // Legacy Convex Storage ref (optional since the UploadThing migration —
  // old rows keep resolving through it).
  storageId: v.optional(v.id("_storage")),
  // UploadThing file key (for dashboard lookup / future API deletes).
  key: v.optional(v.string()),
  url: v.string(),
  alt: v.string(),
  usedBy: v.string(),
  createdAt: v.number(),
});

export const rateLimitValidator = v.object({
  key: v.string(),
  count: v.number(),
  windowStart: v.number(),
});

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
    // P2 nit fix: per-mail delivery flags so a partial success (team
    // notified, sender ack failed) is not misread as a lost lead.
    teamNotified: v.optional(v.boolean()),
    senderAcked: v.optional(v.boolean()),
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

  // Single-doc CMS table: exactly one `siteSettings` row (enforced by
  // seed + `cms.updateSiteSettings`). Holds site text + contact block.
  siteSettings: defineTable(siteSettingsValidator),

  // CMS sections keyed hero|about|network|trust|contact|footer.
  sections: defineTable(sectionValidator).index("by_key", ["key"]),

  // Trading categories (products). Public reads only published, sorted.
  products: defineTable(productValidator)
    .index("by_slug", ["slug"])
    .index("by_sortOrder", ["sortOrder"]),

  // Global Network journey + capabilities.
  services: defineTable(serviceValidator).index("by_sortOrder", ["sortOrder"]),

  // Media library: every CMS image is an UploadThing (utfs.io) file + this
  // row. Image fields elsewhere store the public URL; this table is the
  // browsable library with alt text + usage tracking.
  media: defineTable(mediaValidator).index("by_storageId", ["storageId"]),

  // CMS staff accounts (email + stretched password hash). The FIRST account
  // is created at `/admin/setup` (allowed only while the table is empty);
  // further changes happen at `/admin/account`. Never store plaintext.
  adminUsers: defineTable({
    email: v.string(),
    salt: v.string(),
    hash: v.string(),
    iterations: v.number(),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_email", ["email"]),

  // P0-1 throttle windows for `inquiries.submit`.
  // key = `submit:email:<normalized>:minute | :hour` (IP key reserved —
  // mutations receive no client IP; added when an HTTP/action layer exists).
  rateLimits: defineTable(rateLimitValidator).index("by_key", ["key"]),
});
