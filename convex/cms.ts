import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import {
  SECTION_KEYS,
  productValidator,
  sectionValidator,
  serviceValidator,
  siteSettingsValidator,
} from "./schema";
import { requireAdmin } from "./adminAuth";
import { SEED_SITE_SETTINGS } from "./seedData";
import type { Product, Service, SiteSettings } from "./seedData";

// ---------------------------------------------------------------------------
// CMS content API — frozen contract v2.
//
// Public (no login — the landing page is statically renderable):
//   siteSettings.get  -> SiteSettingsDoc (fallback doc, never throws)
//   sections.getAll   -> SectionDoc[]
//   products.listPublished -> ProductDoc[] (isPublished, sortOrder asc)
//   services.listPublished -> ServiceDoc[]
//
// Admin (requireAdmin — stubbed fail-closed until Kabir wires Convex Auth):
//   siteSettings.update(patch)            -> null
//   sections.upsert({key, ...})           -> null
//   products.create/update/remove         -> {id} / null
//   services.create/update/remove         -> {id} / null
//   + admin-only readers (drafts incl. unpublished):
//   products.listAdmin / getAdmin, services.listAdmin / getAdmin
//
// Rules: lengths validated, HTML stripped (plain text only), product slugs
// unique, soft-publish via isPublished (UI unpublishes; remove hard-deletes).
// ---------------------------------------------------------------------------

function fail(message: string): never {
  throw new ConvexError({ code: "VALIDATION_ERROR", message });
}

// --- sanitizers (admin CMS input: strip HTML, enforce lengths) --------------

function reqLine(value: string, max: number, field: string): string {
  const cleaned = value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (cleaned.length < 1) fail(`${field} is required.`);
  if (cleaned.length > max) fail(`${field} is too long (max ${max} characters).`);
  return cleaned;
}

function optLine(
  value: string | undefined,
  max: number,
  field: string,
): string | undefined {
  if (value === undefined) return undefined;
  const cleaned = value.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  if (cleaned.length > max) fail(`${field} is too long (max ${max} characters).`);
  return cleaned === "" ? undefined : cleaned;
}

function reqBody(value: string, max: number, field: string): string {
  const cleaned = value
    .replace(/<[^>]*>/g, "")
    .replace(/\r\n?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (cleaned.length < 1) fail(`${field} is required.`);
  if (cleaned.length > max) fail(`${field} is too long (max ${max} characters).`);
  return cleaned;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  if (!slug) fail("Could not derive a URL slug from the title.");
  return slug;
}

async function uniqueProductSlug(
  ctx: MutationCtx,
  base: string,
  excludeId?: Id<"products">,
): Promise<string> {
  let candidate = base;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (attempt > 0) candidate = `${base}-${attempt + 1}`;
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", candidate))
      .unique();
    if (!existing || existing._id === excludeId) return candidate;
  }
  fail("Could not generate a unique slug — please edit the title.");
}

// --- contact / hero / footer sanitizers -------------------------------------

function cleanContact(raw: {
  office: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref?: string;
  hours?: string;
  responseNote?: string;
}) {
  const email = reqLine(raw.email, 254, "Contact email").toLowerCase();
  if (!EMAIL_RE.test(email)) fail("Contact email is not a valid email address.");
  return {
    office: reqLine(raw.office, 200, "Office"),
    email,
    phoneDisplay: reqLine(raw.phoneDisplay, 40, "Phone display"),
    phoneHref: reqLine(raw.phoneHref, 60, "Phone link"),
    ...(optLine(raw.whatsappHref, 200, "WhatsApp link")
      ? { whatsappHref: optLine(raw.whatsappHref, 200, "WhatsApp link")! }
      : {}),
    ...(optLine(raw.hours, 200, "Hours")
      ? { hours: optLine(raw.hours, 200, "Hours")! }
      : {}),
    ...(optLine(raw.responseNote, 500, "Response note")
      ? { responseNote: optLine(raw.responseNote, 500, "Response note")! }
      : {}),
  };
}

