import { EnquiryForm } from "@/components/features/enquiry-form";

export default function Book() {
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
              Share your details and preferred service. Needa will review your
              enquiry and get back to you directly to confirm availability and
              timing.
            </p>
          </div>

          <EnquiryForm />
        </div>
      </section>
    </>
  );
}
