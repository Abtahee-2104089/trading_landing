"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { adminAuthArgs } from "@/lib/admin-token";
import { Field, FormError, FormOk, PrimaryButton, fieldInput } from "@/app/components/admin/fields";
import ImageUploader from "@/app/components/admin/ImageUploader";

/**
 * `/admin/site` — one form for `siteSettings`.
 * This is where editors fix placeholder contacts (P0-2): office, email,
 * phone display/link, WhatsApp, hours, response note — plus site name,
 * tagline, description, primary CTA, footer copy.
 */
export default function AdminSitePage() {
  const configured = isConvexConfigured();
  const doc = useQuery(api.cms.getSiteSettings, configured ? {} : "skip");
  const update = useMutation(api.cms.updateSiteSettings);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    siteName: "",
    tagline: "",
    description: "",
    primaryCta: "",
    footerAbout: "",
    footerBottomBar: "",
    office: "",
    email: "",
    phoneDisplay: "",
    phoneHref: "",
    whatsappHref: "",
    hours: "",
    responseNote: "",
    heroImageUrl: "",
    aboutImageUrl: "",
  });
  const [initialized, setInitialized] = useState(false);

  // Render-time sync (sanctioned "adjust state during render" pattern):
  // populate the form once when the doc first arrives, never clobber typing.
  if (doc && !initialized) {
    setInitialized(true);
    setForm({
      siteName: doc.siteName,
      tagline: doc.tagline,
      description: doc.description,
      primaryCta: doc.primaryCta,
      footerAbout: doc.footer.about,
      footerBottomBar: doc.footer.bottomBar,
      office: doc.contact.office,
      email: doc.contact.email,
      phoneDisplay: doc.contact.phoneDisplay,
      phoneHref: doc.contact.phoneHref,
      whatsappHref: doc.contact.whatsappHref ?? "",
      hours: doc.contact.hours ?? "",
      responseNote: doc.contact.responseNote ?? "",
      heroImageUrl: doc.heroImageUrl ?? "",
      aboutImageUrl: doc.aboutImageUrl ?? "",
    });
  }

  function set(key: keyof typeof form) {
    return (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim().toLowerCase())) {
      setError("Contact email is not a valid email address.");
      return;
    }
    setBusy(true);
    try {
      await update({
        ...adminAuthArgs(),
        patch: {
          siteName: form.siteName,
          tagline: form.tagline,
          description: form.description,
          primaryCta: form.primaryCta,
          heroImageUrl: form.heroImageUrl.trim(),
          aboutImageUrl: form.aboutImageUrl.trim(),
          footer: { about: form.footerAbout, bottomBar: form.footerBottomBar },
          contact: {
            office: form.office,
            email: form.email,
            phoneDisplay: form.phoneDisplay,
            phoneHref: form.phoneHref,
            ...(form.whatsappHref.trim() ? { whatsappHref: form.whatsappHref.trim() } : {}),
            ...(form.hours.trim() ? { hours: form.hours.trim() } : {}),
            ...(form.responseNote.trim() ? { responseNote: form.responseNote.trim() } : {}),
          },
        },
      });
      setOk("Saved — refresh the homepage to see it live.");
    } catch {
      setError("Save failed. Check your connection and permissions.");
    } finally {
      setBusy(false);
    }
  }

  if (!configured) return <p className="text-sm text-slate-600">Backend not configured.</p>;
  if (!doc) return <p className="text-sm text-slate-600">Loading site settings…</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold">Site text & contact</h1>
      <p className="mt-1 text-sm text-slate-600">
        Single source of truth for name, tagline, CTAs, footer, and the contact
        block used by Navbar, Contact, Footer, and JSON-LD.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Site name" htmlFor="site-name">
          <input id="site-name" className={fieldInput} value={form.siteName} onChange={set("siteName")} required />
        </Field>
        <Field label="Tagline" htmlFor="site-tagline">
          <input id="site-tagline" className={fieldInput} value={form.tagline} onChange={set("tagline")} required />
        </Field>
        <Field label="Description" htmlFor="site-desc">
          <textarea id="site-desc" rows={3} className={fieldInput} value={form.description} onChange={set("description")} required />
        </Field>
        <Field label="Primary CTA label" htmlFor="site-cta">
          <input id="site-cta" className={fieldInput} value={form.primaryCta} onChange={set("primaryCta")} required />
        </Field>
        <Field label="Footer about" htmlFor="site-footer-about">
          <textarea id="site-footer-about" rows={2} className={fieldInput} value={form.footerAbout} onChange={set("footerAbout")} required />
        </Field>
        <Field label="Footer bottom bar" htmlFor="site-footer-bar">
          <input id="site-footer-bar" className={fieldInput} value={form.footerBottomBar} onChange={set("footerBottomBar")} required />
        </Field>

        <h2 id="contact" className="pt-2 text-lg font-bold">Contact block</h2>
        <Field label="Office" htmlFor="site-office">
          <input id="site-office" className={fieldInput} value={form.office} onChange={set("office")} required />
        </Field>
        <Field label="Email" htmlFor="site-email">
          <input id="site-email" type="email" className={fieldInput} value={form.email} onChange={set("email")} required />
        </Field>
        <Field label="Phone display" htmlFor="site-phone-display">
          <input id="site-phone-display" className={fieldInput} value={form.phoneDisplay} onChange={set("phoneDisplay")} required />
        </Field>
        <Field label="Phone link (tel:…)" htmlFor="site-phone-href">
          <input id="site-phone-href" className={fieldInput} value={form.phoneHref} onChange={set("phoneHref")} required />
        </Field>
        <Field label="WhatsApp (wa.me link or digits)" htmlFor="site-wa" hint="Shows a Chat on WhatsApp button beside the phone line.">
          <input id="site-wa" className={fieldInput} value={form.whatsappHref} onChange={set("whatsappHref")} placeholder="https://wa.me/971400000000" />
        </Field>
        <Field label="Hours" htmlFor="site-hours">
          <input id="site-hours" className={fieldInput} value={form.hours} onChange={set("hours")} placeholder="Sun–Thu, 9:00–18:00 GST" />
        </Field>
        <Field label="Response note" htmlFor="site-response">
          <textarea id="site-response" rows={2} className={fieldInput} value={form.responseNote} onChange={set("responseNote")} />
        </Field>

        <FormError message={error} />
        <FormOk message={ok} />

        <h2 className="pt-2 text-lg font-bold">Hero & about images</h2>
        <p className="text-sm text-slate-600">
          Upload (UploadThing), replace, or remove. Removing falls back to the
          built-in graphics.
        </p>
        <ImageUploader
          usedBy="site/hero"
          currentUrl={form.heroImageUrl || null}
          onUploaded={({ url }) => setForm((f) => ({ ...f, heroImageUrl: url }))}
          onRemove={() => setForm((f) => ({ ...f, heroImageUrl: "" }))}
        />
        <ImageUploader
          usedBy="site/about"
          currentUrl={form.aboutImageUrl || null}
          onUploaded={({ url }) => setForm((f) => ({ ...f, aboutImageUrl: url }))}
          onRemove={() => setForm((f) => ({ ...f, aboutImageUrl: "" }))}
        />

        <PrimaryButton disabled={busy}>{busy ? "Saving…" : "Save site settings"}</PrimaryButton>
      </form>
    </div>
  );
}
