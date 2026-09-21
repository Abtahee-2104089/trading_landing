/**
 * Frontend A — CMS chrome hook (Noore Tamanna Orny).
 *
 * Single read path for Navbar / Hero / About / Footer chrome content.
 * Today it returns the verbatim live copy as fallback so the page renders
 * with or without a Convex deployment. When `convex/cms.ts`
 * (`getSiteSettings` / `getSections`) is merged into this branch, wire the
 * live queries here — presentational components must keep calling ONLY this
 * hook and never import Convex functions directly.
 */

export type NavItem = {
  href: string;
  label: string;
};

export type HeroAssurance = {
  title: string;
  text: string;
};

export type HeroContent = {
  badge: string;
  headline: string;
  /** Trailing clause rendered in gold (e.g. "Trusted from the UAE."). */
  headlineAccent: string;
  sub: string;
  assurances: HeroAssurance[];
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  imageSrc: string;
  imageAlt: string;
};

export type AboutAdvantage = {
  title: string;
  text: string;
};

export type AboutContent = {
  eyebrow: string;
  headline: string;
  body: string;
  advantages: AboutAdvantage[];
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  imageSrc: string;
  imageAlt: string;
  noteTitle: string;
  noteBody: string;
};

export type FooterContent = {
  brandName: string;
  brandTagline: string;
  about: string;
  bottomBar: string;
};

export type ContactContent = {
  office: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
};

export type SiteContent = {
  siteName: string;
  tagline: string;
  description: string;
  primaryCta: string;
  primaryCtaHref: string;
  nav: NavItem[];
  hero: HeroContent;
  about: AboutContent;
  footer: FooterContent;
  contact: ContactContent;
};

/**
 * Verbatim live copy (2026-09-15 baseline). Mirrors `convex/seedData.ts`
 * `SEED_SITE_SETTINGS` so seed ≡ live when the backend lands.
 */
export const FALLBACK_SITE_CONTENT: SiteContent = {
  siteName: "UAE Trade Gateway",
  tagline: "Import · Export · Dubai",
  description:
    "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
  primaryCta: "Request a Quote",
  primaryCtaHref: "#contact",
  nav: [
    { href: "#about", label: "About" },
    { href: "#categories", label: "Categories" },
    { href: "#network", label: "Network" },
    { href: "#trust", label: "Trust" },
    { href: "#contact", label: "Contact" },
  ],
  hero: {
    badge: "UAE-based import & export",
    headline: "Global Trade. Seamless Supply.",
    headlineAccent: "Trusted from the UAE.",
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
    imageSrc: "/images/hero-gateway.svg",
    imageAlt:
      "Cargo vessel and port cranes at dusk with trade routes radiating from the UAE hub at Jebel Ali",
  },
  about: {
    eyebrow: "Who we are",
    headline: "Your Strategic Trade Partner in the UAE",
    body: "We are a Dubai-based general trading team helping retailers, wholesalers, and project buyers source quality goods, consolidate shipments at Jebel Ali, and clear customs without delays.",
    advantages: [
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
    ctaPrimaryLabel: "Request a Quote",
    ctaPrimaryHref: "#contact",
    ctaSecondaryLabel: "How we deliver",
    ctaSecondaryHref: "#network",
    imageSrc: "/images/about-uae-hub.svg",
    imageAlt:
      "Stylised map showing the UAE connected to Asia sourcing, Europe, Africa, and GCC markets",
    noteTitle: "Why it matters:",
    noteBody:
      "cargo already flows through the UAE — we put your goods on those lanes with vetted suppliers and paperwork done right.",
  },
  footer: {
    brandName: "UAE Trade Gateway",
    brandTagline: "Import · Export · Dubai",
    about:
      "Dubai-based general trading — sourcing, QC, freight, and customs for importers across the GCC and beyond.",
    bottomBar: "Jebel Ali · Dubai · United Arab Emirates",
  },
  contact: {
    office: "Jebel Ali, Dubai, UAE",
    email: "trade@example.ae",
    phoneDisplay: "+971 4 000 0000",
    phoneHref: "tel:+971400000000",
  },
};

export type UseSiteContentResult = {
  content: SiteContent;
  /** True once live CMS queries are wired and returning data. Always false until `convex/cms.ts` lands. */
  isLive: boolean;
};

/**
 * Server-safe (no `"use client"`, no Convex import) so Hero / About /
 * Footer can stay Server Components. Returns fallback content today.
 */
export function useSiteContent(): UseSiteContentResult {
  return { content: FALLBACK_SITE_CONTENT, isLive: false };
}

export default useSiteContent;
