"use client";

import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import {
  FALLBACK_NETWORK_STEPS,
  useCmsSection,
  useCmsServices,
} from "@/lib/hooks/useCmsContent";

/**
 * Global Network — CMS-driven (Pal, Frontend B).
 *
 * Journey steps come from `sections[key=network].items`; capability cards
 * come from `services.listPublished`. Falls back to verbatim live copy.
 *
 * P1-5: `tabIndex={0}` removed from non-interactive cards — tab order now
 * skips them (only links/buttons stop).
 */
export default function GlobalNetwork() {
  const { section } = useCmsSection("network");
  const { services } = useCmsServices();

  const steps =
    section.items && section.items.length > 0
      ? section.items
      : FALLBACK_NETWORK_STEPS;

  return (
    <section
      id="network"
      aria-labelledby="network-heading"
      className="scroll-mt-20 bg-navy-950 py-16 text-slate-200 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          headingId="network-heading"
          title={section.headline}
          description={section.body}
          dark
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((hub) => (
            <article
              key={hub.title}
              className="rounded-2xl border border-white/10 bg-navy-900 p-6 transition-colors duration-200 hover:border-gold-400/60"
            >
              <h3 className="text-lg font-semibold text-white">{hub.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {hub.description}
              </p>
              {hub.meta ? (
                <p className="mt-4 inline-block rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-300">
                  {hub.meta}
                </p>
              ) : null}
            </article>
          ))}
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <li
              key={`${s.meta ?? ""}-${s.title}`}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              {s.meta ? (
                <p className="text-sm font-bold text-gold-400">{s.meta}</p>
              ) : null}
              <h3 className="mt-1 font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
