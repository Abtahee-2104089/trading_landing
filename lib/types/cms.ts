/**
 * Shared CMS types (Pal scope) — mirrors `convex/schema.ts` validators.
 *
 * Public sections import these + `lib/hooks/useCmsContent.ts` (live Convex
 * queries with local fallbacks). Admin pages import these for form state.
 * Do NOT duplicate shapes elsewhere — extend here.
 */

export type CmsContact = {
  office: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref?: string;
  hours?: string;
  responseNote?: string;
};

export type CmsProduct = {
  title: string;
  slug: string;
  description: string;
  items: string[];
  imageUrl: string | null;
  imageUrlFallback?: string;
  alt: string;
  sortOrder: number;
  isPublished: boolean;
};

export type CmsService = {
  title: string;
  description: string;
  icon?: string;
  meta?: string;
  sortOrder: number;
  isPublished: boolean;
};

export type CmsNavItem = {
  href: string;
  label: string;
};

export type CmsHeroAssurance = {
  title: string;
  text: string;
};

export type CmsHero = {
  badge: string;
  headline: string;
  sub: string;
  assurances: CmsHeroAssurance[];
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
};

export type CmsFooter = {
  about: string;
  bottomBar: string;
};

export type CmsSectionItem = {
  title: string;
  text: string;
  meta?: string;
};

export type CmsSection = {
  key: string;
  eyebrow: string;
  headline: string;
  body: string;
  items?: CmsSectionItem[];
  /** Resolved public image URL (UploadThing, legacy storage, or null). */
  imageUrl?: string | null;
};

/** Full `cms.getSiteSettings` doc shape (single source for chrome). */
export type CmsSiteDoc = {
  siteName: string;
  tagline: string;
  description: string;
  primaryCta: string;
  hero: CmsHero;
  footer: CmsFooter;
  contact: CmsContact;
  nav: CmsNavItem[];
  heroImageUrl: string | null;
  aboutImageUrl: string | null;
};

export type CmsSiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  primaryCta: string;
  contact: CmsContact;
  heroImageUrl?: string | null;
  aboutImageUrl?: string | null;
};

export const SECTION_KEYS = [
  "hero",
  "about",
  "network",
  "trust",
  "contact",
  "footer",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];
