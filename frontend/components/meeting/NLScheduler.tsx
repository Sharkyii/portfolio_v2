"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { ScheduleResponse } from "@/lib/types";
import { ConfirmationCard } from "./ConfirmationCard";

export function NLScheduler() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScheduleResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.scheduleMeeting({ name, email, message });
      setResult(res);
      if (!res.booked && res.clarification_question) {
        setMessage("");
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.status === 503
            ? "Natural-language scheduling isn't configured on the backend yet."
            : err.message
          : "Something went wrong.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result?.booked && result.event_id && result.calendar_link) {
    return (
      <ConfirmationCard
        booking={{
          event_id: result.event_id,
          calendar_link: result.calendar_link,
          meet_link: result.meet_link,
          email_sent: result.email_sent,
        }}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Tell me when — e.g. &ldquo;next Wednesday at 3pm for 30 min to talk about Cascade&rdquo;.
      </p>

      {result && !result.booked && result.clarification_question && (
        <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm">
          {result.clarification_question}
        </div>
      )}

      <div>
        <label className="mb-1 block text-xs text-muted">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Message</label>
        <textarea
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Thinking..." : "Send"}
      </Button>
    </form>
  );
}
