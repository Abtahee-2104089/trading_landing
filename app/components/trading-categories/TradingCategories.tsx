"use client";

import Image from "next/image";
import { useCmsProducts, useCmsSection } from "@/lib/hooks/useCmsContent";

/**
 * Trading Categories (= products) — CMS-driven (Pal, Frontend B).
 *
 * Renders `products.listPublished` (title/desc/items/image/alt). Falls back
 * to verbatim live copy when CMS is empty/backend missing. Empty CMS with a
 * live backend shows "No categories published yet." (no crash).
 *
 * P1-2: every Enquire link preselects the category in #contact via
 * `#contact?category=<slug>` (Contact reads hash + search param).
 */
export default function TradingCategories() {
  const { products, isLive } = useCmsProducts();
  const { section } = useCmsSection("categories");

  return (
    <section
      id="categories"
      aria-labelledby="categories-heading"
      className="scroll-mt-20 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold tracking-widest text-teal-700 uppercase">
            {section.eyebrow}
          </p>
          <h2
            id="categories-heading"
            className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl"
          >
            {section.headline}
          </h2>
          <p className="mt-3 text-base text-slate-600">{section.body}</p>
        </div>

        {isLive && products.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No categories published yet.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((category) => {
              const src = category.imageUrl ?? category.imageUrlFallback ?? "/categories/electronics.jpg";
              return (
                <article
                  key={category.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-navy-900/10 bg-cream-50 transition-shadow duration-200 hover:shadow-lg focus-within:ring-2 focus-within:ring-teal-700 focus-within:ring-offset-2"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-navy-50">
                    <Image
                      src={src}
                      alt={category.alt}
                      fill
                      loading="lazy"
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
                      href={`#contact?category=${encodeURIComponent(category.slug)}`}
                      className="mt-5 inline-flex w-fit items-center gap-1 rounded-sm text-sm font-semibold text-teal-700 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:outline-none"
                    >
                      Enquire about this category
                      <span aria-hidden="true">→</span>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
