"use client";

import { useActionState } from "react";
import { saveSettingsAction } from "@/lib/actions/settings";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { ImageField } from "./ImageField";
import { ACTION_IDLE } from "@/lib/form";

export type SettingsFormValues = {
  businessName: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  phone: string | null;
  email: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  whatsappMessage: string;
  location: string;
  address: string | null;
  hours: string | null;
  instagramMakeupHandle: string;
  instagramMakeupUrl: string;
  instagramNailsHandle: string;
  instagramNailsUrl: string;
  facebookUrl: string | null;
  homeTitle: string;
  homeDescription: string;
  footerText: string;
};

export function SettingsForm({ initial }: { initial: SettingsFormValues }) {
  const [state, formAction] = useActionState(saveSettingsAction, ACTION_IDLE);

  return (
    <form
      action={formAction}
      className="a-form"
      // React resets forms after a server action finishes; cancel that so
      // the user's input survives validation errors and successful saves.
      onReset={(event) => event.preventDefault()}
    >
      <FormBanner state={state} />

      <div className="a-grid-2">
        <div className="a-field">
          <label htmlFor="s-business-name">Business name</label>
          <input
            id="s-business-name"
            name="businessName"
            defaultValue={initial.businessName}
            required
            className={fieldClass("businessName", state)}
          />
          <FieldError name="businessName" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-phone">Phone</label>
          <input
            id="s-phone"
            name="phone"
            type="tel"
            defaultValue={initial.phone ?? ""}
            placeholder="Optional — shown on the contact page"
            className={fieldClass("phone", state)}
          />
          <FieldError name="phone" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-email">Email</label>
          <input
            id="s-email"
            name="email"
            type="email"
            defaultValue={initial.email}
            required
            className={fieldClass("email", state)}
          />
          <FieldError name="email" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-whatsapp">WhatsApp number</label>
          <input
            id="s-whatsapp"
            name="whatsappNumber"
            defaultValue={initial.whatsappNumber}
            required
            placeholder="Digits only, e.g. 15483287786"
            className={fieldClass("whatsappNumber", state)}
          />
          <FieldError name="whatsappNumber" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-whatsapp-display">WhatsApp display number</label>
          <input
            id="s-whatsapp-display"
            name="whatsappDisplay"
            defaultValue={initial.whatsappDisplay}
            required
            className={fieldClass("whatsappDisplay", state)}
          />
          <FieldError name="whatsappDisplay" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-whatsapp-message">WhatsApp message</label>
          <input
            id="s-whatsapp-message"
            name="whatsappMessage"
            defaultValue={initial.whatsappMessage}
            required
            className={fieldClass("whatsappMessage", state)}
          />
          <FieldError name="whatsappMessage" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-location">Location</label>
          <input
            id="s-location"
            name="location"
            defaultValue={initial.location}
            required
            placeholder="e.g. Toronto, Canada"
            className={fieldClass("location", state)}
          />
          <FieldError name="location" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-address">Address</label>
          <input
            id="s-address"
            name="address"
            defaultValue={initial.address ?? ""}
            placeholder="Optional — shown on the contact page"
            className={fieldClass("address", state)}
          />
          <FieldError name="address" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-hours">Hours</label>
          <input
            id="s-hours"
            name="hours"
            defaultValue={initial.hours ?? ""}
            placeholder="e.g. By appointment"
            className={fieldClass("hours", state)}
          />
          <FieldError name="hours" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-instagram-makeup">
            Instagram — makeup &amp; hair handle
          </label>
          <input
            id="s-instagram-makeup"
            name="instagramMakeupHandle"
            defaultValue={initial.instagramMakeupHandle}
            required
            className={fieldClass("instagramMakeupHandle", state)}
          />
          <FieldError name="instagramMakeupHandle" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-instagram-makeup-url">
            Instagram — makeup &amp; hair link
          </label>
          <input
            id="s-instagram-makeup-url"
            name="instagramMakeupUrl"
            defaultValue={initial.instagramMakeupUrl}
            required
            className={fieldClass("instagramMakeupUrl", state)}
          />
          <FieldError name="instagramMakeupUrl" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-instagram-nails">Instagram — nails handle</label>
          <input
            id="s-instagram-nails"
            name="instagramNailsHandle"
            defaultValue={initial.instagramNailsHandle}
            required
            className={fieldClass("instagramNailsHandle", state)}
          />
          <FieldError name="instagramNailsHandle" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-instagram-nails-url">Instagram — nails link</label>
          <input
            id="s-instagram-nails-url"
            name="instagramNailsUrl"
            defaultValue={initial.instagramNailsUrl}
            required
            className={fieldClass("instagramNailsUrl", state)}
          />
          <FieldError name="instagramNailsUrl" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-facebook">Facebook page link</label>
          <input
            id="s-facebook"
            name="facebookUrl"
            defaultValue={initial.facebookUrl ?? ""}
            placeholder="Optional — https://facebook.com/…"
            className={fieldClass("facebookUrl", state)}
          />
          <FieldError name="facebookUrl" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-home-title">Homepage title</label>
          <input
            id="s-home-title"
            name="homeTitle"
            defaultValue={initial.homeTitle}
            required
            className={fieldClass("homeTitle", state)}
          />
          <span className="hint">
            The page title shown in browser tabs and Google results.
          </span>
          <FieldError name="homeTitle" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-home-description">Homepage description</label>
          <input
            id="s-home-description"
            name="homeDescription"
            defaultValue={initial.homeDescription}
            required
            className={fieldClass("homeDescription", state)}
          />
          <span className="hint">
            A short summary shown in search engine results.
          </span>
          <FieldError name="homeDescription" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="s-footer-text">Footer text</label>
          <input
            id="s-footer-text"
            name="footerText"
            defaultValue={initial.footerText}
            required
            className={fieldClass("footerText", state)}
          />
          <FieldError name="footerText" state={state} />
        </div>
      </div>

      <ImageField
        name="logo"
        label="Logo"
        hint="Optional — JPG, PNG, or WEBP up to 5 MB. Shown in the header and footer."
        state={state}
        currentImageUrl={
          initial.logoUrl && initial.logoUrl !== "/makeup-by-needa-logo.jpg"
            ? initial.logoUrl
            : null
        }
        removeName="removeLogo"
        removeLabel="Use the default logo instead"
      />

      <ImageField
        name="hero"
        label="Homepage hero image"
        hint="Optional — when empty, the first active gallery image is used as the hero."
        state={state}
        currentImageUrl={initial.heroImageUrl ?? null}
        removeName="removeHero"
        removeLabel="Use the first gallery image instead"
        previewWidth={160}
      />

      <div className="a-btn-row">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
