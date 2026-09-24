/**
 * Image upload handling.
 *
 * Uploaded images are validated (size + magic bytes), stored in the
 * `site_images` table, and served publicly from /api/images/:id with
 * long-lived cache headers. No third-party service involved.
 */
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { siteImages } from "@/lib/db/schema";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_VIDEO_BYTES = 40 * 1024 * 1024; // 40 MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export class ImageValidationError extends Error {}

/** Detects the real image type from magic bytes (ignores the declared MIME). */
function detectImageType(bytes: Uint8Array): string | null {
  if (bytes.length < 12) return null;

  // JPEG: FF D8 FF
  if (
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg";
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "image/png";
  }

  // GIF: GIF87a / GIF89a. Detect it so the allow-list explicitly rejects it.
  if (
    bytes[0] === 0x47 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x38 &&
    (bytes[4] === 0x37 || bytes[4] === 0x39) &&
    bytes[5] === 0x61
  ) {
    return "image/gif";
  }

  // WEBP: RIFF....WEBP
  if (
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }

  return null;
}

export type ProcessedImage = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
};

export type ProcessedMedia = {
  buffer: Buffer;
  mimeType: string;
  filename: string;
  mediaType: "image" | "video";
};

/** Detects media type (image or video) from magic bytes, declared MIME, or extension. */
function detectMediaType(
  bytes: Uint8Array,
  declaredType?: string,
  fileName?: string,
): { mediaType: "image" | "video"; mimeType: string } | null {
  const imageType = detectImageType(bytes);
  if (imageType && ALLOWED_MIME_TYPES.has(imageType)) {
    return { mediaType: "image", mimeType: imageType };
  }

  // WebM: 1A 45 DF A3
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return { mediaType: "video", mimeType: "video/webm" };
  }

  // MP4/MOV: 'ftyp', 'moov', 'mdat', 'wide' at offset 4
  if (bytes.length >= 12) {
    const boxType = String.fromCharCode(bytes[4], bytes[5], bytes[6], bytes[7]);
    if (boxType === "ftyp" || boxType === "moov" || boxType === "mdat" || boxType === "wide") {
      const brand = String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
      if (brand === "qt  ") {
        return { mediaType: "video", mimeType: "video/quicktime" };
      }
      return { mediaType: "video", mimeType: "video/mp4" };
    }
  }

  // Fallback to declared type and extension for standard video formats
  const ext = fileName?.split(".").pop()?.toLowerCase();
  if (declaredType === "video/mp4" || ext === "mp4" || ext === "m4v") {
    return { mediaType: "video", mimeType: "video/mp4" };
  }
  if (declaredType === "video/webm" || ext === "webm") {
    return { mediaType: "video", mimeType: "video/webm" };
  }
  if (declaredType === "video/quicktime" || ext === "mov") {
    return { mediaType: "video", mimeType: "video/quicktime" };
  }

  return null;
}

/**
 * Validates an uploaded media file (image up to 5 MB or video up to 40 MB).
 * Throws ImageValidationError with a client-safe message.
 */
export async function processMediaUpload(
  file: unknown,
  _fieldName = "media",
): Promise<ProcessedMedia | null> {
  if (file == null) return null;
  if (!(file instanceof File) || file.size === 0) return null;

  if (file.size > MAX_VIDEO_BYTES) {
    throw new ImageValidationError(
      "The file is too large. Please choose an image under 5 MB or video under 40 MB.",
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectMediaType(buffer, file.type, file.name);

  if (!detected) {
    throw new ImageValidationError(
      "Unsupported format. Please upload JPG, PNG, WEBP for images, or MP4, WebM, MOV for videos.",
    );
  }

  if (detected.mediaType === "image" && file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError(
      "The image is too large. Please choose a file under 5 MB.",
    );
  }

  const originalName = file.name || "upload";
  const safeName = originalName.replace(/[^\w.\- ]+/g, "_").slice(0, 120);

  return {
    buffer,
    mimeType: detected.mimeType,
    filename: safeName,
    mediaType: detected.mediaType,
  };
}

/**
 * Validates an uploaded file and returns its bytes plus the detected
 * MIME type. Throws ImageValidationError with a client-safe message.
 */
export async function processImageUpload(
  file: unknown,
  fieldName = "image",
): Promise<ProcessedImage | null> {
  if (file == null) return null;
  if (!(file instanceof File) || file.size === 0) return null;

  if (file.size > MAX_IMAGE_BYTES) {
    throw new ImageValidationError(
      `The image is too large. Please choose a file under 5 MB.`,
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const detected = detectImageType(buffer);

  if (!detected || !ALLOWED_MIME_TYPES.has(detected)) {
    throw new ImageValidationError(
      "That file does not look like a JPG, PNG, or WEBP image.",
    );
  }

  const originalName = file.name || "upload";
  const safeName = originalName.replace(/[^\w.\- ]+/g, "_").slice(0, 120);

  return { buffer, mimeType: detected, filename: safeName };
}

/** Stores processed image bytes and returns its public URL. */
export async function storeImage(image: ProcessedImage): Promise<string> {
  const db = getDb();
  const result = await db.insert(siteImages).values({
    filename: image.filename,
    mimeType: image.mimeType,
    byteSize: image.buffer.length,
    data: image.buffer,
  });
  const insertId = Number(
    (result[0] as { insertId: number | undefined }).insertId,
  );
  return `/api/images/${insertId}`;
}

/** Loads a stored image for serving. */
export async function loadImage(
  id: number,
): Promise<{ data: Buffer; mimeType: string } | null> {
  const rows = await getDb()
    .select({ data: siteImages.data, mimeType: siteImages.mimeType })
    .from(siteImages)
    .where(eq(siteImages.id, id))
    .limit(1);
  return rows[0] ?? null;
}

const MANAGED_IMAGE_PATTERN = /^\/api\/images\/(\d+)$/;

/** True when a URL points at an image managed by the upload system. */
export function isManagedImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return MANAGED_IMAGE_PATTERN.test(url);
}

/** Deletes the stored image behind a managed URL (no-op for static paths). */
export async function deleteManagedImage(
  url: string | null | undefined,
): Promise<void> {
  if (!url) return;
  const match = MANAGED_IMAGE_PATTERN.exec(url);
  if (!match) return;
  try {
    await getDb()
      .delete(siteImages)
      .where(eq(siteImages.id, Number(match[1])));
  } catch {
    // Orphaned image rows are harmless; ignore.
  }
}
