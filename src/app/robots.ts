import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

/** Public crawlers may index the site, but never the administrator area. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: getAbsoluteSiteUrl("/sitemap.xml"),
  };
}
