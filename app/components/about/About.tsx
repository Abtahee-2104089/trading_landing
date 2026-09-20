import Image from "next/image";
import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";
import Button from "@/app/components/ui/Button";

const advantages = [
  {
    title: "Gateway location",
    text: "Dubai sits between Asian supply and Middle East, Africa, and European demand — fewer legs, faster turns.",
  },
  {
    title: "Jebel Ali consolidation",
    text: "Combine mixed categories into full containers at one of the region's most connected ports.",
  },
  {
    title: "Clearance without delays",
    text: "Invoices, packing lists, certificates of origin, and municipality requirements handled for you.",
  },
  {
    title: "Re-export ready",
    text: "One partner for sourcing, QC, freight, and GCC-wide distribution — DDP/DAP where it helps.",
  },
];

/** About + UAE Advantage — who we are and why the UAE location matters. */
export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="scroll-mt-20 bg-cream-50 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="Who we are"
          headingId="about-heading"
          title="Your Strategic Trade Partner in the UAE"
          description="We are a Dubai-based general trading team helping retailers, wholesalers, and project buyers source quality goods, consolidate shipments at Jebel Ali, and clear customs without delays."
          align="center"
          className="mx-auto text-center"
        />
        <div className="mt-12 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {advantages.map((item) => (
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
              Request a Quote
            </Button>
            <Button href="#network" variant="outline-dark" size="lg">
              How we deliver
            </Button>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-2xl border border-navy-900/10 shadow-xl shadow-navy-950/10">
            <Image
              src="/images/about-uae-hub.svg"
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
