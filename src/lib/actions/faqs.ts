"use server";

/**
 * FAQ actions: add, edit, delete, enable/disable, reorder.
 */
import { revalidatePath } from "next/cache";
import { asc, eq, sql } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import {
  readBoolean,
  readId,
  readString,
  type ActionState,
} from "@/lib/form";
import { faqSchema } from "@/lib/schemas";

function revalidateFaqPages() {
  revalidatePath("/", "layout");
  revalidatePath("/admin/faqs");
}

export async function saveFaqAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = readId(formData);
  const parsed = faqSchema.safeParse({
    question: readString(formData, "question"),
    answer: readString(formData, "answer"),
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

  const db = getDb();

  try {
    if (id) {
      const existing = await db
        .select({ id: faqs.id })
        .from(faqs)
        .where(eq(faqs.id, id))
        .limit(1);
      if (!existing[0]) {
        return { ok: false, message: "That FAQ no longer exists." };
      }

      await db.update(faqs).set(parsed.data).where(eq(faqs.id, id));
    } else {
      const maxOrder = await db
        .select({ max: sql<number>`coalesce(max(${faqs.displayOrder}), 0)` })
        .from(faqs);
      const nextOrder = Number(maxOrder[0]?.max ?? 0) + 10;

      await db.insert(faqs).values({
        ...parsed.data,
        displayOrder: nextOrder,
      });
    }
  } catch (error) {
    console.error("[faqs] save failed:", error);
    return { ok: false, message: "Could not save the FAQ. Please try again." };
  }

  revalidateFaqPages();

  return { ok: true, message: id ? "FAQ updated." : "FAQ added." };
}

export async function deleteFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  await getDb().delete(faqs).where(eq(faqs.id, id));

  revalidateFaqPages();
}

export async function toggleFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  if (!id) return;

  const db = getDb();
  const existing = await db
    .select({ active: faqs.active })
    .from(faqs)
    .where(eq(faqs.id, id))
    .limit(1);
  if (!existing[0]) return;

  await db
    .update(faqs)
    .set({ active: !existing[0].active })
    .where(eq(faqs.id, id));

  revalidateFaqPages();
}

export async function moveFaqAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = readId(formData);
  const direction = formData.get("direction");
  if (!id || (direction !== "up" && direction !== "down")) return;

  const db = getDb();
  const rows = await db
    .select({ id: faqs.id })
    .from(faqs)
    .orderBy(asc(faqs.displayOrder), asc(faqs.id));

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
      .update(faqs)
      .set({ displayOrder: (i + 1) * 10 })
      .where(eq(faqs.id, reordered[i].id));
  }

  revalidateFaqPages();
}
