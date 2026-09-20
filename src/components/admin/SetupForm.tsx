"use client";

import { useActionState } from "react";
import { createFirstAdminAction } from "@/lib/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FieldError, fieldClass } from "./FormFeedback";
import { ACTION_IDLE } from "@/lib/form";

export function SetupForm({ requiresSecret }: { requiresSecret: boolean }) {
  const [state, formAction] = useActionState(
    createFirstAdminAction,
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
      <div className="a-banner info">
        <span aria-hidden="true">✨</span>
        <span>
          Create the administrator account for your website. You will use
          these details to sign in at <strong>/admin/login</strong> from now
          on.
        </span>
      </div>

      {requiresSecret && (
        <div className="a-field">
          <label htmlFor="setup-secret">Setup secret</label>
          <input
            id="setup-secret"
            name="setupSecret"
            type="password"
            autoComplete="off"
            required
            className={fieldClass("setupSecret", state)}
            placeholder="Provided by your developer"
          />
          <FieldError name="setupSecret" state={state} />
        </div>
      )}

      <div className="a-field">
        <label htmlFor="setup-name">Your name</label>
        <input
          id="setup-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={fieldClass("name", state)}
          placeholder="e.g. Needa"
        />
        <FieldError name="name" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor="setup-email">Email (used to sign in)</label>
        <input
          id="setup-email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={fieldClass("email", state)}
          placeholder="you@example.com"
        />
        <FieldError name="email" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor="setup-password">Password</label>
        <input
          id="setup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className={fieldClass("password", state)}
          placeholder="At least 8 characters"
        />
        <span className="hint">Use at least 8 characters.</span>
        <FieldError name="password" state={state} />
      </div>

      {state.message && !state.ok && (
        <div className="a-banner error" role="alert">
          <span aria-hidden="true">!</span>
          <span>{state.message}</span>
        </div>
      )}

      <SubmitButton pendingText="Creating account…">
        Create administrator account
      </SubmitButton>
    </form>
  );
}
