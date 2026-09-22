"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import type {
  CmsContact,
  CmsHero,
  CmsNavItem,
  CmsProduct,
  CmsSection,
  CmsSectionItem,
  CmsService,
  CmsSiteDoc,
} from "@/lib/types/cms";

/**
 * Pal scope — live CMS read layer for public sections.
 *
 * Every hook follows one rule: live data OR local fallback, never a blank
 * section. Queries are skipped when no Convex URL is configured (static
 * preview / backend missing) so the page renders from fallback copy.
 */

// --- verbatim live-copy fallbacks (seed ≡ live) -----------------------------

export const FALLBACK_CONTACT: CmsContact = {
  office: "Jebel Ali, Dubai, UAE",
  email: "trade@example.ae",
  phoneDisplay: "+971 4 000 0000",
  phoneHref: "tel:+971400000000",
  responseNote:
    "Tell us what you want to import or export. Our trading desk replies within one business day with price, lead time, and shipping options — no obligation.",
};

export const FALLBACK_PRODUCTS: CmsProduct[] = [
  {
    title: "Electronics & Electrical",
    slug: "electronics-electrical",
    description:
      "Sourced consumer electronics, components, and electrical goods with QC checks before dispatch.",
    items: ["Consumer electronics", "Mobile accessories", "Electrical fittings"],
    imageUrl: null,
    imageUrlFallback: "/categories/electronics.jpg",
    alt: "Consumer electronics and electrical goods",
    sortOrder: 0,
    isPublished: true,
  },
  {
    title: "Foodstuff & Agro Commodities",
    slug: "foodstuff-agro-commodities",
    description:
      "Bulk and packaged food trading with cold-chain partners and documentation handled end to end.",
    items: ["Rice, sugar & oils", "Spices & pulses", "Packaged foods"],
    imageUrl: null,
    imageUrlFallback: "/categories/foodstuff-agro.jpg",
    alt: "Bulk foodstuff and agro commodities",
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Textiles & Garments",
    slug: "textiles-garments",
    description:
      "Fabrics, apparel, and home textiles from vetted mills across Asia, routed via Jebel Ali.",
    items: ["Fabrics & yarn", "Ready-made garments", "Home textiles"],
    imageUrl: null,
    imageUrlFallback: "/categories/textiles-garments.jpg",
    alt: "Colorful textile rolls and garments",
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Building Materials & Hardware",
    slug: "building-materials-hardware",
    description:
      "Construction supply for GCC projects — consolidated shipments to cut freight cost per unit.",
    items: ["Sanitary & tiles", "Hardware & tools", "MEP supplies"],
    imageUrl: null,
    imageUrlFallback: "/categories/building-materials.jpg",
    alt: "Building materials and hardware supplies",
    sortOrder: 3,
    isPublished: true,
  },
  {
    title: "Cosmetics & Personal Care",
    slug: "cosmetics-personal-care",
    description:
      "Compliant beauty and personal-care imports with labelling and municipality requirements covered.",
    items: ["Skincare & haircare", "Fragrances", "Hygiene essentials"],
    imageUrl: null,
    imageUrlFallback: "/categories/cosmetics-personal-care.jpg",
    alt: "Cosmetics and personal care products",
    sortOrder: 4,
    isPublished: true,
  },
  {
    title: "Auto Parts & Industrial",
    slug: "auto-parts-industrial",
    description:
      "Genuine and aftermarket parts plus industrial consumables for fleets and workshops.",
    items: ["Spare parts", "Lubricants", "Industrial consumables"],
    imageUrl: null,
    imageUrlFallback: "/categories/auto-parts-industrial.jpg",
    alt: "Auto parts and industrial components",
    sortOrder: 5,
    isPublished: true,
  },
];

