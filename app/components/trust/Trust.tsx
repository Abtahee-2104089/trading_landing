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

const stats = [
  { value: "120+", label: "Vetted suppliers" },
  { value: "850+", label: "Containers moved" },
  { value: "14", label: "Countries served" },
  { value: "98%", label: "On-time delivery" },
];

export default function Trust() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      className="scroll-mt-20 bg-emerald-50 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
          Why trust us
        </p>
        <h2
          id="trust-heading"
          className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
        >
          Trade with a partner, not a middleman
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          Importing is risky when you can&apos;t see the goods. We close that
          gap with inspection evidence, clear paperwork, and escrow-friendly
          payment terms.
        </p>

        <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-neutral-950 p-6 text-center focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none"
              tabIndex={0}
            >
              <dt className="order-2 mt-1 text-sm text-neutral-400">
                {stat.label}
              </dt>
              <dd className="text-3xl font-bold text-white">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-2xl border border-emerald-900/10 bg-white p-6 shadow-sm transition-shadow duration-200 hover:shadow-md focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2"
            >
              <h3 className="flex items-center gap-2 font-semibold text-neutral-900">
                <span
                  aria-hidden="true"
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
                >
                  ✓
                </span>
                {pillar.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {pillar.text}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
