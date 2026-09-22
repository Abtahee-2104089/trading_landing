/** Single source of truth for SEO metadata, nav anchors, and contact details. */
const configuredUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "").trim();

// P0-3 build guard: sitemap / robots / canonical / OG / JSON-LD must never
// point at a placeholder domain in production. `bun dev` keeps working with
// the localhost fallback; production builds fail loudly when the env is unset.
if (
  !configuredUrl &&
  (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production")
) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required in production — sitemap/OG would point at a placeholder.",
  );
}

export const siteUrl = configuredUrl || "http://localhost:3000";

export const site = {
  name: "UAE Trade Gateway",
  tagline: "Global Trade. Seamless Supply. Trusted from the UAE.",
  description:
    "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
  url: siteUrl,
  locale: "en_AE",
  contact: {
    // TODO(P0-2): fallback-only placeholders. Prod must override via
    // `/admin/site#contact` (CMS `siteSettings.contact`) before handover —
    // never ship prod HTML containing these values.
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
