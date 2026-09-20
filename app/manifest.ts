import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

/** PWA manifest — installable identity for the landing page. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — ${site.tagline}`,
    short_name: site.name,
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#FDFBF7",
    theme_color: "#081226",
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
