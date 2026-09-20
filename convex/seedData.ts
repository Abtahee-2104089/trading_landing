import { Infer } from "convex/values";
import {
  productValidator,
  sectionValidator,
  serviceValidator,
  siteSettingsValidator,
} from "./schema";

export type SiteSettings = Infer<typeof siteSettingsValidator>;
export type Section = Infer<typeof sectionValidator>;
export type Product = Infer<typeof productValidator>;
export type Service = Infer<typeof serviceValidator>;

// ---------------------------------------------------------------------------
// Verbatim live copy (2026-09-15) — the CMS baseline.
//
// Sourced character-for-character from Hero.tsx, TradingCategories.tsx,
// GlobalNetwork.tsx, Trust.tsx, Contact.tsx, Footer.tsx, and layout.tsx.
// Do NOT invent certs/clients/volumes/awards here: Trust stats below are
// today's on-page numbers, kept verbatim so seed ≡ live. Editors replace
// Trust facts via `/admin/sections#trust` after verification.
//
// PLACEHOLDER CONTACTS (P0-2): `contact.email|phoneDisplay|phoneHref` below
// are the current hardcoded placeholders. Kabir overwrites them with real
// values in the PROD seed run; editors can change them anytime at
// `/admin/site#contact`. Never ship prod with `example.ae` / `000 0000`.
// ---------------------------------------------------------------------------

export const SEED_SITE_SETTINGS: SiteSettings = {
  siteName: "UAE Trade Gateway",
  tagline: "UAE-based import & export",
  description:
    "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
  primaryCta: "Request a Quote",
  hero: {
    badge: "UAE-based import & export",
    headline: "Global Trade. Seamless Supply. Trusted from the UAE.",
    sub: "Your UAE-based partner connecting international suppliers and buyers through sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the region.",
    assurances: [
      { title: "Jebel Ali consolidation", text: "Mixed containers, one shipment" },
      { title: "Customs cleared", text: "Documents handled end to end" },
      { title: "One partner", text: "Sourcing to last-mile delivery" },
    ],
    ctaPrimaryLabel: "Request a Quote",
    ctaPrimaryHref: "#contact",
    ctaSecondaryLabel: "Explore Trading Categories",
    ctaSecondaryHref: "#categories",
  },
  footer: {
    about:
      "Dubai-based general trading — sourcing, QC, freight, and customs for importers across the GCC and beyond.",
    bottomBar: "Jebel Ali · Dubai · United Arab Emirates",
  },
  contact: {
    // TODO(Kabir, P0-2): replace with real inbox/numbers before prod handover.
    office: "Jebel Ali, Dubai, UAE",
    email: "trade@example.ae",
    phoneDisplay: "+971 4 000 0000",
    phoneHref: "tel:+971400000000",
    responseNote: "Our trading desk will reply within one business day.",
  },
  nav: [
    { href: "#about", label: "About" },
    { href: "#categories", label: "Categories" },
    { href: "#network", label: "Network" },
    { href: "#trust", label: "Trust" },
    { href: "#contact", label: "Contact" },
  ],
};

