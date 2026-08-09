import type { ContributionDay } from "@/lib/types";

function buildWeeks(days: ContributionDay[]): (ContributionDay | null)[][] {
  if (days.length === 0) return [];

  const weeks: (ContributionDay | null)[][] = [];
  let currentWeek: (ContributionDay | null)[] = [];

  const firstWeekday = new Date(`${days[0].date}T00:00:00Z`).getUTCDay();
  for (let i = 0; i < firstWeekday; i++) currentWeek.push(null);

  for (const day of days) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }
  return weeks;
}

function intensityClass(count: number, max: number): string {
  if (count === 0) return "bg-white/5";
  const ratio = count / Math.max(max, 1);
  if (ratio > 0.75) return "bg-accent";
  if (ratio > 0.5) return "bg-accent/70";
  if (ratio > 0.25) return "bg-accent/45";
  return "bg-accent/25";
}

export function ContributionHeatmap({ days }: { days: ContributionDay[] }) {
  const weeks = buildWeeks(days);
  const max = Math.max(...days.map((d) => d.count), 1);

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) =>
              day ? (
                <div
                  key={di}
                  title={`${day.date}: ${day.count} contributions`}
                  className={`h-2.5 w-2.5 rounded-sm ${intensityClass(day.count, max)}`}
                />
              ) : (
                <div key={di} className="h-2.5 w-2.5" />
              )
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
