export interface TimezoneOption {
  id: string; // "auto" or an IANA zone name
  label: string;
}

export const TIMEZONE_OPTIONS: TimezoneOption[] = [
  { id: "auto", label: "Your timezone" },
  { id: "Asia/Kolkata", label: "India (IST)" },
  { id: "America/New_York", label: "US Eastern" },
  { id: "America/Los_Angeles", label: "US Pacific" },
  { id: "Europe/London", label: "UK" },
  { id: "UTC", label: "UTC" },
];

export function resolveTimeZone(id: string): string {
  return id === "auto" ? Intl.DateTimeFormat().resolvedOptions().timeZone : id;
}

/** Builds the UTC instant for a given wall-clock time *as read in `timeZone`* —
 * e.g. (2026, 0, 15, 15, 0, "Asia/Kolkata") is 3pm IST, not 3pm local browser
 * time. Native Date has no direct "construct in this zone" API.
 *
 * Deliberately uses `formatToParts` rather than the more common
 * `toLocaleString` + `new Date(string)` trick: that trick reparses the
 * formatted string using the *runtime's own* local timezone, so it's only
 * correct when the runtime happens to be in the same zone as the target —
 * caught this in testing because the sandbox's system zone is itself IST,
 * which silently masked the bug for that one case and broke every other
 * zone. Extracting numeric parts and feeding them through `Date.UTC`
 * sidesteps the runtime's local zone entirely. */
export function zonedTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const naiveUtc = Date.UTC(year, month, day, hour, minute);

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(naiveUtc));

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
  const tzAsUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second")
  );

  const offset = tzAsUtc - naiveUtc;
  return new Date(naiveUtc - offset);
}

export function formatInTimeZone(
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): string {
  return new Intl.DateTimeFormat("en-US", { ...options, timeZone }).format(date);
}
