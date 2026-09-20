"use server";

/**
 * Artist / bio actions.
 */
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, queryWithFallback } from "@/lib/db";
import { artistProfile } from "@/lib/db/schema";
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
import { artistSchema } from "@/lib/schemas";

export async function saveArtistAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();

  const parsed = artistSchema.safeParse({
    name: readString(formData, "name"),
    shortBio: readString(formData, "shortBio"),
    bio: readRawMultiline(formData, "bio"),
    experience: readString(formData, "experience"),
    specialties: readRawMultiline(formData, "specialties"),
    qualifications: readRawMultiline(formData, "qualifications"),
    location: readString(formData, "location"),
    instagram: readString(formData, "instagram"),
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

  // Profile photo upload (optional).
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

  const existing = await queryWithFallback((db) =>
    db
      .select({ photoUrl: artistProfile.photoUrl })
      .from(artistProfile)
      .where(eq(artistProfile.id, 1))
      .limit(1),
  );

  try {
    await getDb()
      .insert(artistProfile)
      .values({ id: 1, ...parsed.data, photoUrl: photoUrl ?? null })
      .onDuplicateKeyUpdate({
        set: { ...parsed.data, ...(photoUrl !== undefined ? { photoUrl } : {}) },
      });
  } catch (error) {
    console.error("[artist] save failed:", error);
    return { ok: false, message: "Could not save the artist profile. Please try again." };
  }

  const previousPhoto = existing?.[0]?.photoUrl;
  if (
    previousPhoto &&
    isManagedImageUrl(previousPhoto) &&
    previousPhoto !== photoUrl
  ) {
    await deleteManagedImage(previousPhoto);
  }

  revalidatePath("/", "layout");

  return {
    ok: true,
    message: "Artist profile saved. The About page is already up to date.",
  };
}

/** Like readString but preserves newlines (for multi-line fields). */
function readRawMultiline(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
