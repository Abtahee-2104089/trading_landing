"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import {
  Field,
  FormError,
  fieldInputClasses,
  toUserMessage,
} from "@/app/components/admin/ui";

type Service = {
  _id: Id<"services">;
  title: string;
  slug: string;
  description: string;
  meta?: string;
  sortOrder: number;
  isPublished: boolean;
};

const empty = {
  title: "",
  slug: "",
  description: "",
  meta: "",
  sortOrder: 99,
  isPublished: true,
};

export default function AdminServicesPage() {
  const enabled = isConvexConfigured();
  const page = useQuery(
    api.cms.listServicesAdmin,
    enabled ? { paginationOpts: { numItems: 100, cursor: null } } : "skip",
  );
  const create = useMutation(api.cms.createService);
  const update = useMutation(api.cms.updateService);
  const setPublished = useMutation(api.cms.setServicePublished);
  const [editing, setEditing] = useState<Id<"services"> | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startNew() {
    setForm({ ...empty, sortOrder: (page?.page.length ?? 0) + 1 });
    setEditing("new");
    setError(null);
  }

  function startEdit(s: Service) {
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description,
      meta: s.meta ?? "",
      sortOrder: s.sortOrder,
      isPublished: s.isPublished,
    });
    setEditing(s._id);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      description: form.description.trim(),
      meta: form.meta.trim() || undefined,
      sortOrder: Number(form.sortOrder) || 0,
      isPublished: form.isPublished,
    };
    try {
      if (editing === "new") {
        await create(payload);
      } else if (editing) {
        await update({ id: editing, patch: payload });
      }
      setEditing(null);
      setForm(empty);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-bold text-navy-950">Services</h2>
        <button
          type="button"
          onClick={startNew}
          className="ml-auto rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        >
          + New service
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Global network capabilities. Journey steps live under Sections → network.
      </p>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-xs tracking-wide text-slate-500 uppercase">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {(page?.page ?? []).map((s) => (
              <tr key={s._id} className="border-b border-navy-900/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-navy-950">{s.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{s.slug}</td>
                <td className="px-4 py-3">{s.sortOrder}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void setPublished({ id: s._id, isPublished: !s.isPublished }).catch(() => setError("Toggle failed. Please try again."))}
                    aria-pressed={s.isPublished}
                    className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
                      s.isPublished ? "bg-teal-700/10 text-teal-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {s.isPublished ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    className="rounded-lg px-3 py-1.5 text-sm font-semibold text-teal-700 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!page ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">
            {enabled ? "Loading…" : "Backend not connected — connect Convex to manage services."}
          </p>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5">
          <h3 className="font-semibold text-navy-950">
            {editing === "new" ? "New service" : "Edit service"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="svc-title">
              <input id="svc-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldInputClasses} />
            </Field>
            <Field label="Slug (auto from title)" htmlFor="svc-slug" optional>
              <input id="svc-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className={fieldInputClasses} />
            </Field>
          </div>
          <Field label="Description" htmlFor="svc-desc">
            <textarea id="svc-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${fieldInputClasses} resize-y`} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Badge / meta" htmlFor="svc-meta" optional>
              <input id="svc-meta" value={form.meta} onChange={(e) => setForm({ ...form, meta: e.target.value })} placeholder="e.g. DDP / DAP where it helps" className={fieldInputClasses} />
            </Field>
            <Field label="Sort order" htmlFor="svc-order">
              <input id="svc-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={fieldInputClasses} />
            </Field>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="svc-pub"
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
              className="h-4 w-4 accent-teal-700"
            />
            <label htmlFor="svc-pub" className="text-sm font-semibold text-navy-950">Published</label>
          </div>
          <FormError message={error} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {busy ? "Saving…" : "Save service"}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(null); setForm(empty); setError(null); }}
              className="rounded-lg px-4 py-2.5 text-sm font-semibold text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
