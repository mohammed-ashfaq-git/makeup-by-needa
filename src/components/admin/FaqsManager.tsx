"use client";

import { useState } from "react";
import {
  deleteFaqAction,
  moveFaqAction,
  saveFaqAction,
  toggleFaqAction,
} from "@/lib/actions/faqs";
import { SubmitButton } from "./SubmitButton";
import { FieldError, FormBanner, fieldClass } from "./FormFeedback";
import {
  ActiveBadge,
  InlineForm,
  ManagerRow,
  useManagerForm,
} from "./manager-utils";

export type AdminFaq = {
  id: number;
  question: string;
  answer: string;
  active: boolean;
};

export function FaqsManager({ items }: { items: AdminFaq[] }) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h2>Frequently asked questions</h2>
          <p className="a-muted">
            {items.length} question{items.length === 1 ? "" : "s"} · shown on
            the booking page
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            className="a-btn primary"
            onClick={() => {
              setAdding(true);
              setEditingId(null);
            }}
          >
            + Add FAQ
          </button>
        )}
      </div>

      {adding && (
        <InlineForm>
          <FaqForm initial={null} onDone={() => setAdding(false)} />
        </InlineForm>
      )}

      <div className="manager-list">
        {items.length === 0 && !adding && (
          <p className="a-empty">
            No FAQs yet — add one and it will appear on the booking page.
          </p>
        )}

        {items.map((item) => (
          <div key={item.id}>
            <ManagerRow
              actions={
                <>
                  <form action={moveFaqAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move “${item.question}” up`}
                      title="Move up"
                    >
                      ↑
                    </button>
                  </form>
                  <form action={moveFaqAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      className="a-btn ghost small"
                      aria-label={`Move “${item.question}” down`}
                      title="Move down"
                    >
                      ↓
                    </button>
                  </form>
                  <button
                    type="button"
                    className="a-btn small"
                    onClick={() => {
                      setEditingId(editingId === item.id ? null : item.id);
                      setAdding(false);
                    }}
                  >
                    {editingId === item.id ? "Close" : "Edit"}
                  </button>
                  <form action={toggleFaqAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="a-btn ghost small">
                      {item.active ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteFaqAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <SubmitButton
                      className="a-btn danger small"
                      pendingText="…"
                      confirm={`Delete “${item.question}”? This cannot be undone.`}
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </>
              }
            >
              <div>
                <strong>
                  {item.question} <ActiveBadge active={item.active} />
                </strong>
                <div className="meta" style={{ marginTop: 4 }}>
                  {item.answer.length > 110
                    ? `${item.answer.slice(0, 110)}…`
                    : item.answer}
                </div>
              </div>
            </ManagerRow>

            {editingId === item.id && (
              <InlineForm>
                <FaqForm
                  initial={item}
                  onDone={() => setEditingId(null)}
                />
              </InlineForm>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqForm({
  initial,
  onDone,
}: {
  initial: AdminFaq | null;
  onDone: () => void;
}) {
  const [state, formAction] = useManagerForm(saveFaqAction, onDone);

  return (
    <form
      action={formAction}
      className="a-form"
      // React resets forms after a server action finishes; cancel that so
      // the user's input survives validation errors and successful saves.
      onReset={(event) => event.preventDefault()}
    >
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <FormBanner state={state} />

      <div className="a-field">
        <label htmlFor={`q-question-${initial?.id ?? "new"}`}>Question</label>
        <input
          id={`q-question-${initial?.id ?? "new"}`}
          name="question"
          defaultValue={initial?.question ?? ""}
          required
          className={fieldClass("question", state)}
        />
        <FieldError name="question" state={state} />
      </div>

      <div className="a-field">
        <label htmlFor={`q-answer-${initial?.id ?? "new"}`}>Answer</label>
        <textarea
          id={`q-answer-${initial?.id ?? "new"}`}
          name="answer"
          defaultValue={initial?.answer ?? ""}
          required
          rows={4}
          className={fieldClass("answer", state, "a-textarea")}
        />
        <FieldError name="answer" state={state} />
      </div>

      <label className="a-check">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
        />
        Visible on the website
      </label>

      <div className="a-btn-row">
        <SubmitButton pendingText="Saving…">
          {initial ? "Save FAQ" : "Add FAQ"}
        </SubmitButton>
        <button type="button" className="a-btn ghost" onClick={onDone}>
          Cancel
        </button>
      </div>
    </form>
  );
}
