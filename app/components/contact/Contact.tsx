"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import { useSubmitInquiry } from "@/lib/hooks/useSubmitInquiry";
import { INQUIRY_CATEGORIES, type InquiryInput } from "@/lib/types/inquiry";
import { site } from "@/lib/site";

const inputClasses =
  "w-full rounded-lg border border-navy-900/15 bg-white px-4 py-2.5 text-sm text-navy-950 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

/** Final CTA + inquiry form — low-friction, one primary CTA, clear response expectation. */
export default function Contact() {
  const { status, error, submit, reset } = useSubmitInquiry();
  const [formError, setFormError] = useState<string | null>(null);

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
      category: String(data.get("category") ?? "General enquiry").trim(),
      message: String(data.get("message") ?? "").trim(),
    };

    if (!payload.name || !payload.email || !payload.message) {
      setFormError("Please fill in your name, email, and message.");
      return;
    }

    const ok = await submit(payload);
    if (ok) {
      form.reset();
    }
  }

  const isSubmitting = status === "submitting";

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <Container className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Final CTA"
            headingId="contact-heading"
            title="Let's Talk Trade"
            description="Tell us what you want to import or export. Our trading desk replies within one business day with price, lead time, and shipping options — no obligation."
          />
          <ul className="mt-6 space-y-3 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-navy-950">Email:</span>{" "}
              <a
                href={`mailto:${site.contact.email}`}
                className="rounded-sm text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {site.contact.email}
              </a>
            </li>
            <li>
              <span className="font-semibold text-navy-950">Phone / WhatsApp:</span>{" "}
              <a
                href={site.contact.phoneHref}
                className="rounded-sm text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                {site.contact.phoneDisplay}
              </a>
            </li>
            <li>
              <span className="font-semibold text-navy-950">Office:</span>{" "}
              {site.contact.office}
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-navy-900/10 bg-cream-50 p-6 sm:p-8">
          {status === "success" ? (
            <div
              role="status"
              className="flex h-full flex-col items-start justify-center gap-3"
            >
              <h3 className="text-xl font-semibold text-navy-950">
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
            <form onSubmit={handleSubmit} noValidate={false} aria-describedby="contact-desc">
              <p id="contact-desc" className="sr-only">
                Enquiry form. Name, email, and message are required.
              </p>

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
                  defaultValue={INQUIRY_CATEGORIES[0]}
                  className={inputClasses}
                >
                  {INQUIRY_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
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
                {isSubmitting ? "Sending…" : site.primaryCta}
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
