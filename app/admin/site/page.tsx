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

type Overrides = Partial<{
  siteName: string;
  tagline: string;
  primaryCta: string;
  footerAbout: string;
  office: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref: string;
  hours: string;
  responseNote: string;
}>;

export default function AdminSitePage() {
  const enabled = isConvexConfigured();
  const settings = useQuery(api.cms.getSiteSettings, enabled ? {} : "skip");
  const update = useMutation(api.cms.updateSiteSettings);
  const [overrides, setOverrides] = useState<Overrides>({});
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Inputs show CMS values until edited — no sync effect needed.
  type TopKey = "siteName" | "tagline" | "primaryCta" | "footerAbout";
  type ContactKey =
    | "office"
    | "email"
    | "phoneDisplay"
    | "phoneHref"
    | "whatsappHref"
    | "hours"
    | "responseNote";
  const val = (key: TopKey, fallback: string): string =>
    (overrides[key] as string | undefined) ??
    (settings?.[key] as string | undefined) ??
    fallback;
  const contactVal = (key: ContactKey, fallback: string): string =>
    (overrides[key] as string | undefined) ??
    (settings?.contact?.[key] as string | undefined) ??
    fallback;

  const form = {
    siteName: val("siteName", ""),
    tagline: val("tagline", ""),
    primaryCta: val("primaryCta", ""),
    footerAbout: val("footerAbout", ""),
    office: contactVal("office", ""),
    email: contactVal("email", ""),
    phoneDisplay: contactVal("phoneDisplay", ""),
    phoneHref: contactVal("phoneHref", ""),
    whatsappHref: contactVal("whatsappHref", ""),
    hours: contactVal("hours", ""),
    responseNote: contactVal("responseNote", ""),
  };

  function set(key: keyof Overrides) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      setSaved(false);
      setOverrides((o) => ({ ...o, [key]: e.target.value }));
    };
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!enabled) {
      setError("Backend not configured (NEXT_PUBLIC_CONVEX_URL).");
      return;
    }
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Contact email looks invalid.");
      return;
    }
    setBusy(true);
    try {
      await update({
        patch: {
          siteName: form.siteName,
          tagline: form.tagline,
          primaryCta: form.primaryCta,
          footerAbout: form.footerAbout,
          contact: {
            office: form.office,
            email: form.email,
            phoneDisplay: form.phoneDisplay,
            phoneHref: form.phoneHref,
            whatsappHref: form.whatsappHref,
            hours: form.hours,
            responseNote: form.responseNote,
          },
        },
      });
      setOverrides({});
      setSaved(true);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-950">Site text & contact</h2>
      <p className="mt-1 text-sm text-slate-600">
        Single source of truth for name, tagline, CTAs, footer, and the full
        contact block. Saving here updates the Navbar, Footer, Contact section,
        and JSON-LD at once.
      </p>
      <form
        onSubmit={onSubmit}
        className="mt-4 space-y-4 rounded-2xl border border-navy-900/10 bg-white p-5"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Site name" htmlFor="site-name">
            <input id="site-name" value={form.siteName} onChange={set("siteName")} className={fieldInputClasses} />
          </Field>
          <Field label="Primary CTA" htmlFor="site-cta">
            <input id="site-cta" value={form.primaryCta} onChange={set("primaryCta")} className={fieldInputClasses} />
          </Field>
        </div>
        <Field label="Tagline" htmlFor="site-tagline">
          <input id="site-tagline" value={form.tagline} onChange={set("tagline")} className={fieldInputClasses} />
        </Field>
        <Field label="Footer about" htmlFor="site-footer">
          <textarea id="site-footer" value={form.footerAbout} onChange={set("footerAbout")} rows={3} className={`${fieldInputClasses} resize-y`} />
        </Field>
        <div id="contact" className="grid scroll-mt-24 grid-cols-1 gap-4 border-t border-navy-900/10 pt-4 sm:grid-cols-2">
          <Field label="Office" htmlFor="site-office">
            <input id="site-office" value={form.office} onChange={set("office")} className={fieldInputClasses} />
          </Field>
          <Field label="Email" htmlFor="site-email">
            <input id="site-email" type="email" value={form.email} onChange={set("email")} className={fieldInputClasses} />
          </Field>
          <Field label="Phone display" htmlFor="site-phone">
            <input id="site-phone" value={form.phoneDisplay} onChange={set("phoneDisplay")} className={fieldInputClasses} />
          </Field>
          <Field label="Phone href (tel:)" htmlFor="site-phonehref">
            <input id="site-phonehref" value={form.phoneHref} onChange={set("phoneHref")} placeholder="tel:+971400000000" className={fieldInputClasses} />
          </Field>
          <Field label="WhatsApp href" htmlFor="site-wa" optional>
            <input id="site-wa" value={form.whatsappHref} onChange={set("whatsappHref")} placeholder="https://wa.me/971400000000" className={fieldInputClasses} />
          </Field>
          <Field label="Hours" htmlFor="site-hours" optional>
            <input id="site-hours" value={form.hours} onChange={set("hours")} className={fieldInputClasses} />
          </Field>
        </div>
        <Field label="Response promise" htmlFor="site-response" optional>
          <textarea id="site-response" value={form.responseNote} onChange={set("responseNote")} rows={2} className={`${fieldInputClasses} resize-y`} />
        </Field>
        <FormError message={error} />
        <FormSaved show={saved} />
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-navy-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-900 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {busy ? "Saving…" : "Save site settings"}
        </button>
      </form>
    </div>
  );
}
