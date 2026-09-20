"use server";

/**
 * Website settings actions.
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, queryWithFallback } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
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
  readOptionalFile,
  readString,
  type ActionState,
} from "@/lib/form";
import { settingsSchema } from "@/lib/schemas";

export async function saveSettingsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = settingsSchema.safeParse({
    businessName: readString(formData, "businessName"),
    phone: readString(formData, "phone"),
    email: readString(formData, "email"),
    whatsappNumber: readString(formData, "whatsappNumber"),
    whatsappDisplay: readString(formData, "whatsappDisplay"),
    whatsappMessage: readString(formData, "whatsappMessage"),
    location: readString(formData, "location"),
    address: readString(formData, "address"),
    hours: readString(formData, "hours"),
    instagramMakeupHandle: readString(formData, "instagramMakeupHandle"),
    instagramMakeupUrl: readString(formData, "instagramMakeupUrl"),
    instagramNailsHandle: readString(formData, "instagramNailsHandle"),
    instagramNailsUrl: readString(formData, "instagramNailsUrl"),
    facebookUrl: readString(formData, "facebookUrl"),
    homeTitle: readString(formData, "homeTitle"),
    homeDescription: readString(formData, "homeDescription"),
    footerText: readString(formData, "footerText"),
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

  // Logo upload (optional).
  let logoUrl: string | null | undefined = undefined;
  const removeLogo = readBoolean(formData, "removeLogo");

  try {
    const file = readOptionalFile(formData, "logo");
    if (file) {
      const processed = await processImageUpload(file, "logo");
      if (processed) logoUrl = await storeImage(processed);
    } else if (removeLogo) {
      logoUrl = null;
    }
  } catch (error) {
    if (error instanceof ImageValidationError) {
      return {
        ok: false,
        message: error.message,
        fieldErrors: { logo: error.message },
      };
    }
    throw error;
  }

  const existing = await queryWithFallback((db) =>
    db
      .select({ logoUrl: siteSettings.logoUrl })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1),
  );

  try {
    await getDb()
      .insert(siteSettings)
      .values({ id: 1, ...parsed.data, logoUrl: logoUrl ?? null })
      .onDuplicateKeyUpdate({
        set: { ...parsed.data, ...(logoUrl !== undefined ? { logoUrl } : {}) },
      });
  } catch (error) {
    console.error("[settings] save failed:", error);
    return { ok: false, message: "Could not save settings. Please try again." };
  }

  // Clean up the replaced logo file (only after a successful save).
  const previousLogo = existing?.[0]?.logoUrl;
  if (
    previousLogo &&
    isManagedImageUrl(previousLogo) &&
    previousLogo !== logoUrl
  ) {
    await deleteManagedImage(previousLogo);
  }

  revalidatePath("/", "layout");

  return {
    ok: true,
    message: "Settings saved. The public website is already using the new values.",
  };
}