function cleanHero(raw: {
  badge: string;
  headline: string;
  sub: string;
  assurances: { title: string; text: string }[];
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
}) {
  if (!Array.isArray(raw.assurances) || raw.assurances.length < 1) {
    fail("Hero needs at least one assurance.");
  }
  if (raw.assurances.length > 6) fail("Hero allows at most 6 assurances.");
  return {
    badge: reqLine(raw.badge, 120, "Hero badge"),
    headline: reqLine(raw.headline, 200, "Hero headline"),
    sub: reqBody(raw.sub, 1000, "Hero sub"),
    assurances: raw.assurances.map((a) => ({
      title: reqLine(a.title, 120, "Assurance title"),
      text: reqLine(a.text, 300, "Assurance text"),
    })),
    ...(optLine(raw.ctaPrimaryLabel, 60, "Primary CTA label")
      ? { ctaPrimaryLabel: optLine(raw.ctaPrimaryLabel, 60, "Primary CTA label")! }
      : {}),
    ...(optLine(raw.ctaPrimaryHref, 500, "Primary CTA link")
      ? { ctaPrimaryHref: optLine(raw.ctaPrimaryHref, 500, "Primary CTA link")! }
      : {}),
    ...(optLine(raw.ctaSecondaryLabel, 60, "Secondary CTA label")
      ? { ctaSecondaryLabel: optLine(raw.ctaSecondaryLabel, 60, "Secondary CTA label")! }
      : {}),
    ...(optLine(raw.ctaSecondaryHref, 500, "Secondary CTA link")
      ? { ctaSecondaryHref: optLine(raw.ctaSecondaryHref, 500, "Secondary CTA link")! }
      : {}),
  };
}

// --- public return validators (content shape + resolved image URLs) ----------

const publicProductValidator = productValidator.extend({
  imageUrl: v.union(v.string(), v.null()),
});

const publicSiteSettingsValidator = siteSettingsValidator.extend({
  heroImageUrl: v.union(v.string(), v.null()),
  aboutImageUrl: v.union(v.string(), v.null()),
});

async function resolveImageUrl(
  ctx: QueryCtx | MutationCtx,
  storageId: Id<"_storage"> | undefined,
  fallback: string | undefined,
): Promise<string | null> {
  if (storageId !== undefined) {
    const url = await ctx.storage.getUrl(storageId);
    if (url) return url;
  }
  return fallback ?? null;
}

// --- public queries (empty-DB safe: fallbacks, never throw) ------------------

export const getSiteSettings = query({
  args: {},
  returns: publicSiteSettingsValidator,
  handler: async (ctx) => {
    const doc = await ctx.db.query("siteSettings").first();
    const base = doc
      ? {
          siteName: doc.siteName,
          tagline: doc.tagline,
          description: doc.description,
          primaryCta: doc.primaryCta,
          hero: doc.hero,
          footer: doc.footer,
          contact: doc.contact,
          nav: doc.nav,
          ...(doc.heroImageStorageId !== undefined
            ? { heroImageStorageId: doc.heroImageStorageId }
            : {}),
          ...(doc.aboutImageStorageId !== undefined
            ? { aboutImageStorageId: doc.aboutImageStorageId }
            : {}),
        }
      : SEED_SITE_SETTINGS;
    return {
      ...base,
      heroImageUrl: await resolveImageUrl(
        ctx,
        base.heroImageStorageId,
        undefined,
      ),
      aboutImageUrl: await resolveImageUrl(
        ctx,
        base.aboutImageStorageId,
        undefined,
      ),
    };
  },
});

export const getSections = query({
  args: {},
  returns: v.array(sectionValidator),
  handler: async (ctx) => {
    const docs = await ctx.db.query("sections").take(50);
    return docs.map((doc) => ({
      key: doc.key,
      eyebrow: doc.eyebrow,
      headline: doc.headline,
      body: doc.body,
      ...(doc.items !== undefined ? { items: doc.items } : {}),
      ...(doc.imageStorageId !== undefined
        ? { imageStorageId: doc.imageStorageId }
        : {}),
    }));
  },
});

