import { v } from "convex/values";
import { internalMutation } from "./_generated/server";
import { SEED_PRODUCTS, SEED_SECTIONS, SEED_SERVICES, SEED_SITE_SETTINGS } from "./seedData";

// ---------------------------------------------------------------------------
// Idempotent CMS seed — run once per environment (dev + prod) from the
// Convex dashboard or `bunx convex run seed:seedCms`.
//
// - Skips entirely when `siteSettings` already exists (safe to re-run).
// - Seeds the verbatim live copy from `convex/seedData.ts` (see that file
//   for sources + the P0-2 placeholder-contact TODO for Kabir's prod run).
// ---------------------------------------------------------------------------

export const seedCms = internalMutation({
  args: {},
  returns: v.object({
    skipped: v.boolean(),
    siteSettings: v.number(),
    sections: v.number(),
    products: v.number(),
    services: v.number(),
  }),
  handler: async (ctx) => {
    const existing = await ctx.db.query("siteSettings").first();
    if (existing) {
      return { skipped: true, siteSettings: 1, sections: 0, products: 0, services: 0 };
    }

    await ctx.db.insert("siteSettings", structuredClone(SEED_SITE_SETTINGS));

    let sections = 0;
    for (const section of SEED_SECTIONS) {
      await ctx.db.insert("sections", structuredClone(section));
      sections++;
    }

    let products = 0;
    for (const product of SEED_PRODUCTS) {
      await ctx.db.insert("products", structuredClone(product));
      products++;
    }

    let services = 0;
    for (const service of SEED_SERVICES) {
      await ctx.db.insert("services", structuredClone(service));
      services++;
    }

    return { skipped: false, siteSettings: 1, sections, products, services };
  },
});
