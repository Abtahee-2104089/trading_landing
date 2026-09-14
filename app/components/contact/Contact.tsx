"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useContactSubmit } from "./use-contact-submit";

const inputClasses =
  "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-60";

export default function Contact() {
  const { status, error, submit, reset } = useContactSubmit();
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      company: String(data.get("company") ?? "").trim(),
      category: String(data.get("category") ?? "").trim(),
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
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
            Contact
          </p>
          <h2
            id="contact-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
          >
            Get a quote in 24 hours
          </h2>
          <p className="mt-3 text-base text-neutral-600">
            Tell us what you want to import or export. We reply with price,
            lead time, and shipping options — no obligation.
          </p>
          <ul className="mt-6 space-y-3 text-sm text-neutral-700">
            <li>
              <span className="font-semibold">Email:</span>{" "}
              <a
                href="mailto:trade@example.ae"
                className="text-emerald-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
              >
                trade@example.ae
              </a>
            </li>
            <li>
              <span className="font-semibold">Phone / WhatsApp:</span>{" "}
              <a
                href="tel:+971400000000"
                className="text-emerald-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
              >
                +971 4 000 0000
              </a>
            </li>
            <li>
              <span className="font-semibold">Office:</span> Jebel Ali, Dubai,
              UAE
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 sm:p-8">
          {status === "success" ? (
            <div
              role="status"
              className="flex h-full flex-col items-start justify-center gap-3"
            >
              <h3 className="text-xl font-semibold text-neutral-900">
                Message received
              </h3>
              <p className="text-sm text-neutral-600">
                Thanks — our trading desk will reply within one business day.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-2 rounded-lg border border-neutral-300 px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-white focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate={false} aria-describedby="contact-desc">
              <p id="contact-desc" className="sr-only">
                Enquiry form. All fields marked required must be filled.
              </p>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="mb-1.5 block text-sm font-semibold text-neutral-800"
                  >
                    Full name <span aria-hidden="true">*</span>
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    placeholder="Ahmed Khan"
                    disabled={isSubmitting}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="mb-1.5 block text-sm font-semibold text-neutral-800"
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
                    className="mb-1.5 block text-sm font-semibold text-neutral-800"
                  >
                    Company{" "}
                    <span className="font-normal text-neutral-500">
                      (optional)
                    </span>
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
                    htmlFor="contact-category"
                    className="mb-1.5 block text-sm font-semibold text-neutral-800"
                  >
                    Category
                  </label>
                  <select
                    id="contact-category"
                    name="category"
                    disabled={isSubmitting}
                    defaultValue="General enquiry"
                    className={inputClasses}
                  >
                    <option>General enquiry</option>
                    <option>Electronics & Electrical</option>
                    <option>Foodstuff & Agro Commodities</option>
                    <option>Textiles & Garments</option>
                    <option>Building Materials & Hardware</option>
                    <option>Cosmetics & Personal Care</option>
                    <option>Auto Parts & Industrial</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label
                  htmlFor="contact-message"
                  className="mb-1.5 block text-sm font-semibold text-neutral-800"
                >
                  Message <span aria-hidden="true">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
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
                className="mt-5 w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto sm:px-8"
              >
                {isSubmitting ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
