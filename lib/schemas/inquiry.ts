import { z } from "zod";

/**
 * Single zod source of truth for inquiries (frozen contract v2).
 * Client form, useSubmitInquiry, and convex/inquiries.ts must all validate
 * against this — no duplicated regexes or category lists.
 */
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
    .refine(
      (v) => !v || /^[+()\-. \d]{6,40}$/.test(v),
      "Please provide a valid phone number.",
    ),
  category: z.enum(INQUIRY_CATEGORIES, {
    error: "Please choose a valid category.",
  }),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your requirement (min 10 characters).")
    .max(5000),
  // Honeypot (P0-1): hidden input, must stay empty. Bots fill it.
  website: z.string().max(0).optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Slug used in `#contact?category=<slug>` links. */
export function categoryToSlug(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Match a slug (or raw label) back to a canonical category. */
export function slugToCategory(
  raw: string | null | undefined,
): InquiryCategory | null {
  if (!raw) return null;
  const slug = decodeURIComponent(raw).trim();
  if (!slug) return null;
  const direct = (INQUIRY_CATEGORIES as readonly string[]).find(
    (c) => c === slug,
  );
  if (direct) return direct as InquiryCategory;
  const lowered = slug.toLowerCase();
  const bySlug = (INQUIRY_CATEGORIES as readonly string[]).find(
    (c) => categoryToSlug(c) === lowered,
  );
  return (bySlug as InquiryCategory | undefined) ?? null;
}
