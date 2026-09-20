/**
 * Shared CMS types (frozen contract v2 — Pal/Orny import, never duplicate).
 * Mirrors convex/schema.ts tables + convex/cms.ts public query shapes.
 */

export type SiteContact = {
  office: string;
  email: string;
  phoneDisplay: string;
  phoneHref: string;
  whatsappHref?: string;
  hours?: string;
  responseNote?: string;
};

export type SiteSettings = {
  siteName: string;
  tagline: string;
  description: string;
  primaryCta: string;
  heroBadge?: string;
  heroHeadline?: string;
  heroSub?: string;
  heroImageUrl?: string;
  heroImageAlt?: string;
  footerAbout?: string;
  footerBottomBar?: string;
  contact: SiteContact;
  nav?: Array<{ href: string; label: string }>;
};

export type SectionKey =
  | "hero"
  | "about"
  | "network"
  | "trust"
  | "contact"
  | "footer";

export type SectionDoc = {
  _id?: string;
  key: SectionKey;
  eyebrow?: string;
  headline?: string;
  body?: string;
  steps?: Array<{ title: string; text: string }>;
  imageUrl?: string;
  imageAlt?: string;
};

export type ProductDoc = {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  items: string[];
  imageUrl?: string;
  imageStorageId?: string;
  alt?: string;
  sortOrder: number;
  isPublished: boolean;
};

export type ServiceDoc = {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  meta?: string;
  sortOrder: number;
  isPublished: boolean;
};

export type MediaDoc = {
  _id?: string;
  storageId: string;
  url: string;
  alt: string;
  usedBy?: string;
  createdAt?: number;
};
