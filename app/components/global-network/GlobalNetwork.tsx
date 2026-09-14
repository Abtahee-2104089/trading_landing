const hubs = [
  {
    region: "UAE Hub",
    detail: "Jebel Ali & Dubai — consolidation, QC, and re-export.",
    meta: "2–4 day GCC transit",
  },
  {
    region: "GCC & Middle East",
    detail: "Saudi Arabia, Oman, Qatar, Kuwait, Bahrain via land & sea.",
    meta: "DDP / DAP available",
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

const steps = [
  { step: "01", title: "Sourcing", text: "Vetted suppliers, samples, and price benchmarking." },
  { step: "02", title: "QC & Consolidation", text: "Inspection in origin or Jebel Ali before loading." },
  { step: "03", title: "Freight & Customs", text: "Sea, air, or land freight with clearance included." },
  { step: "04", title: "Last-mile Delivery", text: "GCC-wide delivery with tracking and POD." },
];

export default function GlobalNetwork() {
  return (
    <section
      id="network"
      aria-labelledby="network-heading"
      className="scroll-mt-20 bg-neutral-950 py-16 text-neutral-100 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-400 uppercase">
          Global network
        </p>
        <h2
          id="network-heading"
          className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          Dubai-rooted, region-wide
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          We consolidate at the UAE gateway and distribute across the GCC and
          beyond — one partner for sourcing, shipping, and clearance.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {hubs.map((hub) => (
            <article
              key={hub.region}
              tabIndex={0}
              className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 transition-colors duration-200 hover:border-emerald-500/60 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-950 focus-visible:outline-none"
            >
              <h3 className="text-lg font-semibold text-white">{hub.region}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                {hub.detail}
              </p>
              <p className="mt-4 inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                {hub.meta}
              </p>
            </article>
          ))}
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li
              key={s.step}
              className="rounded-2xl border border-neutral-800 p-6 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
            >
              <p className="text-sm font-bold text-emerald-400">{s.step}</p>
              <h3 className="mt-1 font-semibold text-white">{s.title}</h3>
              <p className="mt-1 text-sm text-neutral-400">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
