"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { toUserMessage } from "@/app/components/admin/ui";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;
type Status = (typeof STATUSES)[number];

const pill: Record<Status, string> = {
  new: "bg-gold-500/15 text-navy-900",
  contacted: "bg-teal-700/10 text-teal-800",
  qualified: "bg-navy-950 text-white",
  closed: "bg-slate-200 text-slate-600",
};

export default function AdminInquiriesPage() {
  const enabled = isConvexConfigured();
  const [filter, setFilter] = useState<Status | "all">("all");
  const page = useQuery(
    api.inquiriesAdmin.list,
    enabled
      ? {
          ...(filter === "all" ? {} : { status: filter }),
          paginationOpts: { numItems: 50, cursor: null },
        }
      : "skip",
  );
  const detailId = useState<Id<"inquiries"> | null>(null);
  const [openId, setOpenId] = detailId;
  const detail = useQuery(
    api.inquiriesAdmin.get,
    enabled && openId ? { id: openId } : "skip",
  );
  const setStatus = useMutation(api.inquiriesAdmin.setStatus);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function changeStatus(id: Id<"inquiries">, status: Status) {
    setError(null);
    setBusy(true);
    try {
      await setStatus({ id, status });
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-navy-950">Inquiries</h2>
        <div className="ml-auto flex flex-wrap gap-1.5" role="group" aria-label="Filter by status">
          {(["all", ...STATUSES] as const).map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={filter === s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
                filter === s ? "bg-navy-950 text-white" : "bg-white text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Read-only leads. Emails never appear in URLs — open a row for detail.
      </p>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">{error}</p>
      ) : null}

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-xs tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3"><span className="sr-only">Open</span></th>
            </tr>
          </thead>
          <tbody>
            {(page?.page ?? []).map((i) => (
              <tr key={i._id} className="border-b border-navy-900/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-navy-950">{i.name}</td>
                <td className="px-4 py-3 text-slate-600">{i.category}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${pill[i.status as Status] ?? pill.new}`}>
                    {i.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {new Date(i.createdAt).toLocaleDateString("en-AE", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => setOpenId(i._id)}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
                  >
                    Open
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!page ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            {enabled ? "Loading…" : "Backend not connected — connect Convex to triage inquiries."}
          </p>
        ) : page.page.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No inquiries{filter === "all" ? " yet." : ` with status “${filter}”.`}</p>
        ) : null}
      </div>

      {openId ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Inquiry detail"
          className="fixed inset-0 z-50 flex items-end justify-center bg-navy-950/50 p-4 sm:items-center"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {!detail ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : (
              <>
                <h3 className="text-lg font-bold text-navy-950">{detail.name}</h3>
                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-navy-950">Email</dt><dd className="text-slate-700">{detail.email}</dd></div>
                  {detail.company ? <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-navy-950">Company</dt><dd className="text-slate-700">{detail.company}</dd></div> : null}
                  {detail.phone ? <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-navy-950">Phone</dt><dd className="text-slate-700">{detail.phone}</dd></div> : null}
                  <div className="flex gap-2"><dt className="w-20 shrink-0 font-semibold text-navy-950">Category</dt><dd className="text-slate-700">{detail.category}</dd></div>
                  <div><dt className="font-semibold text-navy-950">Message</dt><dd className="mt-1 rounded-lg bg-cream-50 p-3 text-slate-700">{detail.message}</dd></div>
                </dl>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <label htmlFor="inq-status" className="text-sm font-semibold text-navy-950">Status</label>
                  <select
                    id="inq-status"
                    value={detail.status}
                    disabled={busy}
                    onChange={(e) => void changeStatus(detail._id, e.target.value as Status)}
                    className="rounded-lg border border-navy-900/15 bg-white px-3 py-1.5 text-sm text-navy-950 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none disabled:opacity-60"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setOpenId(null)}
                    className="ml-auto rounded-lg px-4 py-2 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
