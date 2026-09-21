"use client";

import type { ReactNode } from "react";

export const fieldInput =
  "w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none disabled:opacity-60";

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1 block text-sm font-semibold text-navy-950"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
      {message}
    </p>
  );
}

export function FormOk({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="status" className="rounded-lg bg-teal-700/10 px-3 py-2 text-sm font-medium text-teal-800">
      {message}
    </p>
  );
}

export function PrimaryButton({
  children,
  disabled,
}: {
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-gold-500/20 text-navy-900",
    contacted: "bg-teal-700/10 text-teal-800",
    qualified: "bg-navy-900/10 text-navy-900",
    closed: "bg-slate-500/10 text-slate-600",
  };
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] ?? "bg-slate-500/10 text-slate-600"}`}
    >
      {status}
    </span>
  );
}
