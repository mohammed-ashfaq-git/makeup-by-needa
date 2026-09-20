import { NextResponse } from "next/server";
import { validateEnquiryServer } from "@/lib/validations/enquiry";
import { buildEnquiryWhatsAppUrl, formatDateForDisplay } from "@/lib/utils/whatsapp";
import { hasEmailConfig, getRecipientEmail } from "@/lib/email/client";
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

    if (emailConfigured) {
      // Future: email sending will be implemented here
      return NextResponse.json({
        ok: true,
        delivery: "email",
        recipient: recipientEmail,
        message:
          "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
        whatsappUrl,
      });
    }

    // WhatsApp fallback when email not configured
    return NextResponse.json({
      ok: true,
      delivery: "whatsapp_fallback",
      message:
        "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
      whatsappUrl,
      enquirySummary: {
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
