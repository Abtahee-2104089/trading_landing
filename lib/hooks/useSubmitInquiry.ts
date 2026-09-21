"use client";

import { useCallback, useState } from "react";
import { useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { inquirySchema } from "@/lib/schemas/inquiry";
import type { InquiryInput } from "@/lib/schemas/inquiry";

export type SubmitStatus = "idle" | "submitting" | "success" | "error";

/** Payload accepted by the form hook (includes the hidden honeypot). */
export type SubmitPayload = InquiryInput & { website?: string };

/**
 * Single backend entry-point for the inquiry form (frozen API).
 *
 * Wraps `inquiries.submit({name, company, email, phone, category,
 * message, website?}) -> {id?}`. Presentational components must call ONLY
 * this hook — never import Convex functions directly.
 *
 * Hardening (P0-1 + P2 nits):
 * - Client validates with the shared zod `inquirySchema` (server stays
 *   authoritative).
 * - Honeypot `website` is forwarded (bots fill it → server silently
 *   succeeds without insert/mail).
 * - Server errors are mapped to static user-safe strings — raw
 *   `err.message` is NEVER shown (no internal paths leak).
 */
export function useSubmitInquiry() {
  const submitMutation = useMutation(api.inquiries.submit);
  const [status, setStatus] = useState<SubmitStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [inquiryId, setInquiryId] = useState<string | null>(null);

  const submit = useCallback(
    async (input: SubmitPayload): Promise<boolean> => {
      setStatus("submitting");
      setError(null);
      setInquiryId(null);

      const parsed = inquirySchema.safeParse({
        name: input.name ?? "",
        company: input.company ?? "",
        email: input.email ?? "",
        phone: input.phone ?? "",
        category: input.category ?? "",
        message: input.message ?? "",
        website: input.website ?? "",
      });
      if (!parsed.success) {
        setStatus("error");
        setError(parsed.error.issues[0]?.message ?? "Invalid submission.");
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
          company: parsed.data.company,
          email: parsed.data.email,
          phone: parsed.data.phone,
          category: parsed.data.category,
          message: parsed.data.message,
          ...(parsed.data.website
            ? { website: parsed.data.website }
            : {}),
        });
        // `id` is absent on honeypot (bot) submissions — success without a row.
        setInquiryId(result.id ?? null);
        setStatus("success");
        return true;
      } catch (err) {
        setStatus("error");
        setError(toSafeError(err));
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

/**
 * Map any thrown value to a static user-safe string.
 * Known Convex codes get friendly copy; everything else is generic —
 * internal paths / SMTP details never reach the UI.
 */
export function toSafeError(err: unknown): string {
  if (err instanceof ConvexError) {
    const data = err.data as { code?: unknown; message?: unknown } | undefined;
    const code = typeof data?.code === "string" ? data.code : "";
    if (code === "RATE_LIMITED" || /too many/i.test(String(data?.message ?? ""))) {
      return "Too many requests — please try again in a minute.";
    }
    if (code === "VALIDATION_ERROR" && typeof data?.message === "string" && data.message.length > 0 && data.message.length <= 300) {
      // Server zod messages are static safe strings (no paths, no input).
      return data.message.slice(0, 300);
    }
    return "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
}

export type { InquiryInput };
