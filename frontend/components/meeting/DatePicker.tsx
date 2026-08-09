"use client";

import { cn } from "@/lib/cn";

function nextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    days.push(d);
  }
  return days;
}

const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

interface DatePickerProps {
  selected: Date | null;
  onSelect: (date: Date) => void;
}

export function DatePicker({ selected, onSelect }: DatePickerProps) {
  const days = nextDays(14);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((day) => {
        const isSelected = selected && day.toDateString() === selected.toDateString();
        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelect(day)}
            className={cn(
              "flex min-w-16 flex-col items-center rounded-xl border px-3 py-2.5 text-sm transition-colors",
              isSelected
                ? "border-transparent bg-gradient-to-br from-accent to-accent-2 text-white"
                : "border-border text-foreground hover:border-border-strong hover:bg-white/5"
            )}
          >
            <span className="text-xs opacity-70">{WEEKDAY[day.getDay()]}</span>
            <span className="text-lg font-semibold">{day.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
