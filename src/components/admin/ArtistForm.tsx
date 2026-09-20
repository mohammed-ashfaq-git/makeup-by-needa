"use client";

import { useActionState } from "react";
import { saveArtistAction } from "@/lib/actions/artist";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import { ImageField } from "./ImageField";
import { ACTION_IDLE } from "@/lib/form";

export type ArtistFormValues = {
  name: string;
  photoUrl: string | null;
  shortBio: string;
  bio: string;
  experience: string | null;
  specialties: string | null;
  qualifications: string | null;
  location: string | null;
  instagram: string | null;
};

export function ArtistForm({ initial }: { initial: ArtistFormValues }) {
  const [state, formAction] = useActionState(saveArtistAction, ACTION_IDLE);

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
          <label htmlFor="a-name">Name</label>
          <input
            id="a-name"
            name="name"
            defaultValue={initial.name}
            required
            className={fieldClass("name", state)}
          />
          <FieldError name="name" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="a-location">Location</label>
          <input
            id="a-location"
            name="location"
            defaultValue={initial.location ?? ""}
            placeholder="e.g. Toronto, Canada"
            className={fieldClass("location", state)}
          />
          <FieldError name="location" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="a-instagram">Instagram</label>
          <input
            id="a-instagram"
            name="instagram"
            defaultValue={initial.instagram ?? ""}
            placeholder="e.g. @makeupbynee_"
            className={fieldClass("instagram", state)}
          />
          <FieldError name="instagram" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="a-experience">Experience</label>
          <input
            id="a-experience"
            name="experience"
            defaultValue={initial.experience ?? ""}
            placeholder="e.g. 6+ years of bridal & event artistry"
            className={fieldClass("experience", state)}
          />
          <FieldError name="experience" state={state} />
        </div>
      </div>

      <div className="a-field">
        <label htmlFor="a-short-bio">Short bio</label>
        <input
          id="a-short-bio"
          name="shortBio"
          defaultValue={initial.shortBio}
          required
          className={fieldClass("shortBio", state)}
        />
        <span className="hint">
          One or two sentences — appears at the top of the About page.
        </span>
        <FieldError name="shortBio" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor="a-bio">Full biography</label>
        <textarea
          id="a-bio"
          name="bio"
          defaultValue={initial.bio}
          required
          rows={8}
          className={fieldClass("bio", state, "a-textarea")}
        />
        <span className="hint">
          Leave a blank line between paragraphs — each becomes its own
          paragraph on the About page.
        </span>
        <FieldError name="bio" state={state} />
      </div>

      <div className="a-grid-2">
        <div className="a-field">
          <label htmlFor="a-specialties">Specialties</label>
          <textarea
            id="a-specialties"
            name="specialties"
            defaultValue={initial.specialties ?? ""}
            rows={4}
            placeholder={"Bridal makeup\nSoft glam\nNail art"}
            className={fieldClass("specialties", state, "a-textarea")}
          />
          <span className="hint">One per line.</span>
          <FieldError name="specialties" state={state} />
        </div>

        <div className="a-field">
          <label htmlFor="a-qualifications">Qualifications</label>
          <textarea
            id="a-qualifications"
            name="qualifications"
            defaultValue={initial.qualifications ?? ""}
            rows={4}
            placeholder={"Certified makeup artist\nHair styling certificate"}
            className={fieldClass("qualifications", state, "a-textarea")}
          />
          <span className="hint">One per line.</span>
          <FieldError name="qualifications" state={state} />
        </div>
      </div>

      <ImageField
        name="photo"
        label="Profile photo"
        hint="Optional — replaces the portrait placeholder on the About page."
        state={state}
        currentImageUrl={initial.photoUrl}
        removeName="removePhoto"
        removeLabel="Remove the current photo"
        previewWidth={150}
      />

      <div className="a-btn-row">
        <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
      </div>
    </form>
  );
}
