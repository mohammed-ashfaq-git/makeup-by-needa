"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { services } from "@/config/site";
import { buildEnquiryWhatsAppUrl } from "@/lib/utils/whatsapp";
import { validateEnquiryPayload } from "@/lib/validations/enquiry";
import type { EnquiryPayload, EnquiryResponse } from "@/types";

type FormFields = EnquiryPayload;

const initialFields: FormFields = {
  name: "",
  phone: "",
  email: "",
  date: "",
  location: "",
  service: "",
  time: "",
  people: "1",
  message: "",
};

export function EnquiryForm() {
  const [fields, setFields] = useState<FormFields>(initialFields);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [responseInfo, setResponseInfo] = useState<EnquiryResponse | null>(null);

  const makeupServices = services.filter((s) => s.category === "Makeup");
  const hairServices = services.filter((s) => s.category === "Hair");
  const nailServices = services.filter((s) => s.category === "Nails");

  const setDateInputRef = (node: HTMLInputElement | null) => {
    if (node) {
      node.min = new Date().toISOString().split("T")[0];
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const result = validateEnquiryPayload(fields);
    setFieldErrors(result.errors);
    return result.valid;
  };

  const buildFallbackWhatsAppUrl = (): string => {
    return buildEnquiryWhatsAppUrl(fields);
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (state === "loading") return;
    if (!validate()) return;

    setState("loading");
    setResponseInfo(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });

      const data = (await response.json()) as EnquiryResponse;

      if (!response.ok || !data.ok) {
        if (data.errors) {
          setFieldErrors(data.errors);
        }
        throw new Error(data.message || "Failed to process enquiry");
      }

      setResponseInfo(data);
      setState("success");
    } catch {
      setState("error");
      setResponseInfo({
        ok: false,
        whatsappUrl: buildFallbackWhatsAppUrl(),
      });
    }
  };

  const handleReset = () => {
    setFields(initialFields);
    setFieldErrors({});
    setState("idle");
    setResponseInfo(null);
  };

  if (state === "success") {
    const waUrl = responseInfo?.whatsappUrl || buildFallbackWhatsAppUrl();

    return (
      <div className="enquiry-card enquiry-success-card" role="status" aria-live="polite">
        <div className="enquiry-status-icon" aria-hidden="true">
          ✓
        </div>

        <p className="eyebrow">Enquiry Received</p>

        <h3 className="enquiry-card-title">
          Thank you, {fields.name.split(" ")[0] || "there"}!
        </h3>

        <p className="enquiry-status-desc">
          Your enquiry for <strong>{fields.service}</strong> on{" "}
          <strong>{fields.date}</strong> has been received.
        </p>

        <div className="enquiry-info-box">
          <p>
            <strong>Important note:</strong> This is an enquiry, not an automatic
            booking confirmation. Needa will review your event details and get
            back to you directly to confirm availability and timing.
          </p>

          <p>
            We will respond via email at <strong>{fields.email}</strong> or by
            phone at <strong>{fields.phone}</strong>.
          </p>
        </div>

        <div className="enquiry-action-row">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            className="button enquiry-whatsapp-btn"
          >
            <span>Chat on WhatsApp with these details ↗</span>
          </a>

          <button
            type="button"
            onClick={handleReset}
            className="text-link enquiry-new-btn"
          >
            Submit another enquiry <b>→</b>
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={submit} noValidate>
      <div className="form-grid">
        <label htmlFor="enquiry-name">
          Full name <span className="req" aria-hidden="true">*</span>
          <input
            id="enquiry-name"
            required
            name="name"
            value={fields.name}
            onChange={handleChange}
            placeholder="Your full name"
            aria-invalid={Boolean(fieldErrors.name)}
            aria-describedby={fieldErrors.name ? "name-error" : undefined}
          />
          {fieldErrors.name && (
            <span id="name-error" className="field-error">
              {fieldErrors.name}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-phone">
          Phone number <span className="req" aria-hidden="true">*</span>
          <input
            id="enquiry-phone"
            required
            name="phone"
            type="tel"
            value={fields.phone}
            onChange={handleChange}
            placeholder="(416) 000-0000"
            aria-invalid={Boolean(fieldErrors.phone)}
            aria-describedby={fieldErrors.phone ? "phone-error" : undefined}
          />
          {fieldErrors.phone && (
            <span id="phone-error" className="field-error">
              {fieldErrors.phone}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-email">
          Email address <span className="req" aria-hidden="true">*</span>
          <input
            id="enquiry-email"
            required
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            placeholder="you@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error">
              {fieldErrors.email}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-date">
          Appointment / Event date <span className="req" aria-hidden="true">*</span>
          <input
            ref={setDateInputRef}
            id="enquiry-date"
            required
            name="date"
            type="date"
            value={fields.date}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.date)}
            aria-describedby={fieldErrors.date ? "date-error" : undefined}
          />
          {fieldErrors.date && (
            <span id="date-error" className="field-error">
              {fieldErrors.date}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-location">
          Location / City <span className="req" aria-hidden="true">*</span>
          <input
            id="enquiry-location"
            required
            name="location"
            value={fields.location}
            onChange={handleChange}
            placeholder="e.g. Toronto, Mississauga, Markham, Studio"
            aria-invalid={Boolean(fieldErrors.location)}
            aria-describedby={fieldErrors.location ? "location-error" : undefined}
          />
          {fieldErrors.location && (
            <span id="location-error" className="field-error">
              {fieldErrors.location}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-service">
          Service / Event type <span className="req" aria-hidden="true">*</span>
          <select
            id="enquiry-service"
            required
            name="service"
            value={fields.service}
            onChange={handleChange}
            aria-invalid={Boolean(fieldErrors.service)}
            aria-describedby={fieldErrors.service ? "service-error" : undefined}
          >
            <option value="">Select a service category</option>
            <optgroup label="── Makeup Artistry ──">
              {makeupServices.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="── Hair Styling ──">
              {hairServices.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="── Nail Art ──">
              {nailServices.map((x) => (
                <option key={x.name} value={x.name}>
                  {x.name}
                </option>
              ))}
            </optgroup>
          </select>
          {fieldErrors.service && (
            <span id="service-error" className="field-error">
              {fieldErrors.service}
            </span>
          )}
        </label>

        <label htmlFor="enquiry-time">
          Preferred ready-by time
          <input
            id="enquiry-time"
            name="time"
            value={fields.time}
            onChange={handleChange}
            placeholder="e.g. 11:00 AM (Optional)"
          />
        </label>

        <label htmlFor="enquiry-people">
          Number of people
          <input
            id="enquiry-people"
            name="people"
            type="number"
            min="1"
            max="20"
            value={fields.people}
            onChange={handleChange}
            placeholder="1"
          />
        </label>
      </div>

      <label htmlFor="enquiry-message">
        Tell me about your occasion &amp; vision <span className="req" aria-hidden="true">*</span>
        <textarea
          id="enquiry-message"
          required
          name="message"
          rows={4}
          value={fields.message}
          onChange={handleChange}
          placeholder="Please share occasion type, preferred finish/style, bridal requirements, or any questions."
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? "message-error" : undefined}
        />
        {fieldErrors.message && (
          <span id="message-error" className="field-error">
            {fieldErrors.message}
          </span>
        )}
      </label>

      {state === "error" && (
        <div className="form-status error" role="alert">
          <p>
            <strong>Note:</strong> We encountered an issue submitting your
            enquiry online. To avoid delays, please send your enquiry directly
            through WhatsApp with your details pre-filled:
          </p>
          <a
            href={responseInfo?.whatsappUrl || buildFallbackWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="button enquiry-whatsapp-fallback-btn"
          >
            Send enquiry via WhatsApp ↗
          </a>
        </div>
      )}

      <div className="form-submit-row">
        <button
          type="submit"
          className="button"
          disabled={state === "loading"}
          aria-busy={state === "loading"}
        >
          {state === "loading" ? "Submitting enquiry…" : "Send appointment enquiry"}
        </button>
        <span className="form-privacy-note">
          Your enquiry is directly reviewed by Needa. No spam, ever.
        </span>
      </div>

      <p className="form-note">
        This is an appointment enquiry, not a confirmed booking. Availability
        and final details will be confirmed with you directly.
      </p>
    </form>
  );
}
