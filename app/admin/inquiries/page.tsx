"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { usePaginatedQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type { Id } from "@/convex/_generated/dataModel";
import { FormError, StatusPill } from "@/app/components/admin/fields";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;
type Status = (typeof STATUSES)[number];

/**
 * `/admin/inquiries` — read-only lead table + drawer + status changer.
 * Emails are visible ONLY here, never in URLs.
 */
export default function AdminInquiriesPage() {
  const configured = isConvexConfigured();
  const [filter, setFilter] = useState<Status | "all">("all");
  const [selected, setSelected] = useState<Id<"inquiries"> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setStatus = useMutation(api.inquiriesAdmin.setStatus);

  const { results, status, loadMore } = usePaginatedQuery(
    api.inquiriesAdmin.list,
    configured
      ? filter === "all"
        ? {}
        : { status: filter }
      : "skip",
    { initialNumItems: 20 },
  );

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;

  async function changeStatus(id: Id<"inquiries">, next: Status) {
    setError(null);
    try {
      await setStatus({ id, status: next });
    } catch {
      setError("Status change failed.");
    }
  }

  const detail = results?.find((r) => r._id === selected) ?? null;

  return (
    <div>
      <h1 className="text-2xl font-bold">Inquiries</h1>
      <p className="mt-1 text-sm text-slate-600">Leads from the #contact form. Newest first.</p>

      <div className="mt-4 flex gap-2" role="tablist" aria-label="Status filter">
        {(["all", ...STATUSES] as const).map((s) => (
          <button
            key={s}
            type="button"
            role="tab"
            aria-selected={filter === s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
              filter === s ? "bg-navy-950 text-white" : "border border-navy-900/15 bg-white text-navy-900"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <FormError message={error} />

      {status === "LoadingFirstPage" ? (
        <p className="mt-4 text-sm text-slate-600">Loading inquiries…</p>
      ) : !results || results.length === 0 ? (
        <p className="mt-4 text-sm text-slate-500">No inquiries yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-900/10 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Open</th>
              </tr>
            </thead>
            <tbody>
              {results.map((row) => (
                <tr key={row._id} className="border-b border-navy-900/5 last:border-0">
                  <td className="px-4 py-3 font-semibold">{row.name}</td>
                  <td className="px-4 py-3 text-slate-600">{row.category}</td>
                  <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(row.createdAt).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setSelected(row._id)}
                      className="text-xs font-semibold text-teal-700 underline-offset-4 hover:underline"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {status === "CanLoadMore" ? (
        <button
          type="button"
          onClick={() => loadMore(20)}
          className="mt-3 rounded-lg border border-navy-900/15 bg-white px-4 py-2 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        >
          Load more
        </button>
      ) : null}

      {detail ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Inquiry from ${detail.name}`}
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/60 p-4 sm:items-center"
          onClick={() => setSelected(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">{detail.name}</h2>
                <p className="text-sm text-slate-500">
                  {detail.email}
                  {detail.phone ? ` · ${detail.phone}` : ""}
                  {detail.company ? ` · ${detail.company}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close inquiry detail"
                className="rounded-lg border border-navy-900/15 px-3 py-1.5 text-sm font-semibold"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {detail.category} · {new Date(detail.createdAt).toLocaleString("en-AE")}
            </p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{detail.message}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => void changeStatus(detail._id, s)}
                  aria-pressed={detail.status === s}
                  className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
                    detail.status === s ? "bg-navy-950 text-white" : "border border-navy-900/15 bg-white"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
