"use client";

import { cn } from "@/lib/cn";
import { formatInTimeZone, zonedTimeToUtc } from "@/lib/timezone";

function slotsForDate(date: Date, timeZone: string): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  for (let hour = 9; hour < 18; hour++) {
    for (const minute of [0, 30]) {
      const slot = zonedTimeToUtc(year, month, day, hour, minute, timeZone);
      if (slot.getTime() > now.getTime()) slots.push(slot);
    }
  }
  return slots;
}

interface TimeSlotGridProps {
  date: Date;
  timeZone: string;
  selected: Date | null;
  onSelect: (slot: Date) => void;
}

export function TimeSlotGrid({ date, timeZone, selected, onSelect }: TimeSlotGridProps) {
  const slots = slotsForDate(date, timeZone);

  if (slots.length === 0) {
    return <p className="text-sm text-muted">No slots left that day — pick another date.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
      {slots.map((slot) => {
        const isSelected = selected?.getTime() === slot.getTime();
        return (
          <button
            key={slot.getTime()}
            onClick={() => onSelect(slot)}
            className={cn(
              "rounded-lg border px-3 py-2 text-sm transition-colors",
              isSelected
                ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white"
                : "border-border text-foreground hover:border-border-strong hover:bg-white/5"
            )}
          >
            {formatInTimeZone(slot, timeZone, { hour: "numeric", minute: "2-digit" })}
          </button>
        );
      })}
    </div>
  );
}
