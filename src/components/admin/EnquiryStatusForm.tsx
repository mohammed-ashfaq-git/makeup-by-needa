"use client";

import { useActionState } from "react";
import { updateEnquiryStatusAction } from "@/lib/actions/enquiries";
import { SubmitButton } from "./SubmitButton";
import { FormBanner } from "./FormFeedback";
import { ACTION_IDLE } from "@/lib/form";
import type { EnquiryStatus } from "@/lib/db/schema";

const STATUSES: EnquiryStatus[] = [
  "NEW",
  "CONTACTED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

export function EnquiryStatusForm({
  enquiryId,
  currentStatus,
}: {
  enquiryId: number;
  currentStatus: EnquiryStatus;
}) {
  const [state, formAction] = useActionState(
    updateEnquiryStatusAction,
    ACTION_IDLE,
  );

  return (
    <form
      action={formAction}
      className="a-form"
      // React resets forms after a server action finishes; cancel that so
      // the user's input survives validation errors and successful saves.
      onReset={(event) => event.preventDefault()}
    >
      <input type="hidden" name="id" value={enquiryId} />

      <FormBanner state={state} />

      <div className="a-filter-bar">
        <div className="a-field">
          <label htmlFor="enquiry-status">Status</label>
          <select
            id="enquiry-status"
            name="status"
            defaultValue={currentStatus}
            className="a-select"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        <SubmitButton pendingText="Updating…">Update status</SubmitButton>
      </div>
    </form>
  );
}
