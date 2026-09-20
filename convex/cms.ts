import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { mutation, query } from "./_generated/server";

/**
 * CMS public + admin functions (Pal frontend/admin reads).
 * Public queries are empty-DB safe: they return fallbacks / [] and never throw.
 * Admin mutations are marked TODO(auth): Kabir gates them with requireAdmin.
 * Until then they validate shapes server-side but perform no auth check.
 */

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function requireSlug(slug: string | undefined, title: string): string {
  const s = (slug ?? "").trim() || slugify(title);
  if (!s) {
    throw new ConvexError({ code: "VALIDATION_ERROR", message: "Slug is required." });
  }
  return s;
}

// ---------------------------------------------------------------------------
// Public reads (no login) — empty-DB safe
// ---------------------------------------------------------------------------

export const getSiteSettings = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("siteSettings"),
      _creationTime: v.number(),
      siteName: v.string(),
      tagline: v.string(),
      description: v.string(),
      primaryCta: v.string(),
      heroBadge: v.optional(v.string()),
      heroHeadline: v.optional(v.string()),
      heroSub: v.optional(v.string()),
      heroImageUrl: v.optional(v.string()),
      heroImageAlt: v.optional(v.string()),
      footerAbout: v.optional(v.string()),
      footerBottomBar: v.optional(v.string()),
      contact: v.object({
        office: v.string(),
        email: v.string(),
        phoneDisplay: v.string(),
        phoneHref: v.string(),
        whatsappHref: v.optional(v.string()),
        hours: v.optional(v.string()),
        responseNote: v.optional(v.string()),
      }),
      nav: v.optional(
        v.array(v.object({ href: v.string(), label: v.string() })),
      ),
      updatedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx) => {
    const docs = await ctx.db.query("siteSettings").order("desc").take(1);
    return docs[0] ?? null;
  },
});

export const getSections = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("sections"),
      _creationTime: v.number(),
      key: v.string(),
      eyebrow: v.optional(v.string()),
      headline: v.optional(v.string()),
      body: v.optional(v.string()),
      steps: v.optional(
        v.array(v.object({ title: v.string(), text: v.string() })),
      ),
      imageUrl: v.optional(v.string()),
      imageAlt: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    return await ctx.db.query("sections").take(50);
  },
});

export const getSectionByKey = query({
  args: { key: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("sections"),
      _creationTime: v.number(),
      key: v.string(),
      eyebrow: v.optional(v.string()),
      headline: v.optional(v.string()),
      body: v.optional(v.string()),
      steps: v.optional(
        v.array(v.object({ title: v.string(), text: v.string() })),
      ),
      imageUrl: v.optional(v.string()),
      imageAlt: v.optional(v.string()),
      updatedAt: v.optional(v.number()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("sections")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    return doc;
  },
});

export const listPublishedProducts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("products"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      items: v.array(v.string()),
      imageUrl: v.optional(v.string()),
      imageStorageId: v.optional(v.string()),
      alt: v.optional(v.string()),
      sortOrder: v.number(),
      isPublished: v.boolean(),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const all = await ctx.db
      .query("products")
      .withIndex("by_sortOrder")
      .order("asc")
      .take(100);
    return all.filter((p) => p.isPublished);
  },
});

export const listPublishedServices = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("services"),
      _creationTime: v.number(),
      title: v.string(),
      slug: v.string(),
      description: v.string(),
      meta: v.optional(v.string()),
      sortOrder: v.number(),
      isPublished: v.boolean(),
      updatedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx) => {
    const all = await ctx.db
      .query("services")
      .withIndex("by_sortOrder")
      .order("asc")
      .take(100);
    return all.filter((s) => s.isPublished);
  },
});

// ---------------------------------------------------------------------------
// Admin reads/writes — TODO(auth): Kabir wraps with requireAdmin.
// ---------------------------------------------------------------------------

export const listProductsAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sortOrder")
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

export const listServicesAdmin = query({
  args: { paginationOpts: paginationOptsValidator },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("services")
      .withIndex("by_sortOrder")
      .order("asc")
      .paginate(args.paginationOpts);
  },
});

