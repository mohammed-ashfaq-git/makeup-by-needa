"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

/** Submit button that shows a pending state while the action runs. */
export function SubmitButton({
  children,
  pendingText = "Saving…",
  className = "a-btn primary",
  confirm,
}: {
  children: ReactNode;
  pendingText?: string;
  className?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      aria-busy={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) {
          event.preventDefault();
        }
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}
