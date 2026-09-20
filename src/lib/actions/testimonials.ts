"use server";

/**
 * Testimonial actions: add, edit, delete, enable/disable, reorder.
 */
import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
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
import { testimonialSchema } from "@/lib/schemas";

function revalidateTestimonialPages() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/testimonials");
}

export async function saveTestimonialAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = readId(formData);
  const parsed = testimonialSchema.safeParse({
    clientName: readString(formData, "clientName"),
    quote: readString(formData, "quote"),
    rating: readString(formData, "rating"),
    service: readString(formData, "service"),
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

  let photoUrl: string | null | undefined = undefined;
  const removePhoto = readBoolean(formData, "removePhoto");

  try {
    const file = readOptionalFile(formData, "photo");
    if (file) {
      const processed = await processImageUpload(file, "photo");
      if (processed) photoUrl = await storeImage(processed);
    } else if (removePhoto) {
      photoUrl = null;
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: { photo: error.message },
      };
    }
    throw error;
  }

  const db = getDb();

  try {
    let previousPhoto: string | null = null;

    if (id) {
      const existing = await db
        .select({ photoUrl: testimonials.photoUrl })
        .from(testimonials)
        .where(eq(testimonials.id, id))
        .limit(1);
      if (!existing[0]) {
        return { ok: false, message: "That testimonial no longer exists." };
      }
      previousPhoto = existing[0].photoUrl ?? null;

      await db
        .update(testimonials)
        .set({ ...parsed.data, ...(photoUrl !== undefined ? { photoUrl } : {}) })
        .where(eq(testimonials.id, id));
    } else {
      const maxOrder = await db
        .select({
          max: sql<number>`coalesce(max(${testimonials.displayOrder}), 0)`,
        })
        .from(testimonials);
      const nextOrder = Number(maxOrder[0]?.max ?? 0) + 10;

      await db.insert(testimonials).values({
        ...parsed.data,
        photoUrl: photoUrl ?? null,
        displayOrder: nextOrder,
      });
    }

    if (
      previousPhoto &&
      isManagedImageUrl(previousPhoto) &&
      previousPhoto !== photoUrl
    ) {
      await deleteManagedImage(previousPhoto);
    }
  } catch (error) {
    console.error("[testimonials] save failed:", error);
    return { ok: false, message: "Could not save the testimonial. Please try again." };
  }

  revalidateTestimonialPages();

  return {
    ok: true,
    message: id ? "Testimonial updated." : "Testimonial added.",
  };
}

export async function deleteTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ photoUrl: testimonials.photoUrl })
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);

  await db.delete(testimonials).where(eq(testimonials.id, id));

  const photo = existing[0]?.photoUrl;
  if (photo && isManagedImageUrl(photo)) {
    await deleteManagedImage(photo);
  }

  revalidateTestimonialPages();
}

export async function toggleTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ active: testimonials.active })
    .from(testimonials)
    .where(eq(testimonials.id, id))
    .limit(1);
  if (!existing[0]) return;

  await db
    .update(testimonials)
    .set({ active: !existing[0].active })
    .where(eq(testimonials.id, id));

  revalidateTestimonialPages();
}

export async function moveTestimonialAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const db = getDb();
  const rows = await db
    .select({ id: testimonials.id })
    .from(testimonials)
    .orderBy(asc(testimonials.displayOrder), asc(testimonials.id));

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
      .update(testimonials)
      .set({ displayOrder: (i + 1) * 10 })
      .where(eq(testimonials.id, reordered[i].id));
  }

  revalidateTestimonialPages();
}
