"use client";

/**
 * @deprecated Pal-era mock hook. Use `useSubmitInquiry()` from
 * `@/lib/hooks/useSubmitInquiry` (Kabir-owned, wired to
 * `inquiries.submit`). Kept as a thin re-export so existing imports
 * don't break during the handoff.
 */
export { useSubmitInquiry as useContactSubmit } from "@/lib/hooks/useSubmitInquiry";
export type { SubmitStatus as ContactStatus } from "@/lib/hooks/useSubmitInquiry";
export type { InquiryInput as ContactPayload } from "@/lib/types/inquiry";
