import type { Metadata } from "next";
import Link from "next/link";
import { and, desc, eq, gte, lte, sql, type SQL } from "drizzle-orm";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { ENQUIRY_STATUSES } from "@/lib/db/schema";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiries" };

type SearchParams = Record<string, string | string[] | undefined>;

function singleParam(params: SearchParams, key: string): string | null {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export default async function AdminEnquiriesPage({
  searchParams,
}: PageProps<"/admin/enquiries">) {
  await requireAdmin();

  const params = await searchParams;

  const statusFilter = singleParam(params, "status");
  const fromFilter = singleParam(params, "from");
  const toFilter = singleParam(params, "to");

  const conditions: SQL[] = [];

  const validStatus = ENQUIRY_STATUSES.find(
    (status) => status === statusFilter,
  );
  if (validStatus) {
    conditions.push(eq(enquiries.status, validStatus));
  }

  // Date filters compare against the date the enquiry was received.
  if (fromFilter && /^\d{4}-\d{2}-\d{2}$/.test(fromFilter)) {
    conditions.push(gte(enquiries.createdAt, `${fromFilter} 00:00:00`));
  }
  if (toFilter && /^\d{4}-\d{2}-\d{2}$/.test(toFilter)) {
    conditions.push(lte(enquiries.createdAt, `${toFilter} 23:59:59`));
  }

  const rows = await queryWithFallback(async (db) => {
    const query = db
      .select({
        id: enquiries.id,
        enquiryNumber: enquiries.enquiryNumber,
        name: enquiries.name,
        phone: enquiries.phone,
        email: enquiries.email,
        service: enquiries.service,
        eventDate: enquiries.eventDate,
        location: enquiries.location,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
      })
      .from(enquiries);

    const filtered = conditions.length
      ? query.where(and(...conditions))
      : query;

    const [counts] = await db
      .select({
        total: sql<number>`count(*)`,
        isNew: sql<number>`sum(case when ${enquiries.status} = 'NEW' then 1 else 0 end)`,
      })
      .from(enquiries);

    return {
      rows: await filtered.orderBy(desc(enquiries.createdAt)).limit(200),
      total: Number(counts?.total ?? 0),
      newCount: Number(counts?.isNew ?? 0),
    };
  });

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>Enquiries</h1>
          <p>
            Appointment enquiries submitted through your website. {rows ? (
              <>
                {rows.newCount} new · {rows.total} in total.
              </>
            ) : null}
          </p>
        </div>
      </div>

      <form className="a-card" method="get" action="/admin/enquiries">
        <div className="a-filter-bar">
          <div className="a-field">
            <label htmlFor="f-status">Status</label>
            <select
              id="f-status"
              name="status"
              defaultValue={validStatus ?? ""}
              className="a-select"
            >
              <option value="">All statuses</option>
              {ENQUIRY_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div className="a-field">
            <label htmlFor="f-from">Received from</label>
            <input
              id="f-from"
              name="from"
              type="date"
              defaultValue={fromFilter ?? ""}
              className="a-input"
            />
          </div>

          <div className="a-field">
            <label htmlFor="f-to">Received to</label>
            <input
              id="f-to"
              name="to"
              type="date"
              defaultValue={toFilter ?? ""}
              className="a-input"
            />
          </div>

          <div className="a-btn-row">
            <button type="submit" className="a-btn primary">
              Apply filters
            </button>
            <Link href="/admin/enquiries" className="a-btn ghost">
              Clear
            </Link>
          </div>
        </div>
      </form>

      {rows === null ? (
        <DbError />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>Enquiry</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Service</th>
                <th>Event date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Received</th>
              </tr>
            </thead>
            <tbody>
              {rows.rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="a-empty">
                    No enquiries match the current filters.
                  </td>
                </tr>
              )}

              {rows.rows.map((enquiry) => (
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
                  <td className="num">{enquiry.phone}</td>
                  <td>{enquiry.email}</td>
                  <td>{enquiry.service}</td>
                  <td className="num">{formatDate(enquiry.eventDate)}</td>
                  <td>{enquiry.location}</td>
                  <td>
                    <span className={`a-badge status-${enquiry.status}`}>
                      {enquiry.status}
                    </span>
                  </td>
                  <td className="num">{formatDateTime(enquiry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
