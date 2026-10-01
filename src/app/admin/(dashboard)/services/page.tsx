import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { ServicesManager } from "@/components/admin/ServicesManager";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { services } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "Services" };

export default async function AdminServicesPage() {
  await requireAdmin();

  const rows = await queryWithFallback((db) =>
    db
      .select()
      .from(services)
      .orderBy(asc(services.displayOrder), asc(services.id)),
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Services</h1>
          <p>Manage active services and prices shown on the public price list. Services appear in this order: Nails, Makeup, Hair, Packages, then Extras. Use the reorder controls within each category to set the display order.</p>
        </div>
      </div>

      {rows === null ? (
        <DbError />
      ) : (
        <ServicesManager
          services={rows.map((row) => ({
            id: row.id,
            name: row.name,
            category: row.category,
            subcategory: row.subcategory ?? null,
            shortDescription: row.shortDescription,
            description: row.description,
            details: row.details ?? null,
            price: row.price,
            priceDisplay: row.priceDisplay,
            duration: row.duration,
            imageUrl: row.imageUrl,
            featured: row.featured,
            active: row.active,
          }))}
        />
      )}
    </>
  );
}
