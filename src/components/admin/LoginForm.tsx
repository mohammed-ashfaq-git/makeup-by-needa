"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions/auth";
import { SubmitButton } from "./SubmitButton";
import { FieldError, fieldClass } from "./FormFeedback";
import { ACTION_IDLE } from "@/lib/form";

export function LoginForm() {
  const [state, formAction] = useActionState(loginAction, ACTION_IDLE);

  return (
    <form
      action={formAction}
      className="a-form"
      // React resets forms after a server action finishes; cancel that so
      // the user's input survives validation errors and successful saves.
      onReset={(event) => event.preventDefault()}
    >
      <div className="a-banner info">
        <span aria-hidden="true">🔒</span>
        <span>
          This area is for the site owner. Sign in with your administrator
          email and password.
        </span>
      </div>

      <div className="a-field">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
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
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={fieldClass("password", state)}
          placeholder="Your password"
        />
        <FieldError name="password" state={state} />
      </div>

      {state.message && !state.ok && (
        <div className="a-banner error" role="alert">
          <span aria-hidden="true">!</span>
          <span>{state.message}</span>
        </div>
      )}

      <SubmitButton pendingText="Signing in…">Log in</SubmitButton>
    </form>
  );
}