const productInput = {
  title: v.string(),
  slug: v.optional(v.string()),
  description: v.string(),
  items: v.array(v.string()),
  imageUrl: v.optional(v.string()),
  imageStorageId: v.optional(v.string()),
  alt: v.optional(v.string()),
  sortOrder: v.number(),
  isPublished: v.boolean(),
};

export const createProduct = mutation({
  args: productInput,
  returns: v.object({ id: v.id("products") }),
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (title.length < 2 || title.length > 120) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Title must be 2-120 characters." });
    }
    const slug = requireSlug(args.slug, title);
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Slug already exists." });
    }
    const id = await ctx.db.insert("products", {
      title,
      slug,
      description: args.description.trim().slice(0, 2000),
      items: args.items.map((i) => i.trim()).filter(Boolean).slice(0, 20),
      ...(args.imageUrl ? { imageUrl: args.imageUrl } : {}),
      ...(args.imageStorageId ? { imageStorageId: args.imageStorageId } : {}),
      ...(args.alt ? { alt: args.alt.slice(0, 200) } : {}),
      sortOrder: args.sortOrder,
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
    return { id };
  },
});

export const updateProduct = mutation({
  args: { id: v.id("products"), patch: v.object(productInput) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("products", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Product not found." });
    }
    const title = args.patch.title.trim();
    const slug = requireSlug(args.patch.slug, title);
    if (slug !== existing.slug) {
      const clash = await ctx.db
        .query("products")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (clash) {
        throw new ConvexError({ code: "VALIDATION_ERROR", message: "Slug already exists." });
      }
    }
    await ctx.db.patch("products", args.id, {
      title,
      slug,
      description: args.patch.description.trim().slice(0, 2000),
      items: args.patch.items.map((i) => i.trim()).filter(Boolean).slice(0, 20),
      ...(args.patch.imageUrl ? { imageUrl: args.patch.imageUrl } : { imageUrl: undefined }),
      ...(args.patch.imageStorageId
        ? { imageStorageId: args.patch.imageStorageId }
        : { imageStorageId: undefined }),
      ...(args.patch.alt ? { alt: args.patch.alt.slice(0, 200) } : { alt: undefined }),
      sortOrder: args.patch.sortOrder,
      isPublished: args.patch.isPublished,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setProductPublished = mutation({
  args: { id: v.id("products"), isPublished: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("products", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Product not found." });
    }
    await ctx.db.patch("products", args.id, {
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
    return null;
  },
});

const serviceInput = {
  title: v.string(),
  slug: v.optional(v.string()),
  description: v.string(),
  meta: v.optional(v.string()),
  sortOrder: v.number(),
  isPublished: v.boolean(),
};

export const createService = mutation({
  args: serviceInput,
  returns: v.object({ id: v.id("services") }),
  handler: async (ctx, args) => {
    const title = args.title.trim();
    if (title.length < 2 || title.length > 120) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Title must be 2-120 characters." });
    }
    const slug = requireSlug(args.slug, title);
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .unique();
    if (existing) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Slug already exists." });
    }
    const id = await ctx.db.insert("services", {
      title,
      slug,
      description: args.description.trim().slice(0, 2000),
      ...(args.meta ? { meta: args.meta.trim().slice(0, 300) } : {}),
      sortOrder: args.sortOrder,
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
    return { id };
  },
});

export const updateService = mutation({
  args: { id: v.id("services"), patch: v.object(serviceInput) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("services", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Service not found." });
    }
    const title = args.patch.title.trim();
    const slug = requireSlug(args.patch.slug, title);
    if (slug !== existing.slug) {
      const clash = await ctx.db
        .query("services")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (clash) {
        throw new ConvexError({ code: "VALIDATION_ERROR", message: "Slug already exists." });
      }
    }
    await ctx.db.patch("services", args.id, {
      title,
      slug,
      description: args.patch.description.trim().slice(0, 2000),
      ...(args.patch.meta ? { meta: args.patch.meta.trim().slice(0, 300) } : { meta: undefined }),
      sortOrder: args.patch.sortOrder,
      isPublished: args.patch.isPublished,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const setServicePublished = mutation({
  args: { id: v.id("services"), isPublished: v.boolean() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db.get("services", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Service not found." });
    }
    await ctx.db.patch("services", args.id, {
      isPublished: args.isPublished,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const updateSiteSettings = mutation({
  args: {
    patch: v.object({
      siteName: v.optional(v.string()),
      tagline: v.optional(v.string()),
      description: v.optional(v.string()),
      primaryCta: v.optional(v.string()),
      heroBadge: v.optional(v.string()),
      heroHeadline: v.optional(v.string()),
      heroSub: v.optional(v.string()),
      heroImageUrl: v.optional(v.string()),
      heroImageAlt: v.optional(v.string()),
      footerAbout: v.optional(v.string()),
      footerBottomBar: v.optional(v.string()),
      contact: v.optional(
        v.object({
          office: v.optional(v.string()),
          email: v.optional(v.string()),
          phoneDisplay: v.optional(v.string()),
          phoneHref: v.optional(v.string()),
          whatsappHref: v.optional(v.string()),
          hours: v.optional(v.string()),
          responseNote: v.optional(v.string()),
        }),
      ),
      nav: v.optional(
        v.array(v.object({ href: v.string(), label: v.string() })),
      ),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const docs = await ctx.db.query("siteSettings").order("desc").take(1);
    const patch = args.patch;
    if (patch.contact?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(patch.contact.email.trim())) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Contact email is invalid." });
    }
    if (docs[0]) {
      const current = docs[0];
      await ctx.db.patch("siteSettings", current._id, {
        ...(patch.siteName !== undefined ? { siteName: patch.siteName.trim().slice(0, 120) } : {}),
        ...(patch.tagline !== undefined ? { tagline: patch.tagline.trim().slice(0, 300) } : {}),
        ...(patch.description !== undefined ? { description: patch.description.trim().slice(0, 1000) } : {}),
        ...(patch.primaryCta !== undefined ? { primaryCta: patch.primaryCta.trim().slice(0, 80) } : {}),
        ...(patch.heroBadge !== undefined ? { heroBadge: patch.heroBadge.trim().slice(0, 200) } : {}),
        ...(patch.heroHeadline !== undefined ? { heroHeadline: patch.heroHeadline.trim().slice(0, 300) } : {}),
        ...(patch.heroSub !== undefined ? { heroSub: patch.heroSub.trim().slice(0, 1000) } : {}),
        ...(patch.heroImageUrl !== undefined ? { heroImageUrl: patch.heroImageUrl } : {}),
        ...(patch.heroImageAlt !== undefined ? { heroImageAlt: patch.heroImageAlt.slice(0, 200) } : {}),
        ...(patch.footerAbout !== undefined ? { footerAbout: patch.footerAbout.trim().slice(0, 1000) } : {}),
        ...(patch.footerBottomBar !== undefined ? { footerBottomBar: patch.footerBottomBar.trim().slice(0, 300) } : {}),
        ...(patch.contact !== undefined
          ? {
              contact: {
                office: (patch.contact.office ?? current.contact.office).trim().slice(0, 300),
                email: (patch.contact.email ?? current.contact.email).trim().toLowerCase().slice(0, 254),
                phoneDisplay: (patch.contact.phoneDisplay ?? current.contact.phoneDisplay).trim().slice(0, 60),
                phoneHref: (patch.contact.phoneHref ?? current.contact.phoneHref).trim().slice(0, 60),
                ...(patch.contact.whatsappHref !== undefined
                  ? { whatsappHref: patch.contact.whatsappHref.trim().slice(0, 120) }
                  : current.contact.whatsappHref
                    ? { whatsappHref: current.contact.whatsappHref }
                    : {}),
                ...(patch.contact.hours !== undefined
                  ? { hours: patch.contact.hours.trim().slice(0, 200) }
                  : current.contact.hours
                    ? { hours: current.contact.hours }
                    : {}),
                ...(patch.contact.responseNote !== undefined
                  ? { responseNote: patch.contact.responseNote.trim().slice(0, 500) }
                  : current.contact.responseNote
                    ? { responseNote: current.contact.responseNote }
                    : {}),
              },
            }
          : {}),
        ...(patch.nav !== undefined ? { nav: patch.nav.slice(0, 20) } : {}),
        updatedAt: Date.now(),
      });
      return null;
    }
    // No doc yet — create with sensible defaults merged with patch.
    await ctx.db.insert("siteSettings", {
      siteName: (patch.siteName ?? "UAE Trade Gateway").trim().slice(0, 120),
      tagline: (patch.tagline ?? "Global Trade. Seamless Supply. Trusted from the UAE.").trim().slice(0, 300),
      description: (patch.description ?? "").trim().slice(0, 1000),
      primaryCta: (patch.primaryCta ?? "Request a Quote").trim().slice(0, 80),
      ...(patch.heroBadge ? { heroBadge: patch.heroBadge.trim().slice(0, 200) } : {}),
      ...(patch.heroHeadline ? { heroHeadline: patch.heroHeadline.trim().slice(0, 300) } : {}),
      ...(patch.heroSub ? { heroSub: patch.heroSub.trim().slice(0, 1000) } : {}),
      ...(patch.heroImageUrl ? { heroImageUrl: patch.heroImageUrl } : {}),
      ...(patch.heroImageAlt ? { heroImageAlt: patch.heroImageAlt.slice(0, 200) } : {}),
      ...(patch.footerAbout ? { footerAbout: patch.footerAbout.trim().slice(0, 1000) } : {}),
      ...(patch.footerBottomBar ? { footerBottomBar: patch.footerBottomBar.trim().slice(0, 300) } : {}),
      contact: {
        office: (patch.contact?.office ?? "Jebel Ali, Dubai, UAE").trim().slice(0, 300),
        email: (patch.contact?.email ?? "trade@example.ae").trim().toLowerCase().slice(0, 254),
        phoneDisplay: (patch.contact?.phoneDisplay ?? "+971 4 000 0000").trim().slice(0, 60),
        phoneHref: (patch.contact?.phoneHref ?? "tel:+971400000000").trim().slice(0, 60),
        ...(patch.contact?.whatsappHref ? { whatsappHref: patch.contact.whatsappHref.trim().slice(0, 120) } : {}),
        ...(patch.contact?.hours ? { hours: patch.contact.hours.trim().slice(0, 200) } : {}),
        ...(patch.contact?.responseNote ? { responseNote: patch.contact.responseNote.trim().slice(0, 500) } : {}),
      },
      ...(patch.nav ? { nav: patch.nav.slice(0, 20) } : {}),
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const upsertSection = mutation({
  args: {
    key: v.string(),
    eyebrow: v.optional(v.string()),
    headline: v.optional(v.string()),
    body: v.optional(v.string()),
    steps: v.optional(
      v.array(v.object({ title: v.string(), text: v.string() })),
    ),
    imageUrl: v.optional(v.string()),
    imageAlt: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const key = args.key.trim().toLowerCase().slice(0, 40);
    if (!key) {
      throw new ConvexError({ code: "VALIDATION_ERROR", message: "Section key is required." });
    }
    const existing = await ctx.db
      .query("sections")
      .withIndex("by_key", (q) => q.eq("key", key))
      .unique();
    const doc = {
      ...(args.eyebrow !== undefined ? { eyebrow: args.eyebrow.trim().slice(0, 200) } : {}),
      ...(args.headline !== undefined ? { headline: args.headline.trim().slice(0, 300) } : {}),
      ...(args.body !== undefined ? { body: args.body.trim().slice(0, 5000) } : {}),
      ...(args.steps !== undefined
        ? {
            steps: args.steps
              .map((s) => ({ title: s.title.trim().slice(0, 120), text: s.text.trim().slice(0, 1000) }))
              .filter((s) => s.title || s.text)
              .slice(0, 20),
          }
        : {}),
      ...(args.imageUrl !== undefined ? { imageUrl: args.imageUrl } : {}),
      ...(args.imageAlt !== undefined ? { imageAlt: args.imageAlt.slice(0, 200) } : {}),
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch("sections", existing._id, doc);
      return null;
    }
    await ctx.db.insert("sections", { key, ...doc });
    return null;
  },
});
