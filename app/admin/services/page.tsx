"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, FormError, FormOk, PrimaryButton, fieldInput } from "@/app/components/admin/fields";

type Draft = {
  title: string;
  description: string;
  meta: string;
  sortOrder: string;
  isPublished: boolean;
};

const emptyDraft: Draft = { title: "", description: "", meta: "", sortOrder: "0", isPublished: true };

/** `/admin/services` — same pattern as products, smaller form. */
export default function AdminServicesPage() {
  const configured = isConvexConfigured();
  const services = useQuery(api.cms.listServicesAdmin, configured ? {} : "skip");
  const createService = useMutation(api.cms.createService);
  const updateService = useMutation(api.cms.updateService);
  const removeService = useMutation(api.cms.removeService);
  const [editing, setEditing] = useState<Id<"services"> | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;
  if (!services) return <p className="text-sm text-slate-600">Loading services…</p>;

  function openNew() {
    setDraft(emptyDraft);
    setEditing("new");
    setError(null);
    setOk(null);
  }

  function openEdit(id: Id<"services">) {
    const s = services?.find((row) => row._id === id);
    if (!s) return;
    setDraft({
      title: s.title,
      description: s.description,
      meta: s.meta ?? "",
      sortOrder: String(s.sortOrder),
      isPublished: s.isPublished,
    });
    setEditing(id);
    setError(null);
    setOk(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const sortOrder = Number(draft.sortOrder);
    if (!Number.isFinite(sortOrder)) {
      setError("Sort order must be a number.");
      return;
    }
    const payload = {
      title: draft.title,
      description: draft.description,
      ...(draft.meta.trim() ? { meta: draft.meta.trim() } : {}),
      sortOrder,
      isPublished: draft.isPublished,
    };
    setBusy(true);
    try {
      if (editing === "new") {
        await createService(payload);
        setOk("Service created.");
      } else if (editing) {
        await updateService({ id: editing, patch: payload });
        setOk("Service updated.");
      }
      setEditing(null);
    } catch {
      setError("Save failed. Check lengths and permissions.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Services</h1>
          <p className="mt-1 text-sm text-slate-600">Global-network capability cards.</p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        >
          + New service
        </button>
      </div>

      <FormError message={error} />
      <FormOk message={ok} />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Meta</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s._id} className="border-b border-navy-900/5 last:border-0">
                <td className="px-4 py-3 font-semibold">{s.title}</td>
                <td className="px-4 py-3 text-slate-500">{s.meta ?? "—"}</td>
                <td className="px-4 py-3">{s.sortOrder}</td>
                <td className="px-4 py-3">{s.isPublished ? "published" : "hidden"}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(s._id)} className="text-xs font-semibold text-teal-700 underline-offset-4 hover:underline">
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void updateService({ id: s._id, patch: { isPublished: !s.isPublished } }).catch(() => setError("Publish toggle failed."))}
                      className="text-xs font-semibold text-navy-900 underline-offset-4 hover:underline"
                    >
                      {s.isPublished ? "Unpublish" : "Publish"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete “${s.title}”? Prefer Unpublish.`)) {
                          void removeService({ id: s._id }).catch(() => setError("Delete failed."));
                        }
                      }}
                      className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5">
          <h2 className="text-lg font-bold">{editing === "new" ? "New service" : "Edit service"}</h2>
          <Field label="Title" htmlFor="svc-title">
            <input id="svc-title" className={fieldInput} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          </Field>
          <Field label="Description" htmlFor="svc-desc">
            <textarea id="svc-desc" rows={3} className={fieldInput} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} required />
          </Field>
          <Field label="Meta (e.g. transit label)" htmlFor="svc-meta">
            <input id="svc-meta" className={fieldInput} value={draft.meta} onChange={(e) => setDraft({ ...draft, meta: e.target.value })} />
          </Field>
          <Field label="Sort order" htmlFor="svc-order">
            <input id="svc-order" inputMode="numeric" className={fieldInput} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} required />
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} />
            Published
          </label>
          <div className="flex gap-3">
            <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save service"}</PrimaryButton>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
