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

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
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

  // GIF: GIF87a / GIF89a
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
      "That file does not look like a JPG, PNG, WEBP or GIF image.",
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
