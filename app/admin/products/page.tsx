"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import ImageUploader from "@/app/components/admin/ImageUploader";
import {
  Field,
  FormError,
  fieldInputClasses,
  toUserMessage,
} from "@/app/components/admin/ui";

type Product = {
  _id: Id<"products">;
  title: string;
  slug: string;
  description: string;
  items: string[];
  imageUrl?: string;
  alt?: string;
  sortOrder: number;
  isPublished: boolean;
};

const empty = {
  title: "",
  slug: "",
  description: "",
  itemsText: "",
  imageUrl: "",
  alt: "",
  sortOrder: 99,
  isPublished: true,
};

export default function AdminProductsPage() {
  const enabled = isConvexConfigured();
  const page = useQuery(
    api.cms.listProductsAdmin,
    enabled ? { paginationOpts: { numItems: 100, cursor: null } } : "skip",
  );
  const create = useMutation(api.cms.createProduct);
  const update = useMutation(api.cms.updateProduct);
  const setPublished = useMutation(api.cms.setProductPublished);
  const [editing, setEditing] = useState<Id<"products"> | "new" | null>(null);
  const [form, setForm] = useState(empty);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function startNew() {
    setForm({ ...empty, sortOrder: (page?.page.length ?? 0) + 1 });
    setEditing("new");
    setError(null);
  }

  function startEdit(p: Product) {
    setForm({
      title: p.title,
      slug: p.slug,
      description: p.description,
      itemsText: p.items.join("\n"),
      imageUrl: p.imageUrl ?? "",
      alt: p.alt ?? "",
      sortOrder: p.sortOrder,
      isPublished: p.isPublished,
    });
    setEditing(p._id);
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
      items: form.itemsText.split("\n").map((i) => i.trim()).filter(Boolean),
      imageUrl: form.imageUrl.trim() || undefined,
      alt: form.alt.trim() || undefined,
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
        <h2 className="text-lg font-bold text-navy-950">Products</h2>
        <button
          type="button"
          onClick={startNew}
          className="ml-auto rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white hover:bg-navy-900 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        >
          + New product
        </button>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Trading category cards. Unpublish hides a card — never hard-delete in v1.
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
            {(page?.page ?? []).map((p) => (
              <tr key={p._id} className="border-b border-navy-900/5 last:border-0">
                <td className="px-4 py-3 font-semibold text-navy-950">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-600">{p.slug}</td>
                <td className="px-4 py-3">{p.sortOrder}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => void setPublished({ id: p._id, isPublished: !p.isPublished }).catch(() => setError("Toggle failed. Please try again."))}
                    aria-pressed={p.isPublished}
                    className={`rounded-full px-3 py-1 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
                      p.isPublished ? "bg-teal-700/10 text-teal-800" : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Hidden"}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(p)}
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
            {enabled ? "Loading…" : "Backend not connected — connect Convex to manage products."}
          </p>
        ) : null}
      </div>

      {editing ? (
        <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5">
          <h3 className="font-semibold text-navy-950">
            {editing === "new" ? "New product" : "Edit product"}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Title" htmlFor="prod-title">
              <input id="prod-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={fieldInputClasses} />
            </Field>
            <Field label="Slug (auto from title)" htmlFor="prod-slug" optional>
              <input id="prod-slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" className={fieldInputClasses} />
            </Field>
          </div>
          <Field label="Description" htmlFor="prod-desc">
            <textarea id="prod-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className={`${fieldInputClasses} resize-y`} />
          </Field>
          <Field label="Items (one per line)" htmlFor="prod-items">
            <textarea id="prod-items" value={form.itemsText} onChange={(e) => setForm({ ...form, itemsText: e.target.value })} rows={4} className={`${fieldInputClasses} resize-y font-mono`} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Image URL" htmlFor="prod-img" optional>
              <input id="prod-img" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="/categories/….jpg or https://…" className={fieldInputClasses} />
            </Field>
            <Field label="Image alt" htmlFor="prod-alt" optional>
              <input id="prod-alt" value={form.alt} onChange={(e) => setForm({ ...form, alt: e.target.value })} className={fieldInputClasses} />
            </Field>
          </div>
          {form.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.imageUrl} alt={form.alt || form.title} className="h-32 w-auto rounded-lg border border-navy-900/10 object-cover" />
          ) : null}
          <ImageUploader
            usedBy={`products/${form.slug || "new"}`}
            onUploaded={(url) => setForm((f) => ({ ...f, imageUrl: url }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sort order" htmlFor="prod-order">
              <input id="prod-order" type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} className={fieldInputClasses} />
            </Field>
            <div className="flex items-end gap-2 pb-1">
              <input
                id="prod-pub"
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="h-4 w-4 accent-teal-700"
              />
              <label htmlFor="prod-pub" className="text-sm font-semibold text-navy-950">Published</label>
            </div>
          </div>
          <FormError message={error} />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {busy ? "Saving…" : "Save product"}
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
