"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type { Id } from "@/convex/_generated/dataModel";
import { Field, FormError, FormOk, PrimaryButton, fieldInput } from "@/app/components/admin/fields";
import ImageUploader from "@/app/components/admin/ImageUploader";

type Draft = {
  title: string;
  description: string;
  itemsText: string;
  alt: string;
  sortOrder: string;
  isPublished: boolean;
  imageStorageId?: Id<"_storage">;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  itemsText: "",
  alt: "",
  sortOrder: "0",
  isPublished: true,
};

/**
 * `/admin/products` — table + create/edit dialog.
 * Title auto-derives the slug server-side. Unpublish instead of deleting.
 */
export default function AdminProductsPage() {
  const configured = isConvexConfigured();
  const products = useQuery(api.cms.listProductsAdmin, configured ? {} : "skip");
  const createProduct = useMutation(api.cms.createProduct);
  const updateProduct = useMutation(api.cms.updateProduct);
  const removeProduct = useMutation(api.cms.removeProduct);
  const [editing, setEditing] = useState<Id<"products"> | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;
  if (!products) return <p className="text-sm text-slate-600">Loading products…</p>;

  function openNew() {
    setDraft(emptyDraft);
    setEditing("new");
    setError(null);
    setOk(null);
  }

  function openEdit(id: Id<"products">) {
    const p = products?.find((row) => row._id === id);
    if (!p) return;
    setDraft({
      title: p.title,
      description: p.description,
      itemsText: p.items.join("\n"),
      alt: p.alt,
      sortOrder: String(p.sortOrder),
      isPublished: p.isPublished,
      ...(p.imageStorageId ? { imageStorageId: p.imageStorageId } : {}),
    });
    setEditing(id);
    setError(null);
    setOk(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    const items = draft.itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    if (items.length < 1) {
      setError("A product needs at least one item (one per line).");
      return;
    }
    const sortOrder = Number(draft.sortOrder);
    if (!Number.isFinite(sortOrder)) {
      setError("Sort order must be a number.");
      return;
    }
    setBusy(true);
    try {
      if (editing === "new") {
        await createProduct({
          title: draft.title,
          description: draft.description,
          items,
          alt: draft.alt,
          sortOrder,
          isPublished: draft.isPublished,
          ...(draft.imageStorageId ? { imageStorageId: draft.imageStorageId } : {}),
        });
        setOk("Product created — it is live on the homepage.");
      } else if (editing) {
        await updateProduct({
          id: editing,
          patch: {
            title: draft.title,
            description: draft.description,
            items,
            alt: draft.alt,
            sortOrder,
            isPublished: draft.isPublished,
            ...(draft.imageStorageId ? { imageStorageId: draft.imageStorageId } : {}),
          },
        });
        setOk("Product updated.");
      }
      setEditing(null);
    } catch {
      setError("Save failed. Check lengths and permissions.");
    } finally {
      setBusy(false);
    }
  }

  async function onTogglePublish(id: Id<"products">, current: boolean) {
    setError(null);
    try {
      await updateProduct({ id, patch: { isPublished: !current } });
    } catch {
      setError("Publish toggle failed.");
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Trading-category cards. Unpublish hides a card — never hard-delete v1 content.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="rounded-lg bg-navy-950 px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
        >
          + New product
        </button>
      </div>

      <FormError message={error} />
      <FormOk message={ok} />

      <div className="mt-4 overflow-x-auto rounded-2xl border border-navy-900/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-navy-900/10 text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id} className="border-b border-navy-900/5 last:border-0">
                <td className="px-4 py-3 font-semibold">{p.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.slug}</td>
                <td className="px-4 py-3">{p.sortOrder}</td>
                <td className="px-4 py-3">
                  {p.isPublished ? (
                    <span className="inline-block rounded-full bg-teal-700/10 px-2.5 py-0.5 text-xs font-semibold text-teal-800">published</span>
                  ) : (
                    <span className="inline-block rounded-full bg-slate-500/10 px-2.5 py-0.5 text-xs font-semibold text-slate-600">hidden</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEdit(p._id)} className="text-xs font-semibold text-teal-700 underline-offset-4 hover:underline">
                      Edit
                    </button>
                    <button type="button" onClick={() => void onTogglePublish(p._id, p.isPublished)} className="text-xs font-semibold text-navy-900 underline-offset-4 hover:underline">
                      {p.isPublished ? "Unpublish" : "Publish"}
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
          <h2 className="text-lg font-bold">{editing === "new" ? "New product" : "Edit product"}</h2>
          <Field label="Title (slug auto-derives)" htmlFor="prod-title">
            <input id="prod-title" className={fieldInput} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} required />
          </Field>
          <Field label="Description" htmlFor="prod-desc">
            <textarea id="prod-desc" rows={3} className={fieldInput} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} required />
          </Field>
          <Field label="Items (one per line)" htmlFor="prod-items">
            <textarea id="prod-items" rows={3} className={fieldInput} value={draft.itemsText} onChange={(e) => setDraft({ ...draft, itemsText: e.target.value })} required />
          </Field>
          <Field label="Image alt text" htmlFor="prod-alt">
            <input id="prod-alt" className={fieldInput} value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} required />
          </Field>
          <Field label="Sort order" htmlFor="prod-order">
            <input id="prod-order" inputMode="numeric" className={fieldInput} value={draft.sortOrder} onChange={(e) => setDraft({ ...draft, sortOrder: e.target.value })} required />
          </Field>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={draft.isPublished} onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })} />
            Published (visible on homepage)
          </label>
          <ImageUploader
            usedBy={editing === "new" ? "products/new" : `products/${editing}`}
            onUploaded={({ storageId }) => setDraft((d) => ({ ...d, imageStorageId: storageId }))}
          />
          {draft.imageStorageId ? (
            <p className="text-xs text-teal-700">Image attached — saving links it to this product.</p>
          ) : null}
          <div className="flex gap-3">
            <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save product"}</PrimaryButton>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-navy-900/15 px-4 py-2.5 text-sm font-semibold">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      {editing && editing !== "new" ? (
        <DeleteProductButton id={editing} onDone={() => setEditing(null)} remove={removeProduct} />
      ) : null}
    </div>
  );
}

function DeleteProductButton({
  id,
  onDone,
  remove,
}: {
  id: Id<"products">;
  onDone: () => void;
  remove: (args: { id: Id<"products"> }) => Promise<unknown>;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="mt-4 max-w-2xl">
      {!confirming ? (
        <button type="button" onClick={() => setConfirming(true)} className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline">
          Delete permanently (prefer Unpublish above)
        </button>
      ) : (
        <p className="text-xs text-slate-600">
          Really delete?{" "}
          <button
            type="button"
            onClick={() => void remove({ id }).then(onDone)}
            className="font-semibold text-red-700 underline-offset-4 hover:underline"
          >
            Yes, delete
          </button>{" "}
          <button type="button" onClick={() => setConfirming(false)} className="font-semibold underline-offset-4 hover:underline">
            Keep
          </button>
        </p>
      )}
    </div>
  );
}
