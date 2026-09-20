/**
 * Serves images uploaded through the CMS (stored in the database).
 * Public endpoint with long-lived caching — image URLs are immutable
 * (replacing an image creates a new URL).
 */
import { loadImage } from "@/lib/images";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  ctx: RouteContext<"/api/images/[id]">,
) {
  const { id } = await ctx.params;

  const imageId = Number.parseInt(id, 10);
  if (!Number.isInteger(imageId) || imageId < 1 || String(imageId) !== id) {
    return new Response("Not found", { status: 404 });
  }

  let image: { data: Buffer; mimeType: string } | null = null;
  try {
    image = await loadImage(imageId);
  } catch {
    return new Response("Image service unavailable", { status: 503 });
  }

  if (!image) {
    return new Response("Not found", { status: 404 });
  }

  const body = new Uint8Array(image.data);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": image.mimeType,
      "Content-Length": String(body.byteLength),
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
