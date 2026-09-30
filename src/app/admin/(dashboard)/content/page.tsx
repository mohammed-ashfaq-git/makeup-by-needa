import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { PageContentForm } from "@/components/admin/PageContentForm";
import { DbError } from "@/components/admin/DbError";
import { requireAdmin } from "@/lib/auth/guards";
import { queryWithFallback } from "@/lib/db";
import { siteSettings } from "@/lib/db/schema";
import { mergePageContent } from "@/lib/page-content";

export const metadata: Metadata = { title: "Page Content" };

export default async function PageContentAdmin() {
  await requireAdmin();
  const rows = await queryWithFallback((db) =>
    db.select({ pageContentJson: siteSettings.pageContentJson })
      .from(siteSettings)
      .where(eq(siteSettings.id, 1))
      .limit(1),
  );

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Page Content</h1>
          <p>Edit public page headings and copy in one place. Changes take effect as soon as they’re saved.</p>
        </div>
      </div>
      {rows === null ? <DbError /> : <PageContentForm initial={mergePageContent(rows[0]?.pageContentJson)} />}
    </>
  );
}
