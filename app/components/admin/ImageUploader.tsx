"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fieldInput } from "./fields";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

/**
 * Shared CMS image uploader (used by products + media library).
 * Flow: `generateUploadUrl` → POST file → `save({storageId, alt, usedBy})`.
 * Validates type/size client-side; stores `storageId` + public URL.
 */
export default function ImageUploader({
  usedBy,
  onUploaded,
}: {
  usedBy: string;
  onUploaded: (result: { storageId: Id<"_storage">; url: string }) => void;
}) {
  const generateUrl = useMutation(api.media.generateUploadUrl);
  const save = useMutation(api.media.save);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!ALLOWED.includes(file.type)) {
      setError("Unsupported file type. Allowed: jpg, png, webp, svg.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large (max 5 MB).");
      return;
    }
    const alt = window.prompt("Alt text for this image (required):", file.name) ?? "";
    if (!alt.trim()) {
      setError("Alt text is required.");
      return;
    }
    setBusy(true);
    try {
      const url = await generateUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed (${res.status}).`);
      const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
      const saved = await save({ storageId, alt: alt.trim(), usedBy });
      setPreview(saved.url);
      onUploaded({ storageId, url: saved.url });
    } catch (err) {
      setError(err instanceof Error ? "Upload failed. Please try again." : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-4">
      <p className="text-sm font-semibold text-navy-950">Image</p>
      <p className="mt-0.5 text-xs text-slate-500">
        jpg/png/webp/svg, max 5 MB. Used by: {usedBy}
      </p>
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className={`${fieldInput} mt-2`}
      />
      {busy ? <p className="mt-2 text-xs text-slate-500">Uploading…</p> : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
      {preview ? (
        <p className="mt-2 break-all text-xs text-teal-700">
          Uploaded: <span className="underline">{preview}</span>
        </p>
      ) : null}
    </div>
  );
}
