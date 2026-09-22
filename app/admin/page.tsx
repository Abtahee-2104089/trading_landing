"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { adminAuthArgs } from "@/lib/admin-token";

const cards = [
  { href: "/admin/site", title: "Site text & contact", text: "Name, tagline, CTAs, footer copy, office / email / phone / hours / WhatsApp." },
  { href: "/admin/sections", title: "Page sections", text: "Hero, about, network, trust, contact, footer headlines + bodies." },
  { href: "/admin/products", title: "Products", text: "Trading-category cards: title, slug, items, image, order, publish toggle." },
  { href: "/admin/services", title: "Services", text: "Global-network capabilities: title, description, meta, order." },
  { href: "/admin/media", title: "Media library", text: "Upload images (≤5 MB), copy URLs, attach to products and sections." },
  { href: "/admin/inquiries", title: "Inquiries", text: "Read-only lead table + status (new / contacted / qualified / closed)." },
];

/** CMS dashboard: links + live counts. */
export default function AdminDashboard() {
  const configured = isConvexConfigured();
  const products = useQuery(api.cms.listProductsAdmin, configured ? adminAuthArgs() : "skip");
  const services = useQuery(api.cms.listServicesAdmin, configured ? adminAuthArgs() : "skip");

  return (
    <div>
      <h1 className="text-2xl font-bold">CMS dashboard</h1>
      <p className="mt-1 text-sm text-slate-600">
        Every text, image, product, service, and address on the site is editable
        here. {products ? `${products.length} products` : "…"}
        {" · "}
        {services ? `${services.length} services` : "…"}
      </p>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <a
            key={card.href}
            href={card.href}
            className="rounded-2xl border border-navy-900/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
          >
            <h2 className="font-semibold">{card.title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">{card.text}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
