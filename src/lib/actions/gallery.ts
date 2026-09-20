"use server";

/**
 * Gallery actions: upload, edit, replace, delete, enable/disable, reorder.
 */
import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { galleryItems } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import {
  deleteManagedImage,
  isManagedImageUrl,
  processImageUpload,
  storeImage,
  ImageValidationError,
} from "@/lib/images";
import {
  readBoolean,
  readId,
  readOptionalFile,
  readString,
  type ActionState,
} from "@/lib/form";
import { galleryItemSchema } from "@/lib/schemas";

function revalidateGalleryPages() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/gallery");
}

export async function saveGalleryItemAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = readId(formData);
  const parsed = galleryItemSchema.safeParse({
    title: readString(formData, "title"),
    category: readString(formData, "category"),
    caption: readString(formData, "caption"),
    altText: readString(formData, "altText"),
    active: readBoolean(formData, "active"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return {
      ok: false,
      message: "Some fields need attention — see the highlighted fields below.",
      fieldErrors,
    };
  }

  const file = readOptionalFile(formData, "image");

  const db = getDb();

  try {
    let previousImage: string | null = null;
    let currentImage: string | null | undefined = undefined;

    if (id) {
      const existing = await db
        .select({ imageUrl: galleryItems.imageUrl })
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);

      if (!existing[0]) {
        return { ok: false, message: "That gallery item no longer exists." };
      }
      previousImage = existing[0].imageUrl;

      if (file) {
        const processed = await processImageUpload(file, "image");
        if (processed) currentImage = await storeImage(processed);
      }

      await db
        .update(galleryItems)
        .set({
          ...parsed.data,
          ...(currentImage !== undefined
            ? { imageUrl: currentImage }
            : {}),
        })
        .where(eq(galleryItems.id, id));
    } else {
      if (!file) {
        return {
          ok: false,
          message: "Please choose an image to upload.",
          fieldErrors: { image: "An image file is required." },
        };
      }

      const processed = await processImageUpload(file, "image");
      if (!processed) {
        return {
          ok: false,
          message: "Please choose an image to upload.",
          fieldErrors: { image: "An image file is required." },
        };
      }
      currentImage = await storeImage(processed);

      const maxOrder = await db
        .select({
          max: sql<number>`coalesce(max(${galleryItems.displayOrder}), 0)`,
        })
        .from(galleryItems);
      const nextOrder = Number(maxOrder[0]?.max ?? 0) + 10;

      await db.insert(galleryItems).values({
        ...parsed.data,
        imageUrl: currentImage,
        displayOrder: nextOrder,
      });
    }

    if (
      previousImage &&
      isManagedImageUrl(previousImage) &&
      previousImage !== currentImage
    ) {
      await deleteManagedImage(previousImage);
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return { ok: false, message: error.message, fieldErrors: { image: error.message } };
    }
    console.error("[gallery] save failed:", error);
    return { ok: false, message: "Could not save the gallery item. Please try again." };
  }

  revalidateGalleryPages();

  return {
    ok: true,
    message: id
      ? "Gallery item updated."
      : "Image uploaded and added to the gallery.",
  };
}

export async function deleteGalleryItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ imageUrl: galleryItems.imageUrl })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  await db.delete(galleryItems).where(eq(galleryItems.id, id));

  const image = existing[0]?.imageUrl;
  if (image && isManagedImageUrl(image)) {
    await deleteManagedImage(image);
  }

  revalidateGalleryPages();
}

export async function toggleGalleryItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ active: galleryItems.active })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);
  if (!existing[0]) return;

  await db
    .update(galleryItems)
    .set({ active: !existing[0].active })
    .where(eq(galleryItems.id, id));

  revalidateGalleryPages();
}

export async function moveGalleryItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const db = getDb();
  const rows = await db
    .select({ id: galleryItems.id })
    .from(galleryItems)
    .orderBy(asc(galleryItems.displayOrder), asc(galleryItems.id));

  const index = rows.findIndex((row) => row.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || neighborIndex < 0 || neighborIndex >= rows.length) return;

  const reordered = [...rows];
  [reordered[index], reordered[neighborIndex]] = [
    reordered[neighborIndex],
    reordered[index],
  ];

  for (let i = 0; i < reordered.length; i += 1) {
    await db
      .update(galleryItems)
      .set({ displayOrder: (i + 1) * 10 })
      .where(eq(galleryItems.id, reordered[i].id));
  }

  revalidateGalleryPages();
}
