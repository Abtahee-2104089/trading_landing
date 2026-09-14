import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";

const pillars = [
  {
    title: "Verified suppliers only",
    text: "Every factory and wholesaler passes trade-license, export-history, and sample checks before listing.",
  },
  {
    title: "Pre-shipment QC",
    text: "Photos, videos, and third-party inspection reports shared before you release the balance payment.",
  },
  {
    title: "Transparent pricing",
    text: "Itemised quotes: product cost, freight, customs, and margin — no hidden markups.",
  },
  {
    title: "Compliant documentation",
    text: "Invoices, packing lists, certificates of origin, and municipality approvals handled for you.",
  },
];

const assurances = [
  "No invented certifications, clients, or volumes — placeholder copy until verified",
  "Inspection evidence shared before payment release",
  "Verified credentials and references shared on request",
];

/**
 * Trust & Compliance — credible placeholder copy only.
 * Content rule: never invent certifications, clients, volumes, awards,
 * statistics, or partnerships. Numbers appear here only after verification.
 */
export default function Trust() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="scroll-mt-20 bg-cream-100 py-16 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="Trust & compliance"
          headingId="trust-heading"
          title="Built on Reliability and Compliance"
          description="Importing is risky when you can't see the goods. We close that gap with inspection evidence, clear paperwork, and dependable supply relationships — and we make no claims we can't prove."
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
          {assurances.map((item) => (
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
