"use client";

import { cn } from "@/lib/cn";

function slotsForDate(date: Date): Date[] {
  const slots: Date[] = [];
  const now = new Date();
  for (let hour = 9; hour < 18; hour++) {
    for (const minute of [0, 30]) {
      const slot = new Date(date);
      slot.setHours(hour, minute, 0, 0);
      if (slot.getTime() > now.getTime()) slots.push(slot);
    }
  }
  return slots;
}

interface TimeSlotGridProps {
  date: Date;
  selected: Date | null;
  onSelect: (slot: Date) => void;
}

export function TimeSlotGrid({ date, selected, onSelect }: TimeSlotGridProps) {
  const slots = slotsForDate(date);

  if (slots.length === 0) {
    return <p className="text-sm text-muted">No slots left today — pick another date.</p>;
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
            {slot.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
          </button>
        );
      })}
    </div>
  );
}
