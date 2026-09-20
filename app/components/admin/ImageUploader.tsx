"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageUploader({
  usedBy,
  onUploaded,
}: {
  usedBy: string;
  onUploaded: (url: string, storageId: string) => void;
}) {
  const generateUrl = useMutation(api.media.generateUploadUrl);
  const save = useMutation(api.media.save);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Only jpg, png, webp, or svg images are allowed.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Image must be 5 MB or smaller.");
      return;
    }
    if (!isConvexConfigured()) {
      setError("Backend not configured (NEXT_PUBLIC_CONVEX_URL).");
      return;
    }
    setBusy(true);
    try {
      const url = await generateUrl({});
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error("upload failed");
      const { storageId } = (await res.json()) as { storageId: string };
      const saved = await save({
        storageId,
        alt: file.name.replace(/\.[^.]+$/, "").slice(0, 200) || "uploaded image",
        usedBy,
        contentType: file.type,
        size: file.size,
      });
      onUploaded(saved.url, storageId);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <label
        htmlFor={`upload-${usedBy}`}
        className="block text-sm font-semibold text-navy-950"
      >
        Upload image <span className="font-normal text-slate-500">(jpg/png/webp/svg, ≤5 MB)</span>
      </label>
      <input
        id={`upload-${usedBy}`}
        type="file"
        accept={ALLOWED.join(",")}
        disabled={busy}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
        className="mt-1.5 block w-full text-sm text-slate-700 file:mr-3 file:rounded-lg file:border file:border-navy-900/15 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-navy-900 hover:file:bg-navy-50 disabled:opacity-60"
      />
      {busy ? <p className="mt-2 text-sm text-slate-500">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
