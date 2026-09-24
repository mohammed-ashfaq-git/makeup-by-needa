"use server";

/**
 * Service actions: add, edit, delete, enable/disable, reorder.
 */
import { revalidatePath } from "next/cache";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { services } from "@/lib/db/schema";
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
import { serviceSchema } from "@/lib/schemas";

function revalidateServicePages() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/services");
}

export async function saveServiceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = readId(formData);
  const parsed = serviceSchema.safeParse({
    name: readString(formData, "name"),
    category: readString(formData, "category"),
    subcategory: readString(formData, "subcategory"),
    shortDescription: readString(formData, "shortDescription"),
    description: readString(formData, "description"),
    details: readString(formData, "details"),
    price: readString(formData, "price"),
    priceDisplay: readString(formData, "priceDisplay"),
    duration: readString(formData, "duration"),
    featured: readBoolean(formData, "featured"),
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

  let imageUrl: string | null | undefined = undefined;
  const removeImage = readBoolean(formData, "removeImage");

  try {
    const file = readOptionalFile(formData, "image");
    if (file) {
      const processed = await processImageUpload(file, "image");
      if (processed) imageUrl = await storeImage(processed);
    } else if (removeImage) {
      imageUrl = null;
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: { image: error.message },
      };
    }
    throw error;
  }

  const db = getDb();

  try {
    let previousImage: string | null = null;

    if (id) {
      const existing = await db
        .select({ imageUrl: services.imageUrl })
        .from(services)
        .where(eq(services.id, id))
        .limit(1);
      previousImage = existing[0]?.imageUrl ?? null;

      await db
        .update(services)
        .set({ ...parsed.data, ...(imageUrl !== undefined ? { imageUrl } : {}) })
        .where(eq(services.id, id));
    } else {
      // New service goes to the end of its category.
      const maxOrder = await db
        .select({
          max: sql<number>`coalesce(max(${services.displayOrder}), 0)`,
        })
        .from(services)
        .where(eq(services.category, parsed.data.category));
      const nextOrder = Number(maxOrder[0]?.max ?? 0) + 10;

      await db.insert(services).values({
        ...parsed.data,
        imageUrl: imageUrl ?? null,
        displayOrder: nextOrder,
      });
    }

    if (
      previousImage &&
      isManagedImageUrl(previousImage) &&
      previousImage !== imageUrl
    ) {
      await deleteManagedImage(previousImage);
    }
  } catch (error) {
    console.error("[services] save failed:", error);
    return { ok: false, message: "Could not save the service. Please try again." };
  }

  revalidateServicePages();

  return {
    ok: true,
    message: id
      ? "Service updated. The website is already using the new details."
      : "Service added. It is already visible on the website (unless disabled).",
  };
}

export async function deleteServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ imageUrl: services.imageUrl })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);

  await db.delete(services).where(eq(services.id, id));

  const image = existing[0]?.imageUrl;
  if (image && isManagedImageUrl(image)) {
    await deleteManagedImage(image);
  }

  revalidateServicePages();
}

export async function toggleServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ active: services.active })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  if (!existing[0]) return;

  await db
    .update(services)
    .set({ active: !existing[0].active })
    .where(eq(services.id, id));

  revalidateServicePages();
}

export async function moveServiceAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const db = getDb();

  const target = await db
    .select({ category: services.category })
    .from(services)
    .where(eq(services.id, id))
    .limit(1);
  if (!target[0]) return;

  const categoryRows = await db
    .select({ id: services.id })
    .from(services)
    .where(eq(services.category, target[0].category))
    .orderBy(asc(services.displayOrder), asc(services.id));

  const index = categoryRows.findIndex((row) => row.id === id);
  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || neighborIndex < 0 || neighborIndex >= categoryRows.length) {
    return;
  }

  const reordered = [...categoryRows];
  [reordered[index], reordered[neighborIndex]] = [
    reordered[neighborIndex],
    reordered[index],
  ];

  for (let i = 0; i < reordered.length; i += 1) {
    await db
      .update(services)
      .set({ displayOrder: (i + 1) * 10 })
      .where(
        and(
          eq(services.id, reordered[i].id),
          sql`${services.displayOrder} <> ${(i + 1) * 10}`,
        ),
      );
  }

  revalidateServicePages();
}
