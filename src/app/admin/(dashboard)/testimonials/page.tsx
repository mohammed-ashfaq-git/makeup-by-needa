import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { TestimonialsManager } from "@/components/admin/TestimonialsManager";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { testimonials } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Testimonials" };

export default async function AdminTestimonialsPage() {
  await requireAdmin();

  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(testimonials)
      .orderBy(asc(testimonials.displayOrder), asc(testimonials.id)),
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Testimonials</h1>
          <p>
            Client reviews shown on the homepage. Add the client’s name, their
            words and a rating from 1 to 5.
          </p>
        </div>
      </div>

      {rows === null ? (
        <DbError />
      ) : (
        <TestimonialsManager
          items={rows.map((row) => ({
            id: row.id,
            clientName: row.clientName,
            quote: row.quote,
            rating: row.rating,
            photoUrl: row.photoUrl,
            service: row.service,
            active: row.active,
          }))}
        />
      )}
    </>
  );
}
