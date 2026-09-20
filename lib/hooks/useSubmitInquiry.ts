"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import {
  inquirySchema,
  type InquiryInput,
} from "@/lib/schemas/inquiry";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

const GENERIC_ERROR = "Something went wrong. Please try again.";
const RATE_LIMIT_ERROR = "Too many requests. Please try again in a minute.";

/** Map backend/transport errors to user-safe messages (never raw paths). */
function toUserMessage(err: unknown): string {
  if (err instanceof ConvexError) {
    const data = err.data as { code?: unknown; message?: unknown } | undefined;
    if (data?.code === "RATE_LIMITED") return RATE_LIMIT_ERROR;
    if (typeof data?.message === "string" && data.message.length > 0) {
      // Server fail() messages are user-safe by contract; still cap length.
      return data.message.slice(0, 300);
    }
    return GENERIC_ERROR;
  }
  if (err instanceof Error) {
    // Network errors etc. — never surface raw message (may leak internals).
    if (/network|fetch|failed|offline/i.test(err.message)) return GENERIC_ERROR;
    return GENERIC_ERROR;
  }
  return GENERIC_ERROR;
}

/**
 * Single backend entry-point for the inquiry form.
 *
 * Wraps `inquiries.submit({name, company, email, phone, category,
 * message, website?}) -> {id}`. Presentational components must call ONLY
 * this hook — never import Convex functions directly.
 * Client validation mirrors the server via `inquirySchema` (single source).
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

      const parsed = inquirySchema.safeParse(input);
      if (!parsed.success) {
        setStatus("error");
        setError(parsed.error.issues[0]?.message ?? GENERIC_ERROR);
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
          name: parsed.data.name,
          company: parsed.data.company ?? "",
          email: parsed.data.email,
          phone: parsed.data.phone ?? "",
          category: parsed.data.category,
          message: parsed.data.message,
          ...(parsed.data.website ? { website: parsed.data.website } : {}),
        });
        setInquiryId(result.id);
        setStatus("success");
        return true;
      } catch (err) {
        setStatus("error");
        setError(toUserMessage(err));
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
