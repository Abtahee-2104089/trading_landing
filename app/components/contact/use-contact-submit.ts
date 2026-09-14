"use client";

import { useCallback, useState } from "react";

export type ContactPayload = {
  name: string;
  email: string;
  company?: string;
  category: string;
  message: string;
};

export type ContactStatus = "idle" | "submitting" | "success" | "error";

/**
 * Backend hook for the contact form.
 *
 * UI-only for now: validates shape and simulates a request so the form can be
 * built and styled independently. Swap the body of `submit` with a Convex
 * mutation / action call (e.g. `api.contact.submit`) when the backend lands.
 */
export function useContactSubmit() {
  const [status, setStatus] = useState<ContactStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (payload: ContactPayload) => {
    setStatus("submitting");
    setError(null);
    try {
      // TODO: replace with backend call, e.g.
      // await convex.mutation(api.contact.submit, payload);
      void payload;
      await new Promise((resolve) => setTimeout(resolve, 600));
      setStatus("success");
      return true;
    } catch {
      setStatus("error");
      setError("Something went wrong. Please try again.");
      return false;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
  }, []);

  return { status, error, submit, reset };
}
