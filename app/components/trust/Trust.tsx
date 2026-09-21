"use client";

import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import {
  FALLBACK_TRUST_ASSURANCES,
  FALLBACK_TRUST_PILLARS,
  useCmsSection,
} from "@/lib/hooks/useCmsContent";

/**
 * Trust & Compliance — CMS-driven (Pal, Frontend B).
 *
 * Eyebrow/headline/body/pillars come from `sections[key=trust]`.
 * Content rule: never invent certifications, clients, volumes, awards,
 * statistics, or partnerships — numbers appear only after verification
 * via `/admin/sections#trust`.
 *
 * P1-3: the hardcoded placeholder disclaimer line ("No invented
 * certifications … placeholder copy until verified") is DELETED and must
 * never ship — assurances below are neutral, verifiable statements.
 */
export default function Trust() {
  const { section } = useCmsSection("trust");

  const pillars =
    section.items && section.items.length > 0
      ? section.items.filter((item) => item.meta !== "stat")
      : FALLBACK_TRUST_PILLARS;

  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="scroll-mt-20 bg-cream-100 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          headingId="trust-heading"
          title={section.headline}
          description={section.body}
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-navy-900/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2"
            >
              <h3 className="flex items-center gap-2 font-semibold text-navy-950">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white"
                >
                  ✓
                </span>
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>

        <ul className="mt-6 rounded-2xl border border-gold-500/30 bg-gold-300/15 p-6 text-sm leading-relaxed text-navy-900">
          {FALLBACK_TRUST_ASSURANCES.map((item) => (
            <li key={item} className="flex items-start gap-2 py-1">
              <span aria-hidden="true" className="font-bold text-gold-600">·</span>
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
