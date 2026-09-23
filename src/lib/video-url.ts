/**
 * Client-safe helpers for video URLs (YouTube, Vimeo, direct video files).
 *
 * This module has zero database or server dependencies and can be safely
 * imported by client components and server components alike.
 */

/** Returns true if url is a YouTube or Vimeo URL. */
export function isExternalVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(url);
}

/** Extracts the 11-character video ID from various YouTube URL formats. */
export function extractYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/,
  );
  return match ? match[1] : null;
}

/** Returns YouTube high-quality thumbnail image URL if valid YouTube URL. */
export function getYouTubeThumbnailUrl(
  url: string | null | undefined,
): string | null {
  const id = extractYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

/** Extracts the numeric Vimeo video ID. */
export function extractVimeoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match ? match[1] : null;
}

/**
 * Converts a video URL into an embeddable iframe URL (YouTube or Vimeo).
 * Returns null for direct video files (e.g. .mp4, /api/images/...) so they
 * can be played with HTML5 <video>.
 */
export function toVideoEmbedUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();

  const ytId = extractYouTubeId(trimmed);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0`;
  }

  const vimeoId = extractVimeoId(trimmed);
  if (vimeoId) {
    return `https://player.vimeo.com/video/${vimeoId}?autoplay=1`;
  }

  if (/player\.vimeo\.com\/video\//i.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/** True when a URL points at a direct video file or managed video upload. */
export function isDirectVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  if (isExternalVideoUrl(url)) return false;
  return (
    /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url) ||
    /^\/api\/images\/\d+/.test(url)
  );
}
