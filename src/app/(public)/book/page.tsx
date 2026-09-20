import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { getArtist, getFaqs, getServices, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Book an Appointment",
    description: `Start an appointment enquiry with ${settings.businessName}.`,
  };
}

export default async function Book() {
  const [services, settings, faqs, artist] = await Promise.all([
    getServices(),
    getSettings(),
    getFaqs(),
    getArtist(),
  ]);

  return (
    <>
      <section className="page-hero shell">
        <p className="eyebrow">Appointment enquiry</p>
        <h1>
          Tell me about <i>your moment.</i>
        </h1>
        <p className="lede">
          This is an enquiry, not a confirmed booking. Availability and final
          details will be confirmed with you directly.
        </p>
      </section>

      <section className="section cream">
        <div className="shell form-layout">
          <div>
            <p className="eyebrow">What happens next</p>
            <h2>A considered start.</h2>
            <p className="copy">
              Share your details and preferred service. Your enquiry is
              reviewed personally and you will hear back to confirm
              availability and details.
            </p>

            {faqs.length > 0 && (
              <div className="faq-list">
                <p className="eyebrow">Common questions</p>

                {faqs.map((faq) => (
                  <details className="faq-item" key={faq.id}>
                    <summary>{faq.question}</summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            )}
          </div>

          <EnquiryForm
            serviceOptions={services.map((service) => ({
              name: service.name,
              category: service.category,
            }))}
            whatsappNumber={settings.whatsappNumber}
            whatsappMessage={settings.whatsappMessage}
            artistName={artist.name}
          />
        </div>
      </section>
    </>
  );
}
