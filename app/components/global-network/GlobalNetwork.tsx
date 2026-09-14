import Container from "@/app/components/ui/Container";
import SectionHeading from "@/app/components/ui/SectionHeading";

const hubs = [
  {
    region: "UAE Hub",
    detail: "Jebel Ali & Dubai — consolidation, QC, and re-export.",
    meta: "GCC transit via land & sea",
  },
  {
    region: "GCC & Middle East",
    detail: "Saudi Arabia, Oman, Qatar, Kuwait, Bahrain via land & sea.",
    meta: "DDP / DAP where it helps",
  },
  {
    region: "Asia Sourcing",
    detail: "India, China, Vietnam, Thailand — factory-direct procurement.",
    meta: "Mixed-container loading",
  },
  {
    region: "Africa & Europe",
    detail: "East Africa corridors plus EU supplier onboarding on request.",
    meta: "Docs & compliance handled",
  },
];

/** Spec journey: sourcing → coordination → logistics → documentation → distribution. */
const steps = [
  { step: "01", title: "Sourcing", text: "Vetted suppliers, samples, and price benchmarking." },
  { step: "02", title: "Coordination & QC", text: "Inspection in origin or Jebel Ali before loading." },
  { step: "03", title: "Logistics", text: "Sea, air, or land freight consolidated at Jebel Ali." },
  { step: "04", title: "Documentation", text: "Invoices, packing lists, certificates of origin, clearance." },
  { step: "05", title: "Distribution", text: "GCC-wide delivery with tracking and proof of delivery." },
];

/** Global Network — one connected journey from source to final market. */
export default function GlobalNetwork() {
  return (
    <section
      id="network"
      aria-labelledby="network-heading"
      className="scroll-mt-20 bg-navy-950 py-16 text-slate-200 sm:py-20"
    >
      <Container>
        <SectionHeading
          eyebrow="Global network"
          headingId="network-heading"
          title="From Global Source to Final Market"
          description="We consolidate at the UAE gateway and distribute across the GCC and beyond — one partner for sourcing, shipping, and clearance."
          dark
        />

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hubs.map((hub) => (
            <article
              key={hub.region}
              tabIndex={0}
              className="rounded-2xl border border-white/10 bg-navy-900 p-6 transition-colors duration-200 hover:border-gold-400/60 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 focus-visible:outline-none"
            >
              <h3 className="text-lg font-semibold text-white">{hub.region}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {hub.detail}
              </p>
              <p className="mt-4 inline-block rounded-full bg-gold-500/15 px-3 py-1 text-xs font-semibold text-gold-300">
                {hub.meta}
              </p>
            </article>
          ))}
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:outline-none"
            >
              <p className="text-sm font-bold text-gold-400">{s.step}</p>
              <h3 className="mt-1 font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-slate-300">{s.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
