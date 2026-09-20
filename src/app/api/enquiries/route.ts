import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { getDb, queryWithFallback } from "@/lib/db";
import { enquiries } from "@/lib/db/schema";
import { enquirySubmissionSchema } from "@/lib/schemas";
import { getSettings } from "@/lib/cms";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { checkRateLimit, pruneRateLimits } from "@/lib/auth/rate-limit";

export const runtime = "nodejs";

const SUBMIT_LIMIT = 6;
const SUBMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ENQUIRY_REQUEST_BYTES = 32 * 1024;

type LimitedJsonBody =
  | { kind: "ok"; body: Record<string, unknown> }
  | { kind: "invalid" }
  | { kind: "too_large" };

/**
 * Reads a JSON body incrementally so clients cannot bypass the enquiry size
 * limit by omitting Content-Length or using a chunked request.
 */
async function readLimitedJsonBody(request: Request): Promise<LimitedJsonBody> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredLength = Number(contentLength);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_ENQUIRY_REQUEST_BYTES) {
      return { kind: "too_large" };
    }
  }

  if (!request.body) return { kind: "invalid" };

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      totalBytes += value.byteLength;
      if (totalBytes > MAX_ENQUIRY_REQUEST_BYTES) {
        try {
          await reader.cancel();
        } catch {
          // The response remains a safe 413 even if the stream cannot cancel.
        }
        return { kind: "too_large" };
      }
      chunks.push(value);
    }
  } catch {
    return { kind: "invalid" };
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { kind: "invalid" };
    }
    return { kind: "ok", body: value as Record<string, unknown> };
  } catch {
    return { kind: "invalid" };
  }
}

export async function POST(request: Request) {
  try {
    const payload = await readLimitedJsonBody(request);
    if (payload.kind === "too_large") {
      return NextResponse.json(
        {
          ok: false,
          message: "The enquiry request is too large. Please keep it under 32 KB.",
        },
        { status: 413 },
      );
    }
    if (payload.kind === "invalid") {
      return NextResponse.json(
        { ok: false, message: "Please submit the enquiry form again." },
        { status: 400 },
      );
    }

    const body = payload.body;

    const parsed = enquirySubmissionSchema.safeParse({
      name: body.name,
      phone: body.phone,
      email: body.email,
      date: body.date,
      location: body.location,
      service: body.service,
      time: body.time,
      people: body.people,
      message: body.message,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errors[key]) errors[key] = issue.message;
      }
      return NextResponse.json(
        { ok: false, message: "Please check the required fields.", errors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Light spam protection.
    pruneRateLimits();
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const limit = checkRateLimit(`enquiry:${ip}`, SUBMIT_LIMIT, SUBMIT_WINDOW_MS);
    if (!limit.allowed) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "You have submitted several enquiries recently. Please try again a little later, or message us directly on WhatsApp.",
        },
        { status: 429 },
      );
    }

    const settings = await getSettings();

    const formattedDate = data.date
      ? new Date(data.date + "T00:00:00").toLocaleDateString("en-CA", {
          dateStyle: "medium",
        })
      : data.date;

    const whatsappLines = [
      `*New Appointment Enquiry - ${settings.businessName}*`,
      ``,
      `*Name:* ${data.name}`,
      `*Service:* ${data.service}`,
      `*Event Date:* ${formattedDate}`,
      data.time ? `*Preferred Time:* ${data.time}` : null,
      `*Location:* ${data.location}`,
      data.people ? `*Number of People:* ${data.people}` : null,
      `*Phone:* ${data.phone}`,
      `*Email:* ${data.email}`,
      ``,
      `*Message / Notes:*`,
      `${data.message}`,
    ]
      .filter(Boolean)
      .join("\n");

    const whatsappUrl = buildWhatsAppUrl(
      settings.whatsappNumber,
      whatsappLines,
    );

    // Persist the enquiry. The placeholder is replaced with ENQ-#### based on
    // the inserted row's auto-increment id.
    const saved = await queryWithFallback(async (db) => {
      const result = await db
        .insert(enquiries)
        .values({
          enquiryNumber: `P-${randomUUID().slice(0, 18)}`,
          name: data.name,
          phone: data.phone,
          email: data.email,
          service: data.service,
          eventDate: data.date,
          eventTime: data.time,
          location: data.location,
          people: data.people,
          message: data.message,
          status: "NEW",
        });

      const insertId = Number((result[0] as { insertId: number }).insertId);

      const enquiryNumber = `ENQ-${String(insertId).padStart(4, "0")}`;
      await db
        .update(enquiries)
        .set({ enquiryNumber: sql`${enquiryNumber}` })
        .where(eq(enquiries.id, insertId));

      return { enquiryNumber };
    });

    if (saved) {
      return NextResponse.json({
        ok: true,
        delivery: "saved",
        enquiryNumber: saved.enquiryNumber,
        message: `Your enquiry has been received. ${settings.businessName} will get back to you to confirm availability.`,
        whatsappUrl,
      });
    }

    // Graceful fallback when the database is unreachable — behave exactly
    // like the previous WhatsApp-fallback flow so no enquiry is lost.
    return NextResponse.json({
      ok: true,
      delivery: "whatsapp_fallback",
      message: `Your enquiry has been received. ${settings.businessName} will get back to you to confirm availability.`,
      whatsappUrl,
    });
  } catch (error) {
    console.error("Error processing enquiry:", error);
    return NextResponse.json(
      {
        ok: false,
        message:
          "Unable to process enquiry at this time. Please contact via WhatsApp directly.",
      },
      { status: 500 },
    );
  }
}
