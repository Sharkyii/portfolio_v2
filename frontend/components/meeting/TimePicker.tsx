"use client";

import { useState } from "react";
import { toTimeInputValue, zonedTimeToUtc } from "@/lib/timezone";

interface TimePickerProps {
  date: Date;
  timeZone: string;
  selected: Date | null;
  onSelect: (slot: Date | null) => void;
}

/** Open time-of-day input rather than a fixed 9-to-6 slot grid — the actual
 * meeting time is whatever's comfortable for the person booking, not
 * restricted to business hours. */
export function TimePicker({ date, timeZone, selected, onSelect }: TimePickerProps) {
  const [error, setError] = useState<string | null>(null);

  function handleChange(value: string) {
    setError(null);
    if (!value) {
      onSelect(null);
      return;
    }

    const [hourStr, minuteStr] = value.split(":");
    const instant = zonedTimeToUtc(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      Number(hourStr),
      Number(minuteStr),
      timeZone
    );

    if (instant.getTime() <= Date.now()) {
      setError("That time has already passed today — pick a later time.");
      onSelect(null);
      return;
    }
    onSelect(instant);
  }

  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        Any time works — pick whatever&apos;s comfortable for you.
      </p>
      <input
        type="time"
        value={selected ? toTimeInputValue(selected, timeZone) : ""}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
    </div>
  );
}
