/**
 * Shared inquiry contract — Kabir-owned, frozen before form UI.
 *
 * Orny and Pal build presentational components only. The contact form
 * calls the backend exclusively through `useSubmitInquiry()` with this
 * shape, which maps 1:1 onto `inquiries.submit()` in convex/inquiries.ts.
 */

/** Fields collected by the #contact inquiry form. */
export type InquiryInput = {
  name: string;
  company: string;
  email: string;
  phone: string;
  category: string;
  message: string;
};

/** Trading categories offered in the form <select>. Keep in sync with
 *  TradingCategories cards + convex validation. */
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

/** Inquiry lifecycle — mirrors convex/schema.ts `inquiryStatus`. */
export type InquiryStatus = "new" | "contacted" | "qualified" | "closed";

/** Mail delivery state — mirrors convex/schema.ts `emailStatus`. */
export type EmailStatus = "pending" | "sent" | "failed";

/** Result of `inquiries.submit(...)`. */
export type InquirySubmitResult = { id: string };

export const EMPTY_INQUIRY: InquiryInput = {
  name: "",
  company: "",
  email: "",
  phone: "",
  category: INQUIRY_CATEGORIES[0],
  message: "",
};
