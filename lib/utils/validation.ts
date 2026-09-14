import type { InquiryInput } from "@/lib/types/inquiry";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\-. \d]{6,40}$/;

export type InquiryValidationError = {
  field: keyof InquiryInput;
  message: string;
};

/**
 * Client-side mirror of the server rules in convex/inquiries.ts.
 * Server remains authoritative — this only gives fast inline feedback.
 */
export function validateInquiry(input: InquiryInput): InquiryValidationError[] {
  const errors: InquiryValidationError[] = [];

  if (input.name.trim().replace(/\s+/g, " ").length < 2) {
    errors.push({ field: "name", message: "Please provide your full name." });
  }
  if (!EMAIL_RE.test(input.email.trim().toLowerCase())) {
    errors.push({
      field: "email",
      message: "Please provide a valid email address.",
    });
  }
  if (input.message.trim().length < 10) {
    errors.push({
      field: "message",
      message: "Please describe your requirement (min 10 characters).",
    });
  }
  if (input.phone.trim() && !PHONE_RE.test(input.phone.trim())) {
    errors.push({
      field: "phone",
      message: "Please provide a valid phone number.",
    });
  }
  if (!input.category.trim()) {
    errors.push({ field: "category", message: "Please choose a category." });
  }

  return errors;
}
