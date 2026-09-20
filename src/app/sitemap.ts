import type { MetadataRoute } from "next";
import { getAbsoluteSiteUrl } from "@/lib/site-url";

const publicRoutes = ["/", "/about", "/services", "/gallery", "/book", "/contact"];

/** The six indexable public pages. Administrative routes are intentionally excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.flatMap((route) => {
    const url = getAbsoluteSiteUrl(route);
    return url ? [{ url }] : [];
  });
}
