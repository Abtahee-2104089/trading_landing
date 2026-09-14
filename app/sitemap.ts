import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** SEO: single-page sitemap with section anchors omitted (one URL). */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${site.url}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
