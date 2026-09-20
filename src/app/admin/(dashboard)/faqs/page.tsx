import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { FaqsManager } from "@/components/admin/FaqsManager";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { faqs } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

export const metadata: Metadata = { title: "FAQs" };

export default async function AdminFaqsPage() {
  await requireAdmin();

  const rows = await queryWithFallback((db) =>
    db.select().from(faqs).orderBy(asc(faqs.displayOrder), asc(faqs.id)),
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>FAQs</h1>
          <p>
            Frequently asked questions shown on the booking page. Keep answers
            short and helpful.
          </p>
        </div>
      </div>

      {rows === null ? (
        <DbError />
      ) : (
        <FaqsManager
          items={rows.map((row) => ({
            id: row.id,
            question: row.question,
            answer: row.answer,
            active: row.active,
          }))}
        />
      )}
    </>
  );
}
