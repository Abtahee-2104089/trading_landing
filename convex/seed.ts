import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Idempotent CMS seed (Pal unblock: mirrors current hardcoded copy verbatim).
 * Skips when siteSettings already exists. Run once per env from dashboard.
 * Real contact details replace the placeholders via /admin/site#contact.
 */

const PRODUCTS = [
  {
    title: "Electronics & Electrical",
    slug: "electronics-electrical",
    description:
      "Sourced consumer electronics, components, and electrical goods with QC checks before dispatch.",
    items: ["Consumer electronics", "Mobile accessories", "Electrical fittings"],
    imageUrl: "/categories/electronics.jpg",
    alt: "Consumer electronics and electrical goods",
    sortOrder: 1,
  },
  {
    title: "Foodstuff & Agro Commodities",
    slug: "foodstuff-agro-commodities",
    description:
      "Bulk and packaged food trading with cold-chain partners and documentation handled end to end.",
    items: ["Rice, sugar & oils", "Spices & pulses", "Packaged foods"],
    imageUrl: "/categories/foodstuff-agro.jpg",
    alt: "Bulk foodstuff and agro commodities",
    sortOrder: 2,
  },
  {
    title: "Textiles & Garments",
    slug: "textiles-garments",
    description:
      "Fabrics, apparel, and home textiles from vetted mills across Asia, routed via Jebel Ali.",
    items: ["Fabrics & yarn", "Ready-made garments", "Home textiles"],
    imageUrl: "/categories/textiles-garments.jpg",
    alt: "Colorful textile rolls and garments",
    sortOrder: 3,
  },
  {
    title: "Building Materials & Hardware",
    slug: "building-materials-hardware",
    description:
      "Construction supply for GCC projects — consolidated shipments to cut freight cost per unit.",
    items: ["Sanitary & tiles", "Hardware & tools", "MEP supplies"],
    imageUrl: "/categories/building-materials.jpg",
    alt: "Building materials and hardware supplies",
    sortOrder: 4,
  },
  {
    title: "Cosmetics & Personal Care",
    slug: "cosmetics-personal-care",
    description:
      "Compliant beauty and personal-care imports with labelling and municipality requirements covered.",
    items: ["Skincare & haircare", "Fragrances", "Hygiene essentials"],
    imageUrl: "/categories/cosmetics-personal-care.jpg",
    alt: "Cosmetics and personal care products",
    sortOrder: 5,
  },
  {
    title: "Auto Parts & Industrial",
    slug: "auto-parts-industrial",
    description:
      "Genuine and aftermarket parts plus industrial consumables for fleets and workshops.",
    items: ["Spare parts", "Lubricants", "Industrial consumables"],
    imageUrl: "/categories/auto-parts-industrial.jpg",
    alt: "Auto parts and industrial components",
    sortOrder: 6,
  },
];

const SERVICES = [
  {
    title: "UAE Hub",
    slug: "uae-hub",
    description: "Jebel Ali & Dubai — consolidation, QC, and re-export.",
    meta: "GCC transit via land & sea",
    sortOrder: 1,
  },
  {
    title: "GCC & Middle East",
    slug: "gcc-middle-east",
    description: "Saudi Arabia, Oman, Qatar, Kuwait, Bahrain via land & sea.",
    meta: "DDP / DAP where it helps",
    sortOrder: 2,
  },
  {
    title: "Asia Sourcing",
    slug: "asia-sourcing",
    description: "India, China, Vietnam, Thailand — factory-direct procurement.",
    meta: "Mixed-container loading",
    sortOrder: 3,
  },
  {
    title: "Africa & Europe",
    slug: "africa-europe",
    description: "East Africa corridors plus EU supplier onboarding on request.",
    meta: "Docs & compliance handled",
    sortOrder: 4,
  },
];

export const seedCms = internalMutation({
  args: {},
  returns: v.object({ seeded: v.boolean(), reason: v.optional(v.string()) }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteSettings").order("desc").take(1);
    if (existing[0]) return { seeded: false, reason: "siteSettings exists" };

    await ctx.db.insert("siteSettings", {
      siteName: "UAE Trade Gateway",
      tagline: "Global Trade. Seamless Supply. Trusted from the UAE.",
      description:
        "UAE-based import & export partner for sourcing, commodity trading, and cross-border logistics — consolidated at Jebel Ali, delivered across the GCC and beyond.",
      primaryCta: "Request a Quote",
      contact: {
        office: "Jebel Ali, Dubai, UAE",
        email: "trade@example.ae",
        phoneDisplay: "+971 4 000 0000",
        phoneHref: "tel:+971400000000",
        responseNote:
          "Our trading desk replies within one business day with price, lead time, and shipping options — no obligation.",
      },
      nav: [
        { href: "#about", label: "About" },
        { href: "#categories", label: "Categories" },
        { href: "#network", label: "Network" },
        { href: "#trust", label: "Trust" },
        { href: "#contact", label: "Contact" },
      ],
      updatedAt: Date.now(),
    });

    const sections: Array<{
      key: string;
      eyebrow?: string;
      headline?: string;
      body?: string;
      steps?: Array<{ title: string; text: string }>;
    }> = [
      {
        key: "trust",
        eyebrow: "Trust & compliance",
        headline: "Built on Reliability and Compliance",
        body: "Importing is risky when you can't see the goods. We close that gap with inspection evidence, clear paperwork, and dependable supply relationships — and we make no claims we can't prove.",
      },
      {
        key: "network",
        eyebrow: "Global network",
        headline: "From Global Source to Final Market",
        body: "We consolidate at the UAE gateway and distribute across the GCC and beyond — one partner for sourcing, shipping, and clearance.",
        steps: [
          { title: "Sourcing", text: "Vetted suppliers, samples, and price benchmarking." },
          { title: "Coordination & QC", text: "Inspection in origin or Jebel Ali before loading." },
          { title: "Logistics", text: "Sea, air, or land freight consolidated at Jebel Ali." },
          { title: "Documentation", text: "Invoices, packing lists, certificates of origin, clearance." },
          { title: "Distribution", text: "GCC-wide delivery with tracking and proof of delivery." },
        ],
      },
      {
        key: "contact",
        eyebrow: "Final CTA",
        headline: "Let's Talk Trade",
        body: "Tell us what you want to import or export. Our trading desk replies within one business day with price, lead time, and shipping options — no obligation.",
      },
    ];
    for (const s of sections) {
      await ctx.db.insert("sections", { ...s, updatedAt: Date.now() });
    }

    for (const p of PRODUCTS) {
      await ctx.db.insert("products", { ...p, isPublished: true, updatedAt: Date.now() });
    }
    for (const s of SERVICES) {
      await ctx.db.insert("services", { ...s, isPublished: true, updatedAt: Date.now() });
    }
    return { seeded: true };
  },
});
