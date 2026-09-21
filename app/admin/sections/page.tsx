"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { SECTION_KEYS } from "@/lib/types/cms";
import { Field, FormError, FormOk, PrimaryButton, fieldInput } from "@/app/components/admin/fields";

type ItemDraft = { title: string; text: string; meta: string };

/** `/admin/sections` — editor per section key (Trust proof lives here). */
export default function AdminSectionsPage() {
  const configured = isConvexConfigured();
  const sections = useQuery(api.cms.getSections, configured ? {} : "skip");
  const upsert = useMutation(api.cms.upsertSection);
  const [key, setKey] = useState<string>("trust");
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [items, setItems] = useState<ItemDraft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [appliedKey, setAppliedKey] = useState<string | null>(null);

  // Render-time sync: populate the form when the selected key changes (after
  // load). Same-key live updates never clobber in-progress edits.
  if (sections !== undefined && appliedKey !== key) {
    setAppliedKey(key);
    const found = sections.find((s) => s.key === key);
    if (found) {
      setEyebrow(found.eyebrow);
      setHeadline(found.headline);
      setBody(found.body);
      setItems((found.items ?? []).map((i) => ({ title: i.title, text: i.text, meta: i.meta ?? "" })));
    } else {
      setEyebrow("");
      setHeadline("");
      setBody("");
      setItems([]);
    }
    setError(null);
    setOk(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    setBusy(true);
    try {
      await upsert({
        key,
        eyebrow,
        headline,
        body,
        ...(items.length > 0
          ? {
              items: items.map((i) => ({
                title: i.title,
                text: i.text,
                ...(i.meta.trim() ? { meta: i.meta.trim() } : {}),
              })),
            }
          : {}),
      });
      setOk(`Section “${key}” saved.`);
    } catch {
      setError("Save failed. Check lengths (headline ≤200) and permissions.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;
  if (!sections) return <p className="text-sm text-slate-600">Loading sections…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Page sections</h1>
      <p className="mt-1 text-sm text-slate-600">
        Trust proof, headlines, and journey steps. Plain text only — HTML is stripped.
      </p>
      <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Section keys">
        {SECTION_KEYS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={key === k}
            onClick={() => setKey(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
              key === k ? "bg-navy-950 text-white" : "border border-navy-900/15 bg-white text-navy-900"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Eyebrow" htmlFor="sec-eyebrow">
          <input id="sec-eyebrow" className={fieldInput} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} required />
        </Field>
        <Field label="Headline" htmlFor="sec-headline">
          <input id="sec-headline" className={fieldInput} value={headline} onChange={(e) => setHeadline(e.target.value)} required />
        </Field>
        <Field label="Body" htmlFor="sec-body">
          <textarea id="sec-body" rows={4} className={fieldInput} value={body} onChange={(e) => setBody(e.target.value)} required />
        </Field>

        <div>
          <p className="mb-2 text-sm font-semibold text-navy-950">
            Items {key === "network" ? "(journey steps — meta = step number)" : "(pillars — leave meta empty)"}
          </p>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <fieldset key={idx} className="rounded-xl border border-navy-900/10 bg-white p-3">
                <legend className="px-1 text-xs font-semibold text-slate-500">Item {idx + 1}</legend>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_80px]">
                  <input
                    aria-label={`Item ${idx + 1} title`}
                    className={fieldInput}
                    value={item.title}
                    onChange={(e) =>
                      setItems((list) => list.map((it, i) => (i === idx ? { ...it, title: e.target.value } : it)))
                    }
                    placeholder="Title"
                  />
                  <input
                    aria-label={`Item ${idx + 1} meta`}
                    className={fieldInput}
                    value={item.meta}
                    onChange={(e) =>
                      setItems((list) => list.map((it, i) => (i === idx ? { ...it, meta: e.target.value } : it)))
                    }
                    placeholder="Meta"
                  />
                </div>
                <textarea
                  aria-label={`Item ${idx + 1} text`}
                  rows={2}
                  className={`${fieldInput} mt-2`}
                  value={item.text}
                  onChange={(e) =>
                    setItems((list) => list.map((it, i) => (i === idx ? { ...it, text: e.target.value } : it)))
                  }
                  placeholder="Text"
                />
                <button
                  type="button"
                  onClick={() => setItems((list) => list.filter((_, i) => i !== idx))}
                  className="mt-2 text-xs font-semibold text-red-700 underline-offset-4 hover:underline"
                >
                  Remove item
                </button>
              </fieldset>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setItems((list) => [...list, { title: "", text: "", meta: "" }])}
            className="mt-2 rounded-lg border border-navy-900/15 bg-white px-3 py-1.5 text-xs font-semibold text-navy-900 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
          >
            + Add item
          </button>
        </div>

        <FormError message={error} />
        <FormOk message={ok} />
        <PrimaryButton disabled={busy}>{busy ? "Saving…" : `Save “${key}”`}</PrimaryButton>
      </form>
    </div>
  );
}
