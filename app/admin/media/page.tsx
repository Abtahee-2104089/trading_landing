"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import ImageUploader from "@/app/components/admin/ImageUploader";
import { toUserMessage } from "@/app/components/admin/ui";

export default function AdminMediaPage() {
  const enabled = isConvexConfigured();
  const items = useQuery(api.media.list, enabled ? {} : "skip");
  const remove = useMutation(api.media.remove);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function copy(url: string, id: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(id);
      setTimeout(() => setCopied((c) => (c === id ? null : c)), 2000);
    } catch {
      setError("Copy failed — select the URL manually.");
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-950">Media</h2>
      <p className="mt-1 text-sm text-slate-600">
        Upload images (jpg/png/webp/svg, ≤5 MB), then copy the URL into a
        product or section.
      </p>
      <div className="mt-4 rounded-2xl border border-navy-900/10 bg-white p-5">
        <ImageUploader
          usedBy="media-library"
          onUploaded={() => undefined}
        />
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(items ?? []).map((m) => (
          <article key={m._id} className="overflow-hidden rounded-2xl border border-navy-900/10 bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.url} alt={m.alt} className="h-40 w-full object-cover" loading="lazy" />
            <div className="p-4">
              <p className="truncate text-sm font-semibold text-navy-950" title={m.alt}>{m.alt}</p>
              {m.usedBy ? <p className="mt-0.5 text-xs text-slate-500">{m.usedBy}</p> : null}
              <p className="mt-1 truncate font-mono text-xs text-slate-500" title={m.url}>{m.url}</p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => void copy(m.url, m._id)}
                  className="rounded-lg bg-navy-950 px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy-900 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
                >
                  {copied === m._id ? "Copied!" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => void remove({ id: m._id }).catch((err: unknown) => setError(toUserMessage(err)))}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-700 ring-1 ring-red-700/20 hover:bg-red-50 focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:outline-none"
                >
                  Delete
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!items ? (
        <p className="mt-4 text-center text-sm text-slate-500">
          {enabled ? "Loading…" : "Backend not connected — connect Convex to manage media."}
        </p>
      ) : items.length === 0 ? (
        <p className="mt-4 text-center text-sm text-slate-500">No uploads yet.</p>
      ) : null}
    </div>
  );
}
