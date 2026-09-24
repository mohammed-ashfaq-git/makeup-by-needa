import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  await requireAdmin();

  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(galleryItems)
      .orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id)),
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Gallery</h1>
          <p>
            Your portfolio images. Upload new work, edit details, reorder or
            hide images from the public gallery.
          </p>
        </div>
      </div>

      {rows === null ? (
        <DbError />
      ) : (
        <GalleryManager
          items={rows.map((row) => ({
            id: row.id,
            imageUrl: row.imageUrl,
            mobileImageUrl: row.mobileImageUrl ?? null,
            title: row.title,
            caption: row.caption,
            altText: row.altText,
            category: row.category,
            mediaType: (row.mediaType ?? "image") as "image" | "video",
            videoUrl: row.videoUrl ?? null,
            active: row.active,
          }))}
        />
      )}
    </>
  );
}
