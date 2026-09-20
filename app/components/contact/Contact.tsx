"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useSubmitInquiry } from "@/lib/hooks/useSubmitInquiry";
import { useSections, useSiteSettings } from "@/lib/hooks/useSiteContent";
import {
  INQUIRY_CATEGORIES,
  slugToCategory,
  type InquiryInput,
} from "@/lib/schemas/inquiry";

const inputClasses =
  "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    plausible?: (...args: unknown[]) => void;
  }
}

/** Read `#contact?category=<slug>` / `?category=` preselection (SSR-safe). */
function initialCategory(): string {
  if (typeof window === "undefined") return INQUIRY_CATEGORIES[0];
  const fromHash = window.location.hash.includes("category=")
    ? window.location.hash.split("category=")[1]?.split("&")[0]
    : null;
  const fromSearch = new URLSearchParams(window.location.search).get(
    "category",
  );
  return slugToCategory(fromHash ?? fromSearch) ?? INQUIRY_CATEGORIES[0];
}

/** Final CTA + inquiry form — low-friction, one primary CTA, clear response expectation. */
export default function Contact() {
  const { status, error, submit, reset } = useSubmitInquiry();
  const { data: siteSettings } = useSiteSettings();
  const { byKey } = useSections();
  const contactSection = byKey("contact");
  const [formError, setFormError] = useState<string | null>(null);
  const [category, setCategory] = useState<string>(initialCategory);
  const successRef = useRef<HTMLHeadingElement>(null);

  // P1-5: move focus to the success heading so screen readers announce it.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  // P0-4: fire the conversion event once per successful submit.
  useEffect(() => {
    if (status === "success") {
      window.gtag?.("event", "generate_lead", { category });
      window.plausible?.("Lead");
    }
  }, [status, category]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload: InquiryInput = {
      name: String(data.get("name") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      // The <select> only offers INQUIRY_CATEGORIES; the hook re-validates
      // with inquirySchema and surfaces "Please choose a valid category."
      // if DevTools tampers with the value.
      category: String(
        data.get("category") ?? category,
      ).trim() as InquiryInput["category"],
      message: String(data.get("message") ?? "").trim(),
      website: String(data.get("website") ?? ""),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setFormError("Please fill in your name, email, and message.");
      return;
    }

    const ok = await submit(payload);
    if (ok) {
      form.reset();
      setCategory(INQUIRY_CATEGORIES[0]);
    }
  }

  const isSubmitting = status === "submitting";
  const contact = siteSettings.contact;
  const responseNote =
    contact.responseNote ??
    contactSection?.body ??
    "Our trading desk replies within one business day with price, lead time, and shipping options — no obligation.";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={contactSection?.eyebrow ?? "Final CTA"}
            headingId="contact-heading"
            title={contactSection?.headline ?? "Let's Talk Trade"}
            description={contactSection?.body ?? "Tell us what you want to import or export. " + responseNote}
          />
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-navy-950">Email:</span>{" "}
              <a
                href={`mailto:${contact.email}`}
                className="rounded-sm text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {contact.email}
              </a>
            </li>
            <li>
              <span className="font-semibold text-navy-950">Phone / WhatsApp:</span>{" "}
              <a
                href={contact.phoneHref}
                className="rounded-sm text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {contact.phoneDisplay}
              </a>
              {contact.whatsappHref ? (
                <a
                  href={contact.whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-3 inline-flex items-center gap-1 rounded-lg border border-teal-700/30 px-3 py-1 text-xs font-semibold text-teal-700 hover:bg-teal-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                  Chat on WhatsApp
                  <span aria-hidden="true">→</span>
                </a>
              ) : null}
            </li>
            <li>
              <span className="font-semibold text-navy-950">Office:</span>{" "}
              {contact.office}
            </li>
            {contact.hours ? (
              <li>
                <span className="font-semibold text-navy-950">Hours:</span>{" "}
                {contact.hours}
              </li>
            ) : null}
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-900/10 bg-cream-50 p-6 sm:p-8">
          {status === "success" ? (
            <div
              role="status"
              className="flex h-full flex-col items-start justify-center gap-3"
            >
              <h3
                ref={successRef}
                tabIndex={-1}
                className="text-xl font-semibold text-navy-950 focus:outline-none"
              >
                Message received
              </h3>
              <p className="text-sm text-slate-600">
                Thanks — our trading desk will reply within one business day.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 rounded-lg border border-navy-900/15 bg-white px-4 py-2 text-sm font-semibold text-navy-900 hover:bg-navy-50 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate aria-describedby="contact-desc">
              <p id="contact-desc" className="sr-only">
                Enquiry form. Name, email, and message are required.
              </p>

              {/* Honeypot (P0-1): hidden from humans, bots fill it. */}
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-semibold text-navy-950"
                  >
                    Full name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    minLength={2}
                    placeholder="Ahmed Khan"
                    disabled={isSubmitting}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-semibold text-navy-950"
                  >
                    Email <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@company.com"
                    disabled={isSubmitting}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-company"
                    className="mb-1.5 block text-sm font-semibold text-navy-950"
                  >
                    Company{" "}
                    <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="contact-company"
                    name="company"
                    type="text"
                    autoComplete="organization"
                    placeholder="Company LLC"
                    disabled={isSubmitting}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-phone"
                    className="mb-1.5 block text-sm font-semibold text-navy-950"
                  >
                    Phone{" "}
                    <span className="font-normal text-slate-500">(optional)</span>
                  </label>
                  <input
                    id="contact-phone"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+971 4 000 0000"
                    disabled={isSubmitting}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-category"
                  className="mb-1.5 block text-sm font-semibold text-navy-950"
                >
                  Requirement / category
                </label>
                <select
                  id="contact-category"
                  name="category"
                  disabled={isSubmitting}
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClasses}
                >
                  {INQUIRY_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-navy-950"
                >
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  minLength={10}
                  rows={5}
                  placeholder="Product, quantity, destination city…"
                  disabled={isSubmitting}
                  className={`${inputClasses} resize-y`}
                />
              </div>

              {(formError || error) && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                  {formError ?? error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto sm:px-8"
              >
                {isSubmitting ? "Sending…" : siteSettings.primaryCta}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                {responseNote}
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
