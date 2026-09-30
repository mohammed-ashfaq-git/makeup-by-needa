"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth/guards";
import { getDb } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { mergePageContent, PAGE_CONTENT_FIELDS, type PageContentKey } from "@/lib/page-content";
import type { ActionState } from "@/lib/form";

export async function savePageContentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const content = {} as Record<PageContentKey, string>;
  const errors: Record<string, string> = {};
  for (const fields of Object.values(PAGE_CONTENT_FIELDS)) {
    for (const [key] of fields) {
      const value = String(formData.get(key) ?? "").trim();
      if (!value) errors[key] = "This field is required.";
      else if (value.length > 2000) errors[key] = "Use 2,000 characters or fewer.";
      else content[key] = value;
    }
  }
  if (Object.keys(errors).length) {
    return { ok: false, message: "Review the highlighted content fields.", fieldErrors: errors };
  }

  try {
    const existing = await getDb()
      .select({ pageContentJson: siteSettings.pageContentJson })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1);
    if (!existing[0]) {
      return { ok: false, message: "Website settings are not initialized yet. Run the database setup and try again." };
    }

    // Merge with the saved copy so any future CMS fields survive older forms.
    const saved = mergePageContent(existing[0].pageContentJson);
    await getDb()
      .update(siteSettings)
      .set({ pageContentJson: JSON.stringify({ ...saved, ...content }) })
      .where(eq(siteSettings.id, 1));
  } catch (error) {
    console.error("[page-content] save failed:", error);
    return { ok: false, message: "Could not save page content. Check the database connection and try again." };
  }

  for (const path of ["/", "/about", "/services", "/gallery", "/contact", "/book"]) {
    revalidatePath(path);
  }
  return { ok: true, message: "Page content saved. Your public pages now show the updated copy." };
}
