"use client";

import { useEffect, type ReactNode } from "react";
import { useActionState } from "react";
import type { ActionState } from "@/lib/form";
import { ACTION_IDLE } from "@/lib/form";

/**
 * Shared hook for inline manager forms (services, gallery, testimonials,
 * FAQs): wraps useActionState and auto-collapses the form shortly after a
 * successful save.
 */
export function useManagerForm(
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>,
  onDone: () => void,
) {
  const [state, formAction] = useActionState(action, ACTION_IDLE);

  useEffect(() => {
    if (state.ok) {
      const timer = setTimeout(onDone, 1200);
      return () => clearTimeout(timer);
    }
  }, [state, onDone]);

  return [state, formAction] as const;
}

/** A single list row in a manager list. */
export function ManagerRow({
  children,
  actions,
}: {
  children: ReactNode;
  actions: ReactNode;
}) {
  return (
    <div className="manager-row">
      <div className="manager-row-main">{children}</div>
      <div className="manager-row-actions">{actions}</div>
    </div>
  );
}

/** Container for an inline add/edit form. */
export function InlineForm({ children }: { children: ReactNode }) {
  return <div className="manager-inline-form">{children}</div>;
}

export function ActiveBadge({ active }: { active: boolean }) {
  return (
    <span className={`a-badge ${active ? "on" : "off"}`}>
      {active ? "Visible" : "Hidden"}
    </span>
  );
}
