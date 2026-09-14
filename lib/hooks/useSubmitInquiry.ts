"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type { InquiryInput } from "@/lib/types/inquiry";
import { validateInquiry } from "@/lib/utils/validation";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

/**
 * Single backend entry-point for the inquiry form (Kabir-owned, frozen API).
 *
 * Wraps Shawon's `inquiries.submit({name, company, email, phone, category,
 * message}) -> {id}`. Presentational components must call ONLY this hook —
 * never import Convex functions directly.
 */
export function useSubmitInquiry() {
  const submitMutation = useMutation(api.inquiries.submit);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const submit = useCallback(
    async (input: InquiryInput): Promise<boolean> => {
      setStatus("submitting");
      setError(null);
      setInquiryId(null);

      const clientErrors = validateInquiry(input);
      if (clientErrors.length > 0) {
        setStatus("error");
        setError(clientErrors[0].message);
        return false;
      }

      if (!isConvexConfigured()) {
        setStatus("error");
        setError(
          "Enquiry backend is not configured yet (NEXT_PUBLIC_CONVEX_URL). Your message was not sent — please email us directly.",
        );
        return false;
      }

      try {
        const result = await submitMutation({
          name: input.name.trim(),
          company: input.company.trim(),
          email: input.email.trim(),
          phone: input.phone.trim(),
          category: input.category.trim() || "General enquiry",
          message: input.message.trim(),
        });
        setInquiryId(result.id);
        setStatus("success");
        return true;
      } catch (err) {
        const message =
          err instanceof ConvexError &&
          typeof err.data === "object" &&
          err.data !== null
            ? String(
                (err.data as { message?: unknown }).message ??
                  "Submission failed.",
              )
            : err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.";
        setStatus("error");
        setError(message.slice(0, 300));
        return false;
      }
    },
    [submitMutation],
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setInquiryId(null);
  }, []);

  return { status, error, inquiryId, submit, reset };
}

export type { InquiryInput };
