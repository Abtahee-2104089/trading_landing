"use client";

import { useRef, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { adminAuthArgs } from "@/lib/admin-token";
import { useUploadThing } from "@/lib/uploadthing-client";
import { fieldInput } from "./fields";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

/**
 * Shared CMS image uploader (UploadThing / utfs.io).
 *
 * Flow: pick file → client validates (type/size) → uploads to UploadThing
 * → saves a `media` library row `{url, alt, usedBy}` → `onUploaded({url})`.
 * Parents store the URL on their entity (site hero/about, section image,
 * product image). Pass `currentUrl` + `onRemove` for full image CRUD
 * (upload / replace / remove) inline.
 */
export default function ImageUploader({
  usedBy,
  onUploaded,
  currentUrl,
  onRemove,
}: {
  usedBy: string;
  onUploaded: (result: { url: string; key?: string }) => void;
  currentUrl?: string | null;
  onRemove?: () => void;
}) {
  const saveMedia = useMutation(api.media.save);
  const fileRef = useRef<HTMLInputElement>(null);
  const [alt, setAlt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlMode, setUrlMode] = useState(false);
  const [pastUrl, setPastUrl] = useState("");

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const file = res?.[0];
      if (!file) {
        setBusy(false);
        setError("Upload finished without a file URL.");
        return;
      }
      saveMedia({
        ...adminAuthArgs(),
        url: file.url,
        alt: alt.trim() || file.name,
        usedBy,
        ...(file.key ? { key: file.key } : {}),
      })
        .then(() => {
          onUploaded({ url: file.url, key: file.key });
        })
        .catch(() => {
          setError("Uploaded, but saving to the media library failed.");
        })
        .finally(() => setBusy(false));
    },
    onUploadError: (error) => {
      setBusy(false);
      // Surface the server/client reason — UploadThing otherwise logs an
      // opaque `{}` / generic FetchError that hides missing-token setup.
      const detail =
        error && typeof error.message === "string" && error.message
          ? `: ${error.message}`
          : "";
      setError(
        `Upload failed${detail} — if this persists, check UPLOADTHING_TOKEN in .env.local.`,
      );
    },
  });

  async function handleUseUrl() {
    setError(null);
    const url = pastUrl.trim();
    if (!/^https:\/\//.test(url)) {
      setError("Paste a full https:// image URL.");
      return;
    }
    if (!alt.trim()) {
      setError("Alt text is required.");
      return;
    }
    setBusy(true);
    try {
      await saveMedia({
        ...adminAuthArgs(),
        url,
        alt: alt.trim(),
        usedBy,
      });
      onUploaded({ url });
    } catch {
      setError("Saving the URL failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }
  async function handleUpload() {
    setError(null);
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first.");
      return;
    }
    if (!ALLOWED.includes(file.type)) {
      setError("Unsupported file type. Allowed: jpg, png, webp, svg.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large (max 5 MB).");
      return;
    }
    if (!alt.trim()) {
      setError("Alt text is required.");
      return;
    }
    setBusy(true);
    try {
      await startUpload([file]);
    } catch (error) {
      setBusy(false);
      const detail =
        error instanceof Error && error.message ? `: ${error.message}` : "";
      setError(`Upload failed${detail} — please try again.`);
    }
  }

  return (
    <div className="rounded-xl border border-navy-900/10 bg-white p-4">
      <p className="text-sm font-semibold text-navy-950">Image</p>
      <p className="mt-0.5 text-xs text-slate-500">
        Uploaded to UploadThing (utfs.io) — jpg/png/webp/svg, max 5 MB. Used
        by: {usedBy}
      </p>
      {currentUrl ? (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentUrl}
            alt="Current image preview"
            loading="lazy"
            className="h-32 w-full rounded-lg border border-navy-900/10 object-cover"
          />
          {onRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="mt-2 text-xs font-semibold text-red-700 underline-offset-4 hover:underline"
            >
              Remove image
            </button>
          ) : null}
        </div>
      ) : null}
      <label
        htmlFor={`img-alt-${usedBy}`}
        className="mt-3 mb-1 block text-xs font-semibold text-navy-950"
      >
        Alt text (required)
      </label>
      <input
        id={`img-alt-${usedBy}`}
        type="text"
        value={alt}
        onChange={(e) => setAlt(e.target.value)}
        disabled={busy}
        placeholder="Describe the image"
        className={fieldInput}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/svg+xml"
        disabled={busy}
        className={`${fieldInput} mt-2`}
      />
      <button
        type="button"
        onClick={() => void handleUpload()}
        disabled={busy}
        className="mt-2 rounded-lg bg-navy-950 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
      >
        {busy ? "Uploading…" : currentUrl ? "Replace image" : "Upload image"}
      </button>
      <button
        type="button"
        onClick={() => setUrlMode((v) => !v)}
        disabled={busy}
        className="mt-2 ml-2 rounded-lg border border-navy-900/15 bg-white px-4 py-2 text-xs font-semibold text-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
      >
        {urlMode ? "Hide URL option" : "Or paste image URL"}
      </button>
      {urlMode ? (
        <div className="mt-2 flex gap-2">
          <input
            type="url"
            value={pastUrl}
            onChange={(e) => setPastUrl(e.target.value)}
            disabled={busy}
            placeholder="https://…"
            aria-label="Paste image URL"
            className={fieldInput}
          />
          <button
            type="button"
            onClick={() => void handleUseUrl()}
            disabled={busy}
            className="shrink-0 rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
          >
            Use URL
          </button>
        </div>
      ) : null}
      {error ? (
        <p role="alert" className="mt-2 text-xs font-medium text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
