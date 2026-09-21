/**
 * Shared inquiry contract — single zod source of truth (P1-1).
 *
 * The schema lives in `convex/inquiryShared.ts` (Convex-safe, zod-only)
 * and is re-exported for the frontend via `lib/schemas/inquiry.ts`.
 * This module re-exports it so legacy imports keep working — do NOT
 * duplicate the categories or the input shape here.
 */

export {
  INQUIRY_CATEGORIES,
  categorySlug,
  inquirySchema,
  matchCategorySlug,
} from "@/lib/schemas/inquiry";
export type {
  InquiryCategory,
  InquiryInput,
} from "@/lib/schemas/inquiry";

/** Inquiry lifecycle — mirrors convex/schema.ts `inquiryStatus`. */
export type InquiryStatus = "new" | "contacted" | "qualified" | "closed";

/** Mail delivery state — mirrors convex/schema.ts `emailStatus`. */
export type EmailStatus = "pending" | "sent" | "failed";

/** Result of `inquiries.submit(...)`. `id` is absent on honeypot (bot) submissions. */
export type InquirySubmitResult = { id?: string };

/** Empty form defaults (category = first enum value). */
import { INQUIRY_CATEGORIES as _CATS } from "@/lib/schemas/inquiry";
import type { InquiryInput as _Input } from "@/lib/schemas/inquiry";
export const EMPTY_INQUIRY: _Input & { website?: string } = {
  name: "",
  company: "",
  email: "",
  phone: "",
  category: _CATS[0],
  message: "",
  website: "",
};
