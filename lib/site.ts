/** Single source of truth for SEO metadata, nav anchors, and contact details. */
export const site = {
  name: "UAE Trade Gateway",
  tagline: "Global Trade. Seamless Supply. Trusted from the UAE.",
  description:
    "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://your-domain.vercel.app",
  locale: "en_AE",
  contact: {
    email: "trade@example.ae",
    phoneDisplay: "+971 4 000 0000",
    phoneHref: "tel:+971400000000",
    office: "Jebel Ali, Dubai, UAE",
  },
  nav: [
    { href: "#about", label: "About" },
    { href: "#categories", label: "Categories" },
    { href: "#network", label: "Network" },
    { href: "#trust", label: "Trust" },
    { href: "#contact", label: "Contact" },
  ] as Array<{ href: string; label: string }>,
  /** The one primary CTA label repeated everywhere (merge checklist). */
  primaryCta: "Request a Quote",
} as const;

export type SiteConfig = typeof site;
