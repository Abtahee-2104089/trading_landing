const categories = [
  {
    title: "Electronics & Electrical",
    description: "Sourced consumer electronics, components, and electrical goods with QC checks before dispatch.",
    items: ["Consumer electronics", "Mobile accessories", "Electrical fittings"],
  },
  {
    title: "Foodstuff & Agro Commodities",
    description: "Bulk and packaged food trading with cold-chain partners and documentation handled end to end.",
    items: ["Rice, sugar & oils", "Spices & pulses", "Packaged foods"],
  },
  {
    title: "Textiles & Garments",
    description: "Fabrics, apparel, and home textiles from vetted mills across Asia, routed via Jebel Ali.",
    items: ["Fabrics & yarn", "Ready-made garments", "Home textiles"],
  },
  {
    title: "Building Materials & Hardware",
    description: "Construction supply for GCC projects — consolidated shipments to cut freight cost per unit.",
    items: ["Sanitary & tiles", "Hardware & tools", "MEP supplies"],
  },
  {
    title: "Cosmetics & Personal Care",
    description: "Compliant beauty and personal-care imports with labelling and municipality requirements covered.",
    items: ["Skincare & haircare", "Fragrances", "Hygiene essentials"],
  },
  {
    title: "Auto Parts & Industrial",
    description: "Genuine and aftermarket parts plus industrial consumables for fleets and workshops.",
    items: ["Spare parts", "Lubricants", "Industrial consumables"],
  },
];

export default function TradingCategories() {
  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold tracking-widest text-emerald-700 uppercase">
          What we trade
        </p>
        <h2
          id="categories-heading"
          className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl"
        >
          Trading categories
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-600">
          Six core verticals with vetted suppliers, consolidated shipping, and
          quality inspection — so you can order mixed containers with confidence.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <article
              key={category.title}
              className="group flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50 p-6 transition-shadow duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-emerald-600 focus-within:ring-offset-2"
            >
              <h3 className="text-lg font-semibold text-neutral-900">
                {category.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                {category.description}
              </p>
              <ul className="mt-4 space-y-1.5 text-sm text-neutral-700">
                {category.items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600"
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="mt-5 inline-flex w-fit items-center gap-1 text-sm font-semibold text-emerald-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 focus-visible:outline-none rounded-sm"
              >
                Enquire about this category
                <span aria-hidden="true">→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