export const FALLBACK_SERVICES: CmsService[] = [
  {
    title: "UAE Hub",
    description: "Jebel Ali & Dubai — consolidation, QC, and re-export.",
    meta: "GCC transit via land & sea",
    sortOrder: 0,
    isPublished: true,
  },
  {
    title: "GCC & Middle East",
    description: "Saudi Arabia, Oman, Qatar, Kuwait, Bahrain via land & sea.",
    meta: "DDP / DAP where it helps",
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

export const FALLBACK_NETWORK_STEPS: CmsSectionItem[] = [
  { title: "Sourcing", text: "Vetted suppliers, samples, and price benchmarking.", meta: "01" },
  { title: "Coordination & QC", text: "Inspection in origin or Jebel Ali before loading.", meta: "02" },
  { title: "Logistics", text: "Sea, air, or land freight consolidated at Jebel Ali.", meta: "03" },
  { title: "Documentation", text: "Invoices, packing lists, certificates of origin, clearance.", meta: "04" },
  { title: "Distribution", text: "GCC-wide delivery with tracking and proof of delivery.", meta: "05" },
];

export const FALLBACK_TRUST_PILLARS: CmsSectionItem[] = [
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

/** Neutral verifiable assurances — no invented certs/clients/volumes. */
export const FALLBACK_TRUST_ASSURANCES: string[] = [
  "Inspection evidence shared before payment release",
  "Verified credentials and references shared on request",
];

export const FALLBACK_SECTIONS: Record<string, CmsSection> = {
  hero: {
    key: "hero",
    eyebrow: "UAE-based import & export",
    headline: "Global Trade. Seamless Supply. Trusted from the UAE.",
    body: "Your UAE-based partner connecting international suppliers and buyers through sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the region.",
  },
  about: {
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
  network: {
    key: "network",
    eyebrow: "Global network",
    headline: "From Global Source to Final Market",
    body: "We consolidate at the UAE gateway and distribute across the GCC and beyond — one partner for sourcing, shipping, and clearance.",
    items: FALLBACK_NETWORK_STEPS,
  },
  trust: {
    key: "trust",
    eyebrow: "Trust & compliance",
    headline: "Built on Reliability and Compliance",
    body: "Importing is risky when you can't see the goods. We close that gap with inspection evidence, clear paperwork, and dependable supply relationships — and we make no claims we can't prove.",
    items: FALLBACK_TRUST_PILLARS,
  },
  contact: {
    key: "contact",
    eyebrow: "Final CTA",
    headline: "Let's Talk Trade",
    body: "Tell us what you want to import or export. Our trading desk replies within one business day with price, lead time, and shipping options — no obligation.",
  },
  categories: {
    key: "categories",
    eyebrow: "What we trade",
    headline: "What We Trade",
    body: "Six core verticals with vetted suppliers, consolidated shipping, and quality inspection — so you can order mixed containers with confidence.",
  },
  footer: {
    key: "footer",
    eyebrow: "",
    headline: "UAE Trade",
    body: "Dubai-based general trading — sourcing, QC, freight, and customs for importers across the GCC and beyond.",
  },
};

export const FALLBACK_NAV: CmsNavItem[] = [
  { href: "#about", label: "About" },
  { href: "#categories", label: "Categories" },
  { href: "#network", label: "Network" },
  { href: "#trust", label: "Trust" },
  { href: "#contact", label: "Contact" },
];

export const FALLBACK_HERO: CmsHero = {
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
};

export const FALLBACK_SITE_DOC: CmsSiteDoc = {
  siteName: "UAE Trade Gateway",
  tagline: "Import · Export · Dubai",
  description:
    "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
  primaryCta: "Request a Quote",
  hero: FALLBACK_HERO,
  footer: {
    about:
      "Dubai-based general trading — sourcing, QC, freight, and customs for importers across the GCC and beyond.",
    bottomBar: "Jebel Ali · Dubai · United Arab Emirates",
  },
  contact: FALLBACK_CONTACT,
  nav: FALLBACK_NAV,
  heroImageUrl: null,
  aboutImageUrl: null,
};

// --- live hooks --------------------------------------------------------------

function useLiveQuery<T>(fn: Parameters<typeof useQuery>[0], args: Record<string, never>): T | undefined {
  // Skip the subscription entirely when no backend is configured.
  return useQuery(fn, (isConvexConfigured() ? args : "skip") as never) as T | undefined;
}

/** Live CMS contact block (siteSettings.contact) with fallback. */
export function useCmsContact(): { contact: CmsContact; isLive: boolean } {
  const data = useLiveQuery<{ contact: CmsContact } | null>(api.cms.getSiteSettings, {});
  if (!data?.contact) return { contact: FALLBACK_CONTACT, isLive: false };
  return { contact: data.contact, isLive: true };
}

/** Live site name / primary CTA (siteSettings) with fallback. */
export function useCmsSiteMeta(): {
  siteName: string;
  primaryCta: string;
  isLive: boolean;
} {
  const { site: doc, isLive } = useCmsSite();
  return { siteName: doc.siteName, primaryCta: doc.primaryCta, isLive };
}

/**
 * Live full site-settings doc (nav, hero, footer, contact, images).
 * Single source for Navbar / Hero / About / Footer chrome — live data OR
 * the verbatim fallback doc, never undefined UI.
 */
export function useCmsSite(): { site: CmsSiteDoc; isLive: boolean } {
  const data = useLiveQuery<CmsSiteDoc>(api.cms.getSiteSettings, {});
  if (!data) return { site: FALLBACK_SITE_DOC, isLive: false };
  return {
    site: {
      ...FALLBACK_SITE_DOC,
      ...data,
      hero: data.hero ?? FALLBACK_HERO,
      nav:
        Array.isArray(data.nav) && data.nav.length > 0 ? data.nav : FALLBACK_NAV,
    },
    isLive: true,
  };
}

/** Live nav links with fallback (single nav source — P2-3). */
export function useCmsNav(): { nav: CmsNavItem[]; isLive: boolean } {
  const { site, isLive } = useCmsSite();
  return { nav: site.nav, isLive };
}

/**
 * Live published products.
 * - Backend unreachable/loading → verbatim fallback copy (never blank).
 * - Backend live but nothing published → empty array so the section can
 *   render its "No categories published yet." empty state.
 */
export function useCmsProducts(): { products: CmsProduct[]; isLive: boolean } {
  const data = useLiveQuery<CmsProduct[]>(api.cms.listPublishedProducts, {});
  if (data === undefined) return { products: FALLBACK_PRODUCTS, isLive: false };
  return { products: data, isLive: true };
}

/** Live published services (same empty-state rule as products). */
export function useCmsServices(): { services: CmsService[]; isLive: boolean } {
  const data = useLiveQuery<CmsService[]>(api.cms.listPublishedServices, {});
  if (data === undefined) return { services: FALLBACK_SERVICES, isLive: false };
  return { services: data, isLive: true };
}

/** Live section by key with fallback. */
export function useCmsSection(key: string): { section: CmsSection; isLive: boolean } {
  const data = useLiveQuery<CmsSection[]>(api.cms.getSections, {});
  const fallback = FALLBACK_SECTIONS[key];
  if (!data) return { section: fallback, isLive: false };
  const found = data.find((s) => s.key === key);
  if (!found) return { section: fallback, isLive: false };
  return { section: found, isLive: true };
}
