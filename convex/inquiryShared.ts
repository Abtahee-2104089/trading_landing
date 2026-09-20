import { z } from "zod";

// ---------------------------------------------------------------------------
// Frozen contract v2 — single zod source of truth for trade inquiries.
//
// This file intentionally imports ONLY `zod` (no convex/server, no Next
// APIs) so it can be consumed from BOTH runtimes:
//   - Convex backend: `convex/inquiries.ts` imports `./inquiryShared`
//     (Convex deploy can only bundle files inside `convex/`).
//   - Next.js frontend: `lib/schemas/inquiry.ts` re-exports this module.
//
// KEEP IN SYNC RULE: edit the schema HERE, never by copying it elsewhere.
// `lib/types/inquiry.ts` and `lib/utils/validation.ts` hand-rolled copies
// are deleted — import from `lib/schemas/inquiry.ts` instead (P1-1).
// ---------------------------------------------------------------------------

export const INQUIRY_CATEGORIES = [
  "General enquiry",
  "Electronics & Electrical",
  "Foodstuff & Agro Commodities",
  "Textiles & Garments",
  "Building Materials & Hardware",
  "Cosmetics & Personal Care",
  "Auto Parts & Industrial",
] as const;

export type InquiryCategory = (typeof INQUIRY_CATEGORIES)[number];

const PHONE_RE = /^[+()\-. \d]{6,40}$/;

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Please provide your full name.").max(100),
  company: z.string().trim().max(120).optional().default(""),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Please provide a valid email address.")
    .max(254),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .default("")
    .refine((v) => !v || PHONE_RE.test(v), "Please provide a valid phone number."),
  // P1-1: strict enum — any other string (e.g. "hacked") is rejected.
  category: z.enum(INQUIRY_CATEGORIES, {
    error: "Please choose a valid category.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your requirement (min 10 characters).")
    .max(5000),
  // P0-1 honeypot: real users leave this empty; bots fill it.
  // Must stay empty — enforced server-side in `convex/inquiries.ts`.
  website: z.string().max(0, "Invalid submission.").optional(),
});

// Replaces `lib/types/inquiry.ts` InquiryInput.
export type InquiryInput = z.infer<typeof inquirySchema>;

/** Slug used for `#contact?category=<slug>` preselect links (Pal, P1-2). */
export function categorySlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Match a slug (or raw label) back to its canonical category, if any. */
export function matchCategorySlug(slug: string): InquiryCategory | null {
  const normalized = slug.trim().toLowerCase();
  for (const category of INQUIRY_CATEGORIES) {
    if (
      category === slug.trim() ||
      categorySlug(category) === normalized
    ) {
      return category;
    }
  }
  return null;
}
