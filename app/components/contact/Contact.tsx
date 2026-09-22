"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useSubmitInquiry } from "@/lib/hooks/useSubmitInquiry";
import {
  INQUIRY_CATEGORIES,
  matchCategorySlug,
  type InquiryCategory,
} from "@/lib/schemas/inquiry";
import { useCmsContact, useCmsSection, useCmsSiteMeta } from "@/lib/hooks/useCmsContent";

const inputClasses =
  "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

/** Read `#contact?category=<slug>` (or `?category=`) from the URL. */
function categoryFromUrl(): InquiryCategory | null {
  if (typeof window === "undefined") return null;
  // Hash form is `#contact?category=<slug>` — parse the query part after `?`
  // so extra params (e.g. `#contact?category=x&foo=1`) don't leak into the slug.
  const hash = window.location.hash;
  const qIndex = hash.indexOf("?");
  const hashCategory =
    qIndex >= 0
      ? new URLSearchParams(hash.slice(qIndex + 1)).get("category")
      : null;
  const searchCategory = new URLSearchParams(window.location.search).get("category");
  const raw = hashCategory ?? searchCategory;
  if (!raw) return null;
  try {
    return matchCategorySlug(decodeURIComponent(raw));
  } catch {
    return null;
  }
}

/** Final CTA + inquiry form — CMS-driven, low-friction, measurable. */
export default function Contact() {
  const { status, error, submit, reset } = useSubmitInquiry();
  const { contact } = useCmsContact();
  const { section } = useCmsSection("contact");
  const { primaryCta } = useCmsSiteMeta();
  const [category, setCategory] = useState<InquiryCategory>(INQUIRY_CATEGORIES[0]);
  const [preselected, setPreselected] = useState(false);
  const successRef = useRef<HTMLHeadingElement>(null);

  // P1-2: category preselect from card links + live hash changes.
  // Handles: initial load with `#contact?category=` (which never natively
  // scrolls — no element has that id — so we scroll manually), subsequent
  // hash changes, and re-clicks on the same category (custom event, since
  // setting an identical hash fires no hashchange).
  useEffect(() => {
    const applyFromUrl = () => {
      const match = categoryFromUrl();
      if (match) {
        setCategory(match);
        setPreselected(true);
      }
    };
    const applyFromEvent = (event: Event) => {
      const slug = (event as CustomEvent<string>).detail;
      if (typeof slug !== "string" || !slug) return;
      try {
        const match = matchCategorySlug(decodeURIComponent(slug));
        if (match) {
          setCategory(match);
          setPreselected(true);
        }
      } catch {
        // Invalid slug — leave the current selection untouched.
      }
    };
    applyFromUrl();
    if (
      typeof window !== "undefined" &&
      (window.location.hash.includes("category=") ||
        new URLSearchParams(window.location.search).has("category"))
    ) {
      document
        .getElementById("contact")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    window.addEventListener("hashchange", applyFromUrl);
    window.addEventListener(
      "contact:select-category",
      applyFromEvent as EventListener,
    );
    return () => {
      window.removeEventListener("hashchange", applyFromUrl);
      window.removeEventListener(
        "contact:select-category",
        applyFromEvent as EventListener,
      );
    };
  }, []);

  // P1-5: move keyboard/screen-reader focus to the success heading.
  useEffect(() => {
    if (status === "success") successRef.current?.focus();
  }, [status]);

  // P0-4: analytics conversion — fires once per successful enquiry.
  useEffect(() => {
    if (status === "success") {
      try {
        (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag?.(
          "event",
          "generate_lead",
          { category },
        );
        (window as unknown as { plausible?: (...args: unknown[]) => void }).plausible?.(
          "Lead",
          { props: { category } },
        );
      } catch {
        // Analytics must never break the form.
      }
    }
  }, [status, category]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const ok = await submit({
      name: String(data.get("name") ?? ""),
      company: String(data.get("company") ?? ""),
      email: String(data.get("email") ?? ""),
      phone: String(data.get("phone") ?? ""),
      category,
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
    });
    if (ok) form.reset();
  }

  const isSubmitting = status === "submitting";
  const whatsappHref = contact.whatsappHref?.trim() || null;

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow={section.eyebrow}
            headingId="contact-heading"
            title={section.headline}
            description={contact.responseNote ?? section.body}
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
              {whatsappHref ? (
                <a
                  href={
                    whatsappHref.startsWith("http")
                      ? whatsappHref
                      : `https://wa.me/${whatsappHref.replace(/\D/g, "")}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 inline-flex items-center gap-1 rounded-full border border-teal-700/30 bg-teal-700/5 px-3 py-1 text-xs font-semibold text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
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
              <h3 ref={successRef} tabIndex={-1} className="text-xl font-semibold text-navy-950 focus:outline-none">
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

              {/* P0-1 honeypot: real users never fill this; bots do. */}
              <input
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                defaultValue=""
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
                    placeholder="+971 5X XXX XXXX"
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
                  onChange={(event) => {
                    setCategory(event.target.value as InquiryCategory);
                    setPreselected(false);
                  }}
                  className={`${inputClasses}${preselected ? " ring-2 ring-teal-700 ring-offset-2" : ""}`}
                >
                  {INQUIRY_CATEGORIES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {preselected ? (
                  <p aria-live="polite" className="mt-1.5 text-xs font-medium text-teal-700">
                    Preselected from the category you chose — change it if needed.
                  </p>
                ) : null}
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

              {error && (
                <p role="alert" className="mt-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-5 w-full rounded-lg bg-gold-500 px-4 py-3 text-sm font-semibold text-navy-950 transition-colors hover:bg-gold-400 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto sm:px-8"
              >
                {isSubmitting ? "Sending…" : primaryCta}
              </button>
              <p className="mt-3 text-xs text-slate-500">
                We reply within one business day with price, lead time, and shipping options.
              </p>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
