"use client";

import Image from "next/image";
import { useProducts } from "@/lib/hooks/useSiteContent";
import { categoryToSlug } from "@/lib/schemas/inquiry";

const fallbackCategories = [
  {
    title: "Electronics & Electrical",
    slug: "electronics-electrical",
    description: "Sourced consumer electronics, components, and electrical goods with QC checks before dispatch.",
    items: ["Consumer electronics", "Mobile accessories", "Electrical fittings"],
    image: "/categories/electronics.jpg",
    alt: "Consumer electronics and electrical goods",
  },
  {
    title: "Foodstuff & Agro Commodities",
    slug: "foodstuff-agro-commodities",
    description: "Bulk and packaged food trading with cold-chain partners and documentation handled end to end.",
    items: ["Rice, sugar & oils", "Spices & pulses", "Packaged foods"],
    image: "/categories/foodstuff-agro.jpg",
    alt: "Bulk foodstuff and agro commodities",
  },
  {
    title: "Textiles & Garments",
    slug: "textiles-garments",
    description: "Fabrics, apparel, and home textiles from vetted mills across Asia, routed via Jebel Ali.",
    items: ["Fabrics & yarn", "Ready-made garments", "Home textiles"],
    image: "/categories/textiles-garments.jpg",
    alt: "Colorful textile rolls and garments",
  },
  {
    title: "Building Materials & Hardware",
    slug: "building-materials-hardware",
    description: "Construction supply for GCC projects — consolidated shipments to cut freight cost per unit.",
    items: ["Sanitary & tiles", "Hardware & tools", "MEP supplies"],
    image: "/categories/building-materials.jpg",
    alt: "Building materials and hardware supplies",
  },
  {
    title: "Cosmetics & Personal Care",
    slug: "cosmetics-personal-care",
    description: "Compliant beauty and personal-care imports with labelling and municipality requirements covered.",
    items: ["Skincare & haircare", "Fragrances", "Hygiene essentials"],
    image: "/categories/cosmetics-personal-care.jpg",
    alt: "Cosmetics and personal care products",
  },
  {
    title: "Auto Parts & Industrial",
    slug: "auto-parts-industrial",
    description: "Genuine and aftermarket parts plus industrial consumables for fleets and workshops.",
    items: ["Spare parts", "Lubricants", "Industrial consumables"],
    image: "/categories/auto-parts-industrial.jpg",
    alt: "Auto parts and industrial components",
  },
];

export default function TradingCategories() {
  const { data } = useProducts();
  // CMS when seeded; hardcoded fallback when empty/offline. Never blank.
  const categories =
    data === undefined || data.length === 0
      ? fallbackCategories
      : data.map((p) => ({
          title: p.title,
          slug: p.slug || categoryToSlug(p.title),
          description: p.description,
          items: p.items,
          image: p.imageUrl ?? "/categories/electronics.jpg",
          alt: p.alt ?? p.title,
        }));
  const isEmpty = data !== undefined && data.length === 0;

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-700 uppercase">
            What we trade
          </p>
          <h2
            id="categories-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl"
          >
            What We Trade
          </h2>
          <p className="mt-3 text-base text-slate-600">
            Six core verticals with vetted suppliers, consolidated shipping, and
            quality inspection — so you can order mixed containers with confidence.
          </p>
        </div>

        {isEmpty ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No categories published yet.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <article
                key={category.slug || category.title}
                className="group flex flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-cream-50 transition-shadow duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2"
              >
                <div className="relative h-48 w-full overflow-hidden bg-navy-50">
                  <Image
                    src={category.image}
                    alt={category.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-lg font-semibold text-navy-950">
                    {category.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {category.description}
                  </p>
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-700">
                    {category.items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span
                          aria-hidden="true"
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-700"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`#contact?category=${encodeURIComponent(category.slug || categoryToSlug(category.title))}`}
                    className="mt-5 inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    Enquire about this category
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