export const SEED_SECTIONS: Section[] = [
  {
    key: "hero",
    eyebrow: "UAE-based import & export",
    headline: "Global Trade. Seamless Supply. Trusted from the UAE.",
    body: "Your UAE-based partner connecting international suppliers and buyers through sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the region.",
  },
  {
    key: "about",
    eyebrow: "Who we are",
    headline: "Your Strategic Trade Partner in the UAE",
    body: "We are a Dubai-based general trading team helping retailers, wholesalers, and project buyers source quality goods, consolidate shipments at Jebel Ali, and clear customs without delays.",
    items: [
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
    ],
  },
  {
    key: "network",
    eyebrow: "Global network",
    headline: "Dubai-rooted, region-wide",
    body: "We consolidate at the UAE gateway and distribute across the GCC and beyond — one partner for sourcing, shipping, and clearance.",
    items: [
      { title: "Sourcing", text: "Vetted suppliers, samples, and price benchmarking.", meta: "01" },
      { title: "QC & Consolidation", text: "Inspection in origin or Jebel Ali before loading.", meta: "02" },
      { title: "Freight & Customs", text: "Sea, air, or land freight with clearance included.", meta: "03" },
      { title: "Last-mile Delivery", text: "GCC-wide delivery with tracking and POD.", meta: "04" },
    ],
  },
  {
    key: "trust",
    eyebrow: "Why trust us",
    headline: "Trade with a partner, not a middleman",
    body: "Importing is risky when you can't see the goods. We close that gap with inspection evidence, clear paperwork, and escrow-friendly payment terms.",
    items: [
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
      // On-page stats, verbatim — editors must verify/replace via CMS.
      { title: "120+", text: "Vetted suppliers", meta: "stat" },
      { title: "850+", text: "Containers moved", meta: "stat" },
      { title: "14", text: "Countries served", meta: "stat" },
      { title: "98%", text: "On-time delivery", meta: "stat" },
    ],
  },
  {
    key: "contact",
    eyebrow: "Contact",
    headline: "Get a quote in 24 hours",
    body: "Tell us what you want to import or export. We reply with price, lead time, and shipping options — no obligation.",
  },
  {
    key: "footer",
    eyebrow: "",
    headline: "UAE Trade",
    body: "Dubai-based general trading — sourcing, QC, freight, and customs for importers across the GCC and beyond.",
  },
];

export const SEED_PRODUCTS: (Omit<Product, "slug"> & { slug: string })[] = [
  {
    title: "Electronics & Electrical",
    slug: "electronics-electrical",
    description:
      "Sourced consumer electronics, components, and electrical goods with QC checks before dispatch.",
    items: ["Consumer electronics", "Mobile accessories", "Electrical fittings"],
    alt: "Electronics & Electrical",
    sortOrder: 0,
    isPublished: true,
  },
  {
    title: "Foodstuff & Agro Commodities",
    slug: "foodstuff-agro-commodities",
    description:
      "Bulk and packaged food trading with cold-chain partners and documentation handled end to end.",
    items: ["Rice, sugar & oils", "Spices & pulses", "Packaged foods"],
    alt: "Foodstuff & Agro Commodities",
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Textiles & Garments",
    slug: "textiles-garments",
    description:
      "Fabrics, apparel, and home textiles from vetted mills across Asia, routed via Jebel Ali.",
    items: ["Fabrics & yarn", "Ready-made garments", "Home textiles"],
    alt: "Textiles & Garments",
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Building Materials & Hardware",
    slug: "building-materials-hardware",
    description:
      "Construction supply for GCC projects — consolidated shipments to cut freight cost per unit.",
    items: ["Sanitary & tiles", "Hardware & tools", "MEP supplies"],
    alt: "Building Materials & Hardware",
    sortOrder: 3,
    isPublished: true,
  },
  {
    title: "Cosmetics & Personal Care",
    slug: "cosmetics-personal-care",
    description:
      "Compliant beauty and personal-care imports with labelling and municipality requirements covered.",
    items: ["Skincare & haircare", "Fragrances", "Hygiene essentials"],
    alt: "Cosmetics & Personal Care",
    sortOrder: 4,
    isPublished: true,
  },
  {
    title: "Auto Parts & Industrial",
    slug: "auto-parts-industrial",
    description:
      "Genuine and aftermarket parts plus industrial consumables for fleets and workshops.",
    items: ["Spare parts", "Lubricants", "Industrial consumables"],
    alt: "Auto Parts & Industrial",
    sortOrder: 5,
    isPublished: true,
  },
];

export const SEED_SERVICES: Service[] = [
  {
    title: "UAE Hub",
    description: "Jebel Ali & Dubai — consolidation, QC, and re-export.",
    meta: "2–4 day GCC transit",
    sortOrder: 0,
    isPublished: true,
  },
  {
    title: "GCC & Middle East",
    description: "Saudi Arabia, Oman, Qatar, Kuwait, Bahrain via land & sea.",
    meta: "DDP / DAP available",
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Asia Sourcing",
    description: "India, China, Vietnam, Thailand — factory-direct procurement.",
    meta: "Mixed-container loading",
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Africa & Europe",
    description: "East Africa corridors plus EU supplier onboarding on request.",
    meta: "Docs & compliance handled",
    sortOrder: 3,
    isPublished: true,
  },
];
