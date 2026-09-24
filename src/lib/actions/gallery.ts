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
  processMediaUpload,
  storeImage,
  ImageValidationError,
} from "@/lib/images";
import { getYouTubeThumbnailUrl } from "@/lib/video-url";
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
  const mediaType =
    readString(formData, "mediaType") === "video" ? "video" : "image";
  const videoUrlInput = readString(formData, "videoUrl");

  const parsed = galleryItemSchema.safeParse({
    title: readString(formData, "title"),
    category: readString(formData, "category"),
    caption: readString(formData, "caption"),
    altText: readString(formData, "altText"),
    mediaType,
    videoUrl: videoUrlInput,
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

  // Two image uploads: the desktop file and an optional mobile portrait
  // crop. When the mobile file is empty, the public site keeps using the
  // desktop file on phones as well.
  const imageFile = readOptionalFile(formData, "image");
  const mobileImageFile = readOptionalFile(formData, "mobileImage");
  const videoFile = readOptionalFile(formData, "videoFile");
  const removeMobileImage = readBoolean(formData, "removeMobileImage");

  const db = getDb();

  try {
    let previousImage: string | null = null;
    let previousMobileImage: string | null = null;
    let previousVideo: string | null = null;
    let currentImage: string | null | undefined = undefined;
    let currentMobileImage: string | null | undefined = undefined;
    let currentVideo: string | null | undefined = undefined;

    if (mobileImageFile) {
      const processedMobileImg = await processImageUpload(
        mobileImageFile,
        "mobileImage",
      );
      if (processedMobileImg) {
        currentMobileImage = await storeImage(processedMobileImg);
      }
    } else if (removeMobileImage) {
      currentMobileImage = null;
    }

    if (id) {
      const existing = await db
        .select({
          imageUrl: galleryItems.imageUrl,
          mobileImageUrl: galleryItems.mobileImageUrl,
          videoUrl: galleryItems.videoUrl,
        })
        .from(galleryItems)
        .where(eq(galleryItems.id, id))
        .limit(1);

      if (!existing[0]) {
        return { ok: false, message: "That gallery item no longer exists." };
      }
      previousImage = existing[0].imageUrl;
      previousMobileImage = existing[0].mobileImageUrl ?? null;
      previousVideo = existing[0].videoUrl ?? null;

      if (mediaType === "video") {
        if (videoFile) {
          const processedVid = await processMediaUpload(videoFile, "videoFile");
          if (processedVid) {
            currentVideo = await storeImage(processedVid);
          }
        } else if (parsed.data.videoUrl !== undefined) {
          currentVideo = parsed.data.videoUrl;
        }

        if (imageFile) {
          const processedImg = await processImageUpload(imageFile, "image");
          if (processedImg) currentImage = await storeImage(processedImg);
        } else if (!previousImage && currentVideo) {
          const ytThumb = getYouTubeThumbnailUrl(currentVideo);
          if (ytThumb) currentImage = ytThumb;
        }
      } else {
        // Image item
        currentVideo = null;
        if (imageFile) {
          const processedImg = await processImageUpload(imageFile, "image");
          if (processedImg) currentImage = await storeImage(processedImg);
        }
      }

      await db
        .update(galleryItems)
        .set({
          title: parsed.data.title,
          category: parsed.data.category,
          caption: parsed.data.caption,
          altText: parsed.data.altText,
          mediaType,
          active: parsed.data.active,
          ...(currentImage !== undefined ? { imageUrl: currentImage } : {}),
          ...(currentMobileImage !== undefined
            ? { mobileImageUrl: currentMobileImage }
            : {}),
          ...(currentVideo !== undefined ? { videoUrl: currentVideo } : {}),
        })
        .where(eq(galleryItems.id, id));
    } else {
      // New item
      if (mediaType === "video") {
        if (videoFile) {
          const processedVid = await processMediaUpload(videoFile, "videoFile");
          if (processedVid) {
            currentVideo = await storeImage(processedVid);
          }
        } else if (parsed.data.videoUrl) {
          currentVideo = parsed.data.videoUrl;
        }

        if (!currentVideo) {
          return {
            ok: false,
            message:
              "Please provide a video link (YouTube, Vimeo, MP4) or upload a video file.",
            fieldErrors: {
              videoUrl: "A video link or uploaded video file is required.",
            },
          };
        }

        if (imageFile) {
          const processedImg = await processImageUpload(imageFile, "image");
          if (processedImg) currentImage = await storeImage(processedImg);
        } else {
          const ytThumb = getYouTubeThumbnailUrl(currentVideo);
          currentImage = ytThumb || "/images/makeup-by-needa-hero.jpg";
        }
      } else {
        // New Image item
        if (!imageFile) {
          return {
            ok: false,
            message: "Please choose an image to upload.",
            fieldErrors: { image: "An image file is required." },
          };
        }

        const processedImg = await processImageUpload(imageFile, "image");
        if (!processedImg) {
          return {
            ok: false,
            message: "Please choose an image to upload.",
            fieldErrors: { image: "An image file is required." },
          };
        }
        currentImage = await storeImage(processedImg);
        currentVideo = null;
      }

      const maxOrder = await db
        .select({
          max: sql<number>`coalesce(max(${galleryItems.displayOrder}), 0)`,
        })
        .from(galleryItems);
      const nextOrder = Number(maxOrder[0]?.max ?? 0) + 10;

      await db.insert(galleryItems).values({
        title: parsed.data.title,
        category: parsed.data.category,
        caption: parsed.data.caption,
        altText: parsed.data.altText,
        mediaType,
        imageUrl: currentImage || "/images/makeup-by-needa-hero.jpg",
        mobileImageUrl: currentMobileImage ?? null,
        videoUrl: currentVideo,
        active: parsed.data.active,
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

    if (
      previousMobileImage &&
      isManagedImageUrl(previousMobileImage) &&
      previousMobileImage !== currentMobileImage
    ) {
      await deleteManagedImage(previousMobileImage);
    }

    if (
      previousVideo &&
      isManagedImageUrl(previousVideo) &&
      previousVideo !== currentVideo
    ) {
      await deleteManagedImage(previousVideo);
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: {
          image: error.message,
          mobileImage: error.message,
          videoFile: error.message,
        },
      };
    }
    console.error("[gallery] save failed:", error);
    return {
      ok: false,
      message: "Could not save the gallery item. Please try again.",
    };
  }

  revalidateGalleryPages();

  return {
    ok: true,
    message: id
      ? "Gallery item updated."
      : mediaType === "video"
      ? "Video added to the gallery."
      : "Image uploaded and added to the gallery.",
  };
}

export async function deleteGalleryItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({
      imageUrl: galleryItems.imageUrl,
      mobileImageUrl: galleryItems.mobileImageUrl,
      videoUrl: galleryItems.videoUrl,
    })
    .from(galleryItems)
    .where(eq(galleryItems.id, id))
    .limit(1);

  await db.delete(galleryItems).where(eq(galleryItems.id, id));

  const image = existing[0]?.imageUrl;
  if (image && isManagedImageUrl(image)) {
    await deleteManagedImage(image);
  }
  const mobileImage = existing[0]?.mobileImageUrl;
  if (mobileImage && isManagedImageUrl(mobileImage)) {
    await deleteManagedImage(mobileImage);
  }
  const video = existing[0]?.videoUrl;
  if (video && isManagedImageUrl(video)) {
    await deleteManagedImage(video);
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
