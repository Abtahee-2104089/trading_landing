"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";

const cards = [
  { href: "/admin/site", title: "Site text & contact", desc: "Name, tagline, CTAs, footer, office / email / phone / WhatsApp." },
  { href: "/admin/sections", title: "Sections", desc: "Headlines + body per key (hero, about, network, trust, contact, footer)." },
  { href: "/admin/products", title: "Products", desc: "Trading category cards: title, items, image, order, publish toggle." },
  { href: "/admin/services", title: "Services", desc: "Global network capabilities + journey steps." },
  { href: "/admin/media", title: "Media", desc: "Upload images, copy URLs for products and sections." },
  { href: "/admin/inquiries", title: "Inquiries", desc: "Read-only leads + status triage (new → contacted → qualified → closed)." },
];

export default function AdminDashboard() {
  const enabled = isConvexConfigured();
  const settings = useQuery(api.cms.getSiteSettings, enabled ? {} : "skip");
  const products = useQuery(api.cms.listProductsAdmin, enabled ? { paginationOpts: { numItems: 100, cursor: null } } : "skip");
  const services = useQuery(api.cms.listServicesAdmin, enabled ? { paginationOpts: { numItems: 100, cursor: null } } : "skip");
  const inquiries = useQuery(api.inquiriesAdmin.list, enabled ? { paginationOpts: { numItems: 5, cursor: null } } : "skip");

  const productCount = products?.page.length;
  const serviceCount = services?.page.length;
  const newCount = inquiries?.page.filter((i) => i.status === "new").length;

  return (
    <div>
      <h2 className="text-lg font-bold text-navy-950">Dashboard</h2>
      {!enabled ? (
        <p className="mt-2 rounded-xl border border-navy-900/10 bg-white px-4 py-3 text-sm text-slate-600">
          Backend not connected (<code>NEXT_PUBLIC_CONVEX_URL</code> missing).
          Counts are unavailable, but forms still render — connect Convex to edit live content.
        </p>
      ) : (
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Site", value: settings ? "configured" : "…" },
            { label: "Products", value: productCount ?? "…" },
            { label: "Services", value: serviceCount ?? "…" },
            { label: "New inquiries", value: newCount ?? "…" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-navy-900/10 bg-white px-4 py-3">
              <dt className="text-xs font-semibold tracking-wide text-slate-500 uppercase">{s.label}</dt>
              <dd className="mt-1 text-2xl font-bold text-navy-950">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-navy-900/10 bg-white p-5 transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:outline-none"
          >
            <h3 className="font-semibold text-navy-950">{c.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{c.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
