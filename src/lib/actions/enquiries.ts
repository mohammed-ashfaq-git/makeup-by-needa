"use server";

/**
 * Enquiry management actions (status changes only — this is an enquiry
 * manager, not a booking system).
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { readId, type ActionState } from "@/lib/form";
import { enquiryStatusSchema } from "@/lib/schemas";

export async function updateEnquiryStatusAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const id = readId(formData);
  const status = enquiryStatusSchema.safeParse(formData.get("status"));

  if (!id || !status.success) {
    return { ok: false, message: "Invalid enquiry or status." };
  }

  try {
    const result = await getDb()
      .update(enquiries)
      .set({ status: status.data })
      .where(eq(enquiries.id, id));

    if (!result[0].affectedRows) {
      return { ok: false, message: "That enquiry no longer exists." };
    }
  } catch (error) {
    console.error("[enquiries] status update failed:", error);
    return { ok: false, message: "Could not update the status. Please try again." };
  }

  revalidatePath("/admin/enquiries");
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin");

  return { ok: true, message: `Status updated to ${status.data}.` };
}
