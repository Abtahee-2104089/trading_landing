"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type { Id } from "@/convex/_generated/dataModel";
import { FormError, FormOk } from "@/app/components/admin/fields";
import ImageUploader from "@/app/components/admin/ImageUploader";

/** `/admin/media` — grid of media rows + uploader + copy-URL. */
export default function AdminMediaPage() {
  const configured = isConvexConfigured();
  const rows = useQuery(api.media.list, configured ? {} : "skip");
  const removeMedia = useMutation(api.media.remove);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;
  if (!rows) return <p className="text-sm text-slate-600">Loading media…</p>;

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setNotice("URL copied to clipboard.");
    } catch {
      setNotice(url);
    }
  }

  async function onDelete(id: Id<"media">) {
    setError(null);
    if (!window.confirm("Delete this image (storage + row)?")) return;
    try {
      await removeMedia({ id });
    } catch {
      setError("Delete failed.");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Media library</h1>
      <p className="mt-1 text-sm text-slate-600">
        Every CMS image is a Convex Storage file + row. Upload, copy the URL, paste it into a product or section.
      </p>
      <FormError message={error} />
      <FormOk message={notice} />

      <div className="mt-4 max-w-2xl">
        <ImageUploader
          usedBy="media-library"
          onUploaded={() => setNotice("Uploaded — row added below.")}
        />
      </div>

      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No images yet — upload the first one above.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((row) => (
            <li key={row._id} className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={row.url} alt={row.alt} loading="lazy" className="h-40 w-full object-cover" />
              <div className="p-4">
                <p className="truncate text-sm font-semibold" title={row.alt}>{row.alt}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500" title={row.usedBy}>Used by: {row.usedBy}</p>
                <div className="mt-2 flex gap-3">
                  <button type="button" onClick={() => void copyUrl(row.url)} className="text-xs font-semibold text-teal-700 underline-offset-4 hover:underline">
                    Copy URL
                  </button>
                  <button type="button" onClick={() => void onDelete(row._id)} className="text-xs font-semibold text-red-700 underline-offset-4 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
