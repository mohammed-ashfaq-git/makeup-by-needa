/**
 * Canonical public-site URL helpers.
 *
 * NEXT_PUBLIC_SITE_URL is required in production. Returning null for an
 * absent or malformed value keeps local development usable without emitting
 * a misleading localhost canonical URL or sitemap entry.
 */
export function getSiteUrl(): URL | null {
  const value = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    url.hash = "";
    url.search = "";
    return url;
  } catch {
    return null;
  }
}

/** Returns an absolute public URL only when the site URL is configured. */
export function getAbsoluteSiteUrl(path: string): string | undefined {
  const siteUrl = getSiteUrl();
  return siteUrl ? new URL(path, siteUrl).toString() : undefined;
}
