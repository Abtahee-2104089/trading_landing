export { default } from "./Contact";
export { useSubmitInquiry as useContactSubmit } from "@/lib/hooks/useSubmitInquiry";
export type { SubmitStatus as ContactStatus } from "@/lib/hooks/useSubmitInquiry";
export type { InquiryInput as ContactPayload } from "@/lib/schemas/inquiry";
