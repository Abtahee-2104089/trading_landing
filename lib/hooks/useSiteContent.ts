"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { isConvexConfigured } from "@/app/providers/convex-provider";
import { site } from "@/lib/site";
import type {
  ProductDoc,
  SectionDoc,
  ServiceDoc,
  SiteSettings,
} from "@/lib/types/cms";

/**
 * Shared CMS read layer (fallback discipline: data OR fallback, never
 * undefined UI). Public page renders on empty DB / missing Convex URL.
 */

export const fallbackSite: SiteSettings = {
  siteName: site.name,
  tagline: site.tagline,
  description: site.description,
  primaryCta: site.primaryCta,
  contact: {
    office: site.contact.office,
    email: site.contact.email,
    phoneDisplay: site.contact.phoneDisplay,
    phoneHref: site.contact.phoneHref,
  },
  nav: [...site.nav],
};

export function useSiteSettings(): { data: SiteSettings; isLoading: boolean } {
  const enabled = isConvexConfigured();
  const doc = useQuery(
    api.cms.getSiteSettings,
    enabled ? {} : "skip",
  );
  if (doc === undefined || !enabled) {
    return { data: fallbackSite, isLoading: enabled };
  }
  if (doc === null) return { data: fallbackSite, isLoading: false };
  return {
    data: {
      siteName: doc.siteName,
      tagline: doc.tagline,
      description: doc.description,
      primaryCta: doc.primaryCta,
      heroBadge: doc.heroBadge,
      heroHeadline: doc.heroHeadline,
      heroSub: doc.heroSub,
      heroImageUrl: doc.heroImageUrl,
      heroImageAlt: doc.heroImageAlt,
      footerAbout: doc.footerAbout,
      footerBottomBar: doc.footerBottomBar,
      contact: {
        office: doc.contact.office,
        email: doc.contact.email,
        phoneDisplay: doc.contact.phoneDisplay,
        phoneHref: doc.contact.phoneHref,
        whatsappHref: doc.contact.whatsappHref,
        hours: doc.contact.hours,
        responseNote: doc.contact.responseNote,
      },
      nav: doc.nav ? [...doc.nav] : [...site.nav],
    },
    isLoading: false,
  };
}

export function useSections(): {
  data: SectionDoc[];
  isLoading: boolean;
  byKey: (key: string) => SectionDoc | undefined;
} {
  const enabled = isConvexConfigured();
  const docs = useQuery(api.cms.getSections, enabled ? {} : "skip");
  const data: SectionDoc[] =
    docs?.map((d) => ({
      _id: d._id,
      key: d.key as SectionDoc["key"],
      eyebrow: d.eyebrow,
      headline: d.headline,
      body: d.body,
      steps: d.steps ? d.steps.map((s) => ({ ...s })) : undefined,
      imageUrl: d.imageUrl,
      imageAlt: d.imageAlt,
    })) ?? [];
  return {
    data,
    isLoading: enabled && docs === undefined,
    byKey: (key: string) => data.find((s) => s.key === key),
  };
}

export function useProducts(): {
  data: ProductDoc[] | undefined;
  isLoading: boolean;
} {
  const enabled = isConvexConfigured();
  const docs = useQuery(
    api.cms.listPublishedProducts,
    enabled ? {} : "skip",
  );
  if (!enabled || docs === undefined) {
    return { data: undefined, isLoading: enabled };
  }
  return {
    data: docs.map((d) => ({
      _id: d._id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      items: [...d.items],
      imageUrl: d.imageUrl,
      imageStorageId: d.imageStorageId,
      alt: d.alt,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
    })),
    isLoading: false,
  };
}

export function useServices(): {
  data: ServiceDoc[] | undefined;
  isLoading: boolean;
} {
  const enabled = isConvexConfigured();
  const docs = useQuery(
    api.cms.listPublishedServices,
    enabled ? {} : "skip",
  );
  if (!enabled || docs === undefined) {
    return { data: undefined, isLoading: enabled };
  }
  return {
    data: docs.map((d) => ({
      _id: d._id,
      title: d.title,
      slug: d.slug,
      description: d.description,
      meta: d.meta,
      sortOrder: d.sortOrder,
      isPublished: d.isPublished,
    })),
    isLoading: false,
  };
}
