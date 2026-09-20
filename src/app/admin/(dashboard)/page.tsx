import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { DbError } from "@/components/admin/DbError";
import { getDb, queryWithFallback } from "@/lib/db";
import {
  enquiries,
  galleryItems,
  services,
  testimonials,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value.replace(" ", "T")}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function AdminDashboardPage() {
  await requireAdmin();

  const stats = await queryWithFallback(async (db) => {
    const count = async (table: Parameters<typeof db.select>[0] extends never ? never : never) => table;
    void count;

    const [enquiryTotals] = await db
      .select({
        total: sql<number>`count(*)`,
        isNew: sql<number>`sum(case when ${enquiries.status} = 'NEW' then 1 else 0 end)`,
      })
      .from(enquiries);

    const [serviceTotals] = await db
      .select({ total: sql<number>`count(*)` })
      .from(services)
      .where(eq(services.active, true));

    const [galleryTotals] = await db
      .select({ total: sql<number>`count(*)` })
      .from(galleryItems)
      .where(eq(galleryItems.active, true));

    const [testimonialTotals] = await db
      .select({ total: sql<number>`count(*)` })
      .from(testimonials)
      .where(eq(testimonials.active, true));

    const recent = await db
      .select({
        id: enquiries.id,
        enquiryNumber: enquiries.enquiryNumber,
        name: enquiries.name,
        service: enquiries.service,
        eventDate: enquiries.eventDate,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
      })
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(8);

    return {
      totalEnquiries: Number(enquiryTotals?.total ?? 0),
      newEnquiries: Number(enquiryTotals?.isNew ?? 0),
      services: Number(serviceTotals?.total ?? 0),
      galleryImages: Number(galleryTotals?.total ?? 0),
      testimonials: Number(testimonialTotals?.total ?? 0),
      recent,
    };
  });

  if (!stats) {
    return (
      <>
        <div className="admin-page-head">
          <div>
            <h1>Dashboard</h1>
            <p>An overview of your website content and enquiries.</p>
          </div>
        </div>
        <DbError />
      </>
    );
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Dashboard</h1>
          <p>An overview of your website content and enquiries.</p>
        </div>
        <Link href="/admin/enquiries" className="a-btn ghost">
          View all enquiries →
        </Link>
      </div>

      <div className="a-stats">
        <div className="a-stat">
          <small>Total enquiries</small>
          <strong>{stats.totalEnquiries}</strong>
        </div>
        <div className="a-stat">
          <small>New enquiries</small>
          <strong>{stats.newEnquiries}</strong>
        </div>
        <div className="a-stat">
          <small>Active services</small>
          <strong>{stats.services}</strong>
        </div>
        <div className="a-stat">
          <small>Gallery images</small>
          <strong>{stats.galleryImages}</strong>
        </div>
        <div className="a-stat">
          <small>Testimonials</small>
          <strong>{stats.testimonials}</strong>
        </div>
      </div>

      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>Enquiry</th>
              <th>Client</th>
              <th>Service</th>
              <th>Event date</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {stats.recent.length === 0 && (
              <tr>
                <td colSpan={6} className="a-empty">
                  No enquiries yet. When someone submits the booking form on
                  your website it will appear here.
                </td>
              </tr>
            )}

            {stats.recent.map((enquiry) => (
              <tr key={enquiry.id} className="row-link">
                <td className="num">
                  <Link
                    href={`/admin/enquiries/${enquiry.id}`}
                    style={{ fontWeight: 600 }}
                  >
                    {enquiry.enquiryNumber}
                  </Link>
                </td>
                <td>{enquiry.name}</td>
                <td>{enquiry.service}</td>
                <td className="num">{formatDate(enquiry.eventDate)}</td>
                <td>
                  <span className={`a-badge status-${enquiry.status}`}>
                    {enquiry.status}
                  </span>
                </td>
                <td className="num">{formatDate(enquiry.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
