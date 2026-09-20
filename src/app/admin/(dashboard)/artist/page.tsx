import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { ArtistForm } from "@/components/admin/ArtistForm";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { artistProfile } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { artist as staticArtist } from "@/lib/site-data";

export const metadata: Metadata = { title: "Artist / Bio" };

export default async function AdminArtistPage() {
  await requireAdmin();

  const row = await queryWithFallback((db) =>
    db.select().from(artistProfile).where(eq(artistProfile.id, 1)).limit(1),
  );

  const saved = row?.[0];

  const initial = saved
    ? {
        name: saved.name,
        photoUrl: saved.photoUrl,
        shortBio: saved.shortBio,
        bio: saved.bio,
        experience: saved.experience,
        specialties: saved.specialties,
        qualifications: saved.qualifications,
        location: saved.location,
        instagram: saved.instagram,
      }
    : {
        name: staticArtist.name,
        photoUrl: null,
        shortBio: staticArtist.shortBio,
        bio: staticArtist.bio,
        experience: staticArtist.experience || null,
        specialties: staticArtist.specialties || null,
        qualifications: staticArtist.qualifications || null,
        location: staticArtist.location,
        instagram: staticArtist.instagram,
      };

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Artist / Bio</h1>
          <p>
            The artist profile shown on the public About page — name, photo,
            biography and experience.
          </p>
        </div>
      </div>

      {row === null ? (
        <DbError />
      ) : (
        <div className="a-card">
          <ArtistForm initial={initial} />
        </div>
      )}
    </>
  );
}
