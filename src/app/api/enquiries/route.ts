import { NextResponse } from "next/server";
import { validateEnquiryServer } from "@/lib/validations/enquiry";
import { buildEnquiryWhatsAppUrl, formatDateForDisplay } from "@/lib/utils/whatsapp";
import { hasEmailConfig, getRecipientEmail } from "@/lib/email/client";
import { getDb } from "@/lib/db/client";
import { enquiries } from "@/lib/db/schema";
import { generateEnquiryNumber, generateId } from "@/lib/db/utils";
import { desc } from "drizzle-orm";
import type { EnquiryPayload } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EnquiryPayload>;

    const validation = validateEnquiryServer(body);

    if (!validation.valid) {
      return NextResponse.json(
        { ok: false, message: "Please check the required fields.", errors: validation.errors },
        { status: 400 }
      );
    }

    const { name, phone, email, date, location, service, time, people, message } = body;

    const recipientEmail = getRecipientEmail();
    const emailConfigured = hasEmailConfig();
    const whatsappUrl = buildEnquiryWhatsAppUrl(body);
    const formattedDate = date ? formatDateForDisplay(date) : date;

    // Try to persist enquiry to MySQL via Drizzle
    let enquiryNumber: string | null = null;
    let dbError: string | null = null;

    try {
      const db = getDb();

      if (!db) {
        throw new Error("Database not configured - DATABASE_URL missing");
      }

      enquiryNumber = await generateEnquiryNumber();

      let eventDate: Date | null = null;
      if (date) {
        try {
          eventDate = new Date(date + "T00:00:00");
          if (isNaN(eventDate.getTime())) {
            eventDate = null;
          }
        } catch {
          eventDate = null;
        }
      }

      let peopleCount: number | null = null;
      if (people) {
        const parsed = parseInt(String(people), 10);
        if (!isNaN(parsed) && parsed > 0) {
          peopleCount = parsed;
        }
      }

      const id = generateId();

      await db.insert(enquiries).values({
        id,
        enquiryNumber,
        name: name!.trim(),
        phone: phone!.trim(),
        email: email!.trim(),
        service: service?.trim(),
        eventDate,
        eventDateRaw: date?.trim(),
        preferredTime: time?.trim(),
        location: location?.trim(),
        people: peopleCount,
        peopleRaw: people?.trim(),
        message: message!.trim(),
        status: "NEW",
      });

      console.log(`Enquiry persisted: ${enquiryNumber} - ${email}`);
    } catch (dbErr) {
      dbError = dbErr instanceof Error ? dbErr.message : "Database error";
      console.warn("Failed to persist enquiry to DB (continuing with fallback):", dbError);
      if (!enquiryNumber) {
        const year = new Date().getFullYear();
        enquiryNumber = `MBN-${year}-TEMP-${Date.now().toString().slice(-4)}`;
      }
    }

    if (emailConfigured) {
      return NextResponse.json({
        ok: true,
        delivery: "email",
        recipient: recipientEmail,
        enquiryNumber,
        message:
          "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
        whatsappUrl,
        dbPersisted: !dbError,
      });
    }

    return NextResponse.json({
      ok: true,
      delivery: "whatsapp_fallback",
      enquiryNumber,
      message:
        "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
      whatsappUrl,
      dbPersisted: !dbError,
      enquirySummary: {
        enquiryNumber,
        name: name?.trim(),
        service: service?.trim(),
        date: formattedDate,
        time: time?.trim() || "Flexible",
        location: location?.trim(),
        people: people?.trim() || "1",
        email: email?.trim(),
        phone: phone?.trim(),
        message: message?.trim(),
      },
    });
  } catch (error) {
    console.error("Error processing enquiry:", error);
    return NextResponse.json(
      {
        ok: false,
        message: "Unable to process enquiry at this time. Please contact via WhatsApp directly.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const db = getDb();

    if (!db) {
      return NextResponse.json(
        { ok: false, message: "Database not configured" },
        { status: 500 }
      );
    }

    const results = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt)).limit(10);

    return NextResponse.json({
      ok: true,
      count: results.length,
      enquiries: results,
    });
  } catch (error) {
    console.error("Failed to fetch enquiries:", error);
    return NextResponse.json(
      { ok: false, message: "Database not available or failed to fetch enquiries" },
      { status: 500 }
    );
  }
}
