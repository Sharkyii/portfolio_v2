"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";
import type { BookingResponse } from "@/lib/types";

interface BookingFormProps {
  slot: Date;
  duration: number;
  onDurationChange: (minutes: number) => void;
  onSuccess: (response: BookingResponse) => void;
  onSlotTaken: () => void;
}

export function BookingForm({
  slot,
  duration,
  onDurationChange,
  onSuccess,
  onSlotTaken,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await api.bookMeeting({
        name,
        email,
        start: slot.toISOString(),
        duration_minutes: duration,
        topic,
      });
      onSuccess(res);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        onSlotTaken();
        return;
      }
      const message =
        err instanceof ApiError
          ? err.status === 503
            ? "Meeting booking isn't configured on the backend yet."
            : err.message
          : "Something went wrong booking that slot.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-border bg-surface px-4 py-3 text-sm">
        {slot.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" })} at{" "}
        {slot.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Duration</label>
        <select
          value={duration}
          onChange={(e) => onDurationChange(Number(e.target.value))}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        >
          <option value={15}>15 minutes</option>
          <option value={30}>30 minutes</option>
          <option value={45}>45 minutes</option>
          <option value={60}>60 minutes</option>
        </select>
      </div>

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
        <label className="mb-1 block text-xs text-muted">What&apos;s it about?</label>
        <textarea
          required
          rows={3}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Booking..." : "Confirm meeting"}
      </Button>
    </form>
  );
}
