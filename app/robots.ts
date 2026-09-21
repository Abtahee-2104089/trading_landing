import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** SEO: allow indexing of the single landing page, block API internals. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${site.url}/sitemap.xml`,
  };
}
