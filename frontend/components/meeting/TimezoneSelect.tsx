"use client";

import { TIMEZONE_OPTIONS } from "@/lib/timezone";

interface TimezoneSelectProps {
  value: string;
  onChange: (id: string) => void;
}

export function TimezoneSelect({ value, onChange }: TimezoneSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none"
    >
      {TIMEZONE_OPTIONS.map((tz) => (
        <option key={tz.id} value={tz.id}>
          {tz.label}
        </option>
      ))}
    </select>
  );
}
