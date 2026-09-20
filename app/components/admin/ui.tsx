"use client";

import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-semibold text-navy-950"
      >
        {label}{" "}
        {optional ? (
          <span className="font-normal text-slate-500">(optional)</span>
        ) : null}
      </label>
      {children}
    </div>
  );
}

export const fieldInputClasses =
  "w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-3 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function FormSaved({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p role="status" className="mt-3 text-sm font-medium text-teal-700">
      Saved.
    </p>
  );
}

/** User-safe Convex error message (never raw internals). */
export function toUserMessage(err: unknown): string {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    err.data &&
    typeof err.data === "object" &&
    "message" in err.data &&
    typeof (err.data as { message?: unknown }).message === "string"
  ) {
    return ((err.data as { message: string }).message ?? "Save failed.").slice(
      0,
      300,
    );
  }
  return "Something went wrong. Please try again.";
}