export const listPublishedProducts = query({
  args: {},
  returns: v.array(publicProductValidator),
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("products")
      .withIndex("by_sortOrder")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .take(100);
    return await Promise.all(
      docs.map(async (doc) => ({
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        items: doc.items,
        ...(doc.imageStorageId !== undefined
          ? { imageStorageId: doc.imageStorageId }
          : {}),
        ...(doc.imageUrlFallback !== undefined
          ? { imageUrlFallback: doc.imageUrlFallback }
          : {}),
        alt: doc.alt,
        sortOrder: doc.sortOrder,
        isPublished: doc.isPublished,
        imageUrl: await resolveImageUrl(
          ctx,
          doc.imageStorageId,
          doc.imageUrlFallback,
        ),
      })),
    );
  },
});

export const listPublishedServices = query({
  args: {},
  returns: v.array(serviceValidator),
  handler: async (ctx) => {
    const docs = await ctx.db
      .query("services")
      .withIndex("by_sortOrder")
      .filter((q) => q.eq(q.field("isPublished"), true))
      .take(100);
    return docs.map((doc) => ({
      title: doc.title,
      description: doc.description,
      ...(doc.icon !== undefined ? { icon: doc.icon } : {}),
      ...(doc.meta !== undefined ? { meta: doc.meta } : {}),
      sortOrder: doc.sortOrder,
      isPublished: doc.isPublished,
    }));
  },
});

// --- admin readers (see drafts incl. unpublished) ----------------------------

const productAdminValidator = productValidator.extend({
  _id: v.id("products"),
  _creationTime: v.number(),
});

const serviceAdminValidator = serviceValidator.extend({
  _id: v.id("services"),
  _creationTime: v.number(),
});

export const listProductsAdmin = query({
  args: {},
  returns: v.array(productAdminValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("products")
      .withIndex("by_sortOrder")
      .take(100);
  },
});

export const getProductAdmin = query({
  args: { id: v.id("products") },
  returns: v.union(productAdminValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("products", args.id);
  },
});

export const listServicesAdmin = query({
  args: {},
  returns: v.array(serviceAdminValidator),
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db
      .query("services")
      .withIndex("by_sortOrder")
      .take(100);
  },
});

export const getServiceAdmin = query({
  args: { id: v.id("services") },
  returns: v.union(serviceAdminValidator, v.null()),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.get("services", args.id);
  },
});

// --- admin mutations ----------------------------------------------------------

