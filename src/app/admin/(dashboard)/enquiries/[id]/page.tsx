import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { EnquiryStatusForm } from "@/components/admin/EnquiryStatusForm";
import { DbError } from "@/components/admin/DbError";
import { queryWithFallback } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/guards";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Enquiry" };

export default async function AdminEnquiryDetailPage(
  props: PageProps<"/admin/enquiries/[id]">,
) {
  await requireAdmin();

  const { id } = await props.params;

  const enquiryId = Number.parseInt(id, 10);
  if (!Number.isInteger(enquiryId) || enquiryId < 1 || String(enquiryId) !== id) {
    notFound();
  }

  const rows = await queryWithFallback((db) =>
    db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1),
  );

  const enquiry = rows?.[0];

  if (rows !== null && !enquiry) {
    notFound();
  }

  return (
    <>
      <div className="admin-page-head">
        <div>
          <h1>
            {enquiry ? enquiry.enquiryNumber : "Enquiry"}{" "}
            {enquiry && (
              <span className={`a-badge status-${enquiry.status}`}>
                {enquiry.status}
              </span>
            )}
          </h1>
          <p>
            {enquiry
              ? `Received ${formatDateTime(enquiry.createdAt)}`
              : "Enquiry details"}
          </p>
        </div>

        <Link href="/admin/enquiries" className="a-btn ghost">
          ← All enquiries
        </Link>
      </div>

      {rows === null ? (
        <DbError />
      ) : enquiry ? (
        <>
          <div className="a-card">
            <div className="a-card-head">
              <h2>Customer &amp; event details</h2>
            </div>

            <dl className="a-details-grid">
              <dt>Enquiry number</dt>
              <dd>
                <strong>{enquiry.enquiryNumber}</strong>
              </dd>

              <dt>Client name</dt>
              <dd>{enquiry.name}</dd>

              <dt>Phone</dt>
              <dd>
                <a href={`tel:${enquiry.phone}`}>{enquiry.phone}</a>
              </dd>

              <dt>Email</dt>
              <dd>
                <a href={`mailto:${enquiry.email}`}>{enquiry.email}</a>
              </dd>

              <dt>Service</dt>
              <dd>{enquiry.service}</dd>

              <dt>Event date</dt>
              <dd>{formatDate(enquiry.eventDate)}</dd>

              <dt>Preferred time</dt>
              <dd>{enquiry.eventTime || "Not specified"}</dd>

              <dt>Number of people</dt>
              <dd>{enquiry.people || "Not specified"}</dd>

              <dt>Location</dt>
              <dd>{enquiry.location}</dd>

              <dt>Received</dt>
              <dd>{formatDateTime(enquiry.createdAt)}</dd>

              <dt>Last updated</dt>
              <dd>{formatDateTime(enquiry.updatedAt)}</dd>
            </dl>
          </div>

          <div className="a-card">
            <div className="a-card-head">
              <h2>Message</h2>
            </div>
            <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
              {enquiry.message}
            </p>
          </div>

          <div className="a-card">
            <div className="a-card-head">
              <h2>Status</h2>
            </div>
            <EnquiryStatusForm
              enquiryId={enquiry.id}
              currentStatus={enquiry.status}
            />
          </div>

          <div className="a-card">
            <div className="a-card-head">
              <h2>Quick actions</h2>
            </div>
            <div className="a-btn-row">
              <a
                className="a-btn"
                href={`https://wa.me/${enquiry.phone.replace(/[^\d]/g, "").replace(/^0+/, "")}`}
                target="_blank"
                rel="noreferrer"
              >
                Message on WhatsApp
              </a>
              <a className="a-btn" href={`mailto:${enquiry.email}`}>
                Send email
              </a>
            </div>
            <p className="a-muted" style={{ marginTop: 10 }}>
              WhatsApp opens a chat with the phone number provided by the
              client (it only works if that number is registered on WhatsApp).
            </p>
          </div>
        </>
      ) : null}
    </>
  );
}
