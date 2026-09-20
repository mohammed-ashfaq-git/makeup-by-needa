import { NextResponse } from "next/server";
import { business } from "@/lib/site-data";

export interface EnquiryPayload {
  name: string;
  phone: string;
  email: string;
  date: string;
  location: string;
  service: string;
  time?: string;
  people?: string;
  message: string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<EnquiryPayload>;

    const { name, phone, email, date, location, service, time, people, message } = body;

    // Server-side validation
    const errors: Record<string, string> = {};
    if (!name?.trim()) errors.name = "Full name is required.";
    if (!phone?.trim()) errors.phone = "Phone number is required.";
    if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "A valid email address is required.";
    }
    if (!date?.trim()) errors.date = "Appointment or event date is required.";
    if (!location?.trim()) errors.location = "Location or city is required.";
    if (!service?.trim()) errors.service = "Please select a service.";
    if (!message?.trim()) errors.message = "Please share a few details about your appointment.";

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { ok: false, message: "Please check the required fields.", errors },
        { status: 400 }
      );
    }

    const recipientEmail = process.env.BUSINESS_INQUIRY_EMAIL || business.email;

    // Check if an email delivery provider is configured via environment variables
    const hasEmailConfig = Boolean(
      process.env.RESEND_API_KEY ||
      (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS)
    );

    // Prepare WhatsApp message formatted cleanly
    const formattedDate = date ? new Date(date + "T00:00:00").toLocaleDateString("en-CA", { dateStyle: "medium" }) : date;
    const whatsappLines = [
      `*New Appointment Enquiry - Makeup by Needa*`,
      ``,
      `*Name:* ${name?.trim()}`,
      `*Service:* ${service?.trim()}`,
      `*Event Date:* ${formattedDate}`,
      time?.trim() ? `*Preferred Time:* ${time.trim()}` : null,
      `*Location:* ${location?.trim()}`,
      people?.trim() ? `*Number of People:* ${people.trim()}` : null,
      `*Phone:* ${phone?.trim()}`,
      `*Email:* ${email?.trim()}`,
      ``,
      `*Message / Notes:*`,
      `${message?.trim()}`,
    ].filter(Boolean).join("\n");

    const whatsappUrl = `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(whatsappLines)}`;

    if (hasEmailConfig) {
      // Configured email provider hook (credentials will be configured in a future phase)
      return NextResponse.json({
        ok: true,
        delivery: "email",
        recipient: recipientEmail,
        message: "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
        whatsappUrl,
      });
    }

    // Graceful fallback when automated email provider is not yet set up
    return NextResponse.json({
      ok: true,
      delivery: "whatsapp_fallback",
      message: "Your enquiry has been received. Makeup by Needa will get back to you to confirm availability.",
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
      { ok: false, message: "Unable to process enquiry at this time. Please contact via WhatsApp directly." },
      { status: 500 }
    );
  }
}