export const updateSiteSettings = mutation({
  args: { patch: siteSettingsValidator.partial() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (Object.keys(args.patch).length === 0) fail("Nothing to update.");
    const patch: { [K in keyof SiteSettings]?: SiteSettings[K] } = {};
    const p = args.patch;
    if (p.siteName !== undefined) patch.siteName = reqLine(p.siteName, 100, "Site name");
    if (p.tagline !== undefined) patch.tagline = reqLine(p.tagline, 200, "Tagline");
    if (p.description !== undefined)
      patch.description = reqBody(p.description, 2000, "Description");
    if (p.primaryCta !== undefined)
      patch.primaryCta = reqLine(p.primaryCta, 60, "Primary CTA");
    if (p.hero !== undefined) patch.hero = cleanHero(p.hero);
    if (p.footer !== undefined) {
      patch.footer = {
        about: reqBody(p.footer.about, 1000, "Footer about"),
        bottomBar: reqLine(p.footer.bottomBar, 300, "Footer bottom bar"),
      };
    }
    if (p.contact !== undefined) patch.contact = cleanContact(p.contact);
    if (p.nav !== undefined) {
      if (p.nav.length > 10) fail("Nav allows at most 10 links.");
      patch.nav = p.nav.map((item) => ({
        href: reqLine(item.href, 200, "Nav link target"),
        label: reqLine(item.label, 60, "Nav label"),
      }));
    }
    if (p.heroImageStorageId !== undefined)
      patch.heroImageStorageId = p.heroImageStorageId;
    if (p.aboutImageStorageId !== undefined)
      patch.aboutImageStorageId = p.aboutImageStorageId;

    const existing = await ctx.db.query("siteSettings").first();
    if (!existing) {
      // First admin save: merge over live-copy defaults so a partial patch
      // still yields a complete doc.
      await ctx.db.insert("siteSettings", {
        ...structuredClone(SEED_SITE_SETTINGS),
        ...patch,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.patch("siteSettings", existing._id, {
        ...patch,
        updatedAt: Date.now(),
      });
    }
    return null;
  },
});

export const upsertSection = mutation({
  args: {
    key: v.string(),
    eyebrow: v.string(),
    headline: v.string(),
    body: v.string(),
    items: v.optional(
      v.array(
        v.object({
          title: v.string(),
          text: v.string(),
          meta: v.optional(v.string()),
        }),
      ),
    ),
    imageStorageId: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (!(SECTION_KEYS as readonly string[]).includes(args.key)) {
      fail(`Unknown section key "${args.key}".`);
    }
    if (args.items !== undefined && args.items.length > 20) {
      fail("A section allows at most 20 items.");
    }
    const doc = {
      key: args.key,
      eyebrow: reqLine(args.eyebrow, 120, "Eyebrow"),
      headline: reqLine(args.headline, 200, "Headline"),
      body: reqBody(args.body, 5000, "Body"),
      ...(args.items !== undefined
        ? {
            items: args.items.map((item) => ({
              title: reqLine(item.title, 120, "Item title"),
              text: reqBody(item.text, 1000, "Item text"),
              ...(optLine(item.meta, 40, "Item meta")
                ? { meta: optLine(item.meta, 40, "Item meta")! }
                : {}),
            })),
          }
        : {}),
      ...(args.imageStorageId !== undefined
        ? { imageStorageId: args.imageStorageId }
        : {}),
      updatedAt: Date.now(),
    };
    const existing = await ctx.db
      .query("sections")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();
    if (existing) {
      await ctx.db.patch("sections", existing._id, doc);
    } else {
      await ctx.db.insert("sections", doc);
    }
    return null;
  },
});

function cleanProductFields(raw: {
  title: string;
  description: string;
  items: string[];
  imageUrlFallback?: string;
  alt: string;
  sortOrder: number;
  isPublished: boolean;
}) {
  if (!Array.isArray(raw.items) || raw.items.length < 1) {
    fail("A product needs at least one item.");
  }
  if (raw.items.length > 20) fail("A product allows at most 20 items.");
  if (!Number.isFinite(raw.sortOrder)) fail("Sort order must be a number.");
  return {
    title: reqLine(raw.title, 120, "Title"),
    description: reqBody(raw.description, 2000, "Description"),
    items: raw.items.map((item) => reqLine(item, 120, "Item")),
    ...(optLine(raw.imageUrlFallback, 2000, "Image fallback URL")
      ? { imageUrlFallback: optLine(raw.imageUrlFallback, 2000, "Image fallback URL")! }
      : {}),
    alt: reqLine(raw.alt, 200, "Image alt text"),
    sortOrder: raw.sortOrder,
    isPublished: raw.isPublished,
  };
}

export const createProduct = mutation({
  args: {
    title: v.string(),
    slug: v.optional(v.string()),
    description: v.string(),
    items: v.array(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrlFallback: v.optional(v.string()),
    alt: v.string(),
    sortOrder: v.number(),
    isPublished: v.boolean(),
  },
  returns: v.object({ id: v.id("products") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const fields = cleanProductFields(args);
    const base = args.slug ? reqLine(args.slug, 120, "Slug").toLowerCase() : fields.title;
    const slug = await uniqueProductSlug(ctx, slugify(base));
    const id = await ctx.db.insert("products", {
      ...fields,
      slug,
      ...(args.imageStorageId !== undefined
        ? { imageStorageId: args.imageStorageId }
        : {}),
      updatedAt: Date.now(),
    });
    return { id };
  },
});

export const updateProduct = mutation({
  args: {
    id: v.id("products"),
    patch: productValidator.omit("slug").partial().extend({ slug: v.optional(v.string()) }),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("products", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Product not found." });
    }
    if (Object.keys(args.patch).length === 0) fail("Nothing to update.");
    const patch: { [K in keyof Product]?: Product[K] } = {};
    const p = args.patch;
    if (p.title !== undefined) patch.title = reqLine(p.title, 120, "Title");
    if (p.slug !== undefined) {
      patch.slug = await uniqueProductSlug(
        ctx,
        slugify(reqLine(p.slug, 120, "Slug").toLowerCase()),
        args.id,
      );
    }
    if (p.description !== undefined)
      patch.description = reqBody(p.description, 2000, "Description");
    if (p.items !== undefined) {
      if (p.items.length < 1) fail("A product needs at least one item.");
      if (p.items.length > 20) fail("A product allows at most 20 items.");
      patch.items = p.items.map((item) => reqLine(item, 120, "Item"));
    }
    if (p.imageStorageId !== undefined) patch.imageStorageId = p.imageStorageId;
    if (p.imageUrlFallback !== undefined) {
      const cleaned = optLine(p.imageUrlFallback, 2000, "Image fallback URL");
      patch.imageUrlFallback = cleaned;
    }
    if (p.alt !== undefined) patch.alt = reqLine(p.alt, 200, "Image alt text");
    if (p.sortOrder !== undefined) {
      if (!Number.isFinite(p.sortOrder)) fail("Sort order must be a number.");
      patch.sortOrder = p.sortOrder;
    }
    if (p.isPublished !== undefined) patch.isPublished = p.isPublished;
    await ctx.db.patch("products", args.id, {
      ...patch,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const removeProduct = mutation({
  args: { id: v.id("products") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("products", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Product not found." });
    }
    await ctx.db.delete("products", args.id);
    return null;
  },
});

function cleanServiceFields(raw: {
  title: string;
  description: string;
  icon?: string;
  meta?: string;
  sortOrder: number;
  isPublished: boolean;
}) {
  if (!Number.isFinite(raw.sortOrder)) fail("Sort order must be a number.");
  return {
    title: reqLine(raw.title, 120, "Title"),
    description: reqBody(raw.description, 2000, "Description"),
    ...(optLine(raw.icon, 120, "Icon")
      ? { icon: optLine(raw.icon, 120, "Icon")! }
      : {}),
    ...(optLine(raw.meta, 200, "Meta")
      ? { meta: optLine(raw.meta, 200, "Meta")! }
      : {}),
    sortOrder: raw.sortOrder,
    isPublished: raw.isPublished,
  };
}

export const createService = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    icon: v.optional(v.string()),
    meta: v.optional(v.string()),
    sortOrder: v.number(),
    isPublished: v.boolean(),
  },
  returns: v.object({ id: v.id("services") }),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const id = await ctx.db.insert("services", {
      ...cleanServiceFields(args),
      updatedAt: Date.now(),
    });
    return { id };
  },
});

export const updateService = mutation({
  args: {
    id: v.id("services"),
    patch: serviceValidator.partial(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("services", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Service not found." });
    }
    if (Object.keys(args.patch).length === 0) fail("Nothing to update.");
    const patch: { [K in keyof Service]?: Service[K] } = {};
    const p = args.patch;
    if (p.title !== undefined) patch.title = reqLine(p.title, 120, "Title");
    if (p.description !== undefined)
      patch.description = reqBody(p.description, 2000, "Description");
    if (p.icon !== undefined) patch.icon = optLine(p.icon, 120, "Icon");
    if (p.meta !== undefined) patch.meta = optLine(p.meta, 200, "Meta");
    if (p.sortOrder !== undefined) {
      if (!Number.isFinite(p.sortOrder)) fail("Sort order must be a number.");
      patch.sortOrder = p.sortOrder;
    }
    if (p.isPublished !== undefined) patch.isPublished = p.isPublished;
    await ctx.db.patch("services", args.id, {
      ...patch,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const removeService = mutation({
  args: { id: v.id("services") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("services", args.id);
    if (!existing) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Service not found." });
    }
    await ctx.db.delete("services", args.id);
    return null;
  },
});
