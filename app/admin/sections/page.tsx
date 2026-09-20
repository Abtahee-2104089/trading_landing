"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import {
  Field,
  FormError,
  FormSaved,
  fieldInputClasses,
  toUserMessage,
} from "@/app/components/admin/ui";

const KEYS = ["hero", "about", "network", "trust", "contact", "footer"];

export default function AdminSectionsPage() {
  const enabled = isConvexConfigured();
  const sections = useQuery(api.cms.getSections, enabled ? {} : "skip");
  const upsert = useMutation(api.cms.upsertSection);
  const [key, setKey] = useState("trust");
  const [eyebrow, setEyebrow] = useState("");
  const [headline, setHeadline] = useState("");
  const [body, setBody] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [loaded, setLoaded] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const current = sections?.find((s) => s.key === key);
  if (current && loaded !== `${key}:${current._id}`) {
    setLoaded(`${key}:${current._id}`);
    setEyebrow(current.eyebrow ?? "");
    setHeadline(current.headline ?? "");
    setBody(current.body ?? "");
    setStepsText(
      (current.steps ?? []).map((s) => `${s.title} | ${s.text}`).join("\n"),
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!enabled) {
      setError("Backend not configured (NEXT_PUBLIC_CONVEX_URL).");
      return;
    }
    const steps = stepsText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        const [title, ...rest] = l.split("|");
        return { title: (title ?? "").trim(), text: rest.join("|").trim() };
      })
      .filter((s) => s.title || s.text);
    setBusy(true);
    try {
      await upsert({ key, eyebrow, headline, body, steps });
      setSaved(true);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-950">Sections</h2>
      <p className="mt-1 text-sm text-slate-600">
        One editor per section key. For <code>network</code>, steps are one per
        line as <code>Title | description</code>.
      </p>
      <div className="mt-3 flex flex-wrap gap-2" role="tablist" aria-label="Section keys">
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            role="tab"
            aria-selected={key === k}
            onClick={() => { setKey(k); setLoaded(""); setSaved(false); setError(null); }}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none ${
              key === k ? "bg-navy-950 text-white" : "bg-white text-navy-900 ring-1 ring-navy-900/15 hover:bg-navy-50"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <form onSubmit={onSubmit} className="mt-4 space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5">
        <Field label="Eyebrow" htmlFor="sec-eyebrow" optional>
          <input id="sec-eyebrow" value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} className={fieldInputClasses} />
        </Field>
        <Field label="Headline" htmlFor="sec-headline" optional>
          <input id="sec-headline" value={headline} onChange={(e) => setHeadline(e.target.value)} className={fieldInputClasses} />
        </Field>
        <Field label="Body" htmlFor="sec-body" optional>
          <textarea id="sec-body" value={body} onChange={(e) => setBody(e.target.value)} rows={5} className={`${fieldInputClasses} resize-y`} />
        </Field>
        {key === "network" ? (
          <Field label="Journey steps (Title | text, one per line)" htmlFor="sec-steps" optional>
            <textarea id="sec-steps" value={stepsText} onChange={(e) => setStepsText(e.target.value)} rows={6} className={`${fieldInputClasses} resize-y font-mono`} />
          </Field>
        ) : null}
        <FormError message={error} />
        <FormSaved show={saved} />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {busy ? "Saving…" : `Save “${key}” section`}
        </button>
      </form>
    </div>
  );
}
