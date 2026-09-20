import type { EnquiryPayload } from "@/types";

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+()\s-]{7,20}$/;

export function validateEnquiryPayload(payload: Partial<EnquiryPayload>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!payload.name?.trim()) {
    errors.name = "Full name is required.";
  }

  if (!payload.phone?.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!phoneRegex.test(payload.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }

  if (!payload.email?.trim()) {
    errors.email = "Email address is required.";
  } else if (!emailRegex.test(payload.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!payload.date?.trim()) {
    errors.date = "Appointment or event date is required.";
  } else {
    const today = new Date().toISOString().split("T")[0];
    if (payload.date < today) {
      errors.date = "Please select today or a future date.";
    }
  }

  if (!payload.location?.trim()) {
    errors.location = "Location or city is required.";
  }

  if (!payload.service?.trim()) {
    errors.service = "Please select a service.";
  }

  if (!payload.message?.trim()) {
    errors.message = "Please share a few details about your appointment.";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// Server-side validation (slightly more permissive on phone format)
export function validateEnquiryServer(payload: Partial<EnquiryPayload>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!payload.name?.trim()) errors.name = "Full name is required.";
  if (!payload.phone?.trim()) errors.phone = "Phone number is required.";
  if (!payload.email?.trim() || !emailRegex.test(payload.email.trim())) {
    errors.email = "A valid email address is required.";
  }
  if (!payload.date?.trim()) errors.date = "Appointment or event date is required.";
  if (!payload.location?.trim()) errors.location = "Location or city is required.";
  if (!payload.service?.trim()) errors.service = "Please select a service.";
  if (!payload.message?.trim()) errors.message = "Please share a few details about your appointment.";

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
