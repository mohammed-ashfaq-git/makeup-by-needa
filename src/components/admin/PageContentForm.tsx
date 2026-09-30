"use client";

import { useActionState } from "react";
import { savePageContentAction } from "@/lib/actions/page-content";
import { ACTION_IDLE } from "@/lib/form";
import { PAGE_CONTENT_FIELDS, type PageContent } from "@/lib/page-content";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { SubmitButton } from "./SubmitButton";

const PAGE_LABELS: Record<keyof typeof PAGE_CONTENT_FIELDS, string> = {
  home: "Home page",
  about: "About page",
  services: "Services page",
  gallery: "Gallery page",
  contact: "Contact page",
  booking: "Booking page",
};

export function PageContentForm({ initial }: { initial: PageContent }) {
  const [state, formAction] = useActionState(savePageContentAction, ACTION_IDLE);

  return (
    <form action={formAction} className="a-form page-content-form">
      <FormBanner state={state} />
      <div className="page-content-notice">
        Edit the headings and introductions shown on each public page. Use the
        content managers for service prices, photos, artist details, reviews,
        FAQs and enquiries.
      </div>

      {Object.entries(PAGE_CONTENT_FIELDS).map(([page, fields]) => (
        <section className="a-card page-content-group" key={page}>
          <div className="a-card-head">
            <div>
              <h2>{PAGE_LABELS[page as keyof typeof PAGE_LABELS]}</h2>
              <p className="a-muted">Public page headings and supporting copy</p>
            </div>
          </div>
          <div className="a-grid-2">
            {fields.map(([key, label]) => {
              const multiline = /description|introduction|note|story/i.test(key);
              return (
                <div className={`a-field${multiline ? " page-content-wide" : ""}`} key={key}>
                  <label htmlFor={`copy-${key}`}>{label}</label>
                  {multiline ? (
                    <textarea
                      id={`copy-${key}`}
                      name={key}
                      defaultValue={initial[key]}
                      maxLength={2000}
                      rows={3}
                      required
                      className={fieldClass(key, state, "a-textarea")}
                    />
                  ) : (
                    <input
                      id={`copy-${key}`}
                      name={key}
                      defaultValue={initial[key]}
                      maxLength={2000}
                      required
                      className={fieldClass(key, state)}
                    />
                  )}
                  <span className="hint">Up to 2,000 characters.</span>
                  <FieldError name={key} state={state} />
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <div className="a-btn-row page-content-save">
        <SubmitButton pendingText="Saving…">Save all page copy</SubmitButton>
      </div>
    </form>
  );
}
