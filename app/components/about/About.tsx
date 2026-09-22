"use client";

import Image from "next/image";
import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Button from "@/app/components/ui/Button";
import { useCmsSection, useCmsSite } from "@/lib/hooks/useCmsContent";

/**
 * About + UAE Advantage — CMS-driven (Orny, Frontend A).
 *
 * Eyebrow / headline / body / advantage cards come from
 * `sections[key=about]`; the visual comes from `aboutImageUrl`
 * (Convex Storage) with the local hub graphic as fallback.
 */
export default function About() {
  const { section } = useCmsSection("about");
  const { site } = useCmsSite();
  const advantages = section.items ?? [];
  const imageSrc = site.aboutImageUrl ?? "/images/about-uae-hub.svg";

  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-20 bg-cream-50 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow={section.eyebrow}
          headingId="about-heading"
          title={section.headline}
          description={section.body}
          align="center"
          className="mx-auto text-center"
        />
        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {advantages.map((item: { title: string; text: string }) => (
                <li
                  key={item.title}
                  className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <h3 className="flex items-center gap-2 text-[15px] font-semibold text-navy-950">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white"
                    >
                      ✓
                    </span>
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {item.text}
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="#contact" variant="navy" size="lg">
                {site.primaryCta}
              </Button>
              <Button href="#network" variant="outline-dark" size="lg">
                How we deliver
              </Button>
            </div>
          </div>

          <div>
            <div className="overflow-hidden rounded-2xl border border-navy-900/10 shadow-xl shadow-navy-950/10">
              <Image
                src={imageSrc}
                alt="Stylised map showing the UAE connected to Asia sourcing, Europe, Africa, and GCC markets"
                width={800}
                height={560}
                loading="lazy"
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="h-auto w-full"
              />
            </div>
            <p className="mt-4 rounded-xl border border-gold-500/30 bg-gold-300/15 px-4 py-3 text-sm leading-relaxed text-navy-900">
              <span className="font-semibold">Why it matters: </span>
              cargo already flows through the UAE — we put your goods on those
              lanes with vetted suppliers and paperwork done right.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
