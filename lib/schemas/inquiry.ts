// Single zod source of truth — re-exported from the Convex-safe module so
// backend (`convex/inquiries.ts`) and frontend share one schema (P1-1).
// Edit `convex/inquiryShared.ts`, never this file.
export {
  INQUIRY_CATEGORIES,
  categorySlug,
  inquirySchema,
  matchCategorySlug,
} from "@/convex/inquiryShared";
export type { InquiryCategory, InquiryInput } from "@/convex/inquiryShared";
