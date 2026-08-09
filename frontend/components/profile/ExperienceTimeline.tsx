import { Badge } from "@/components/ui/Badge";
import type { ProfileExperience, ProfileResearch } from "@/lib/types";

interface TimelineItem {
  kind: "Experience" | "Research";
  title: string;
  subtitle: string;
  start: string;
  end: string;
  highlights: string[];
}

export function ExperienceTimeline({
  experience,
  research,
}: {
  experience: ProfileExperience[];
  research: ProfileResearch[];
}) {
  const items: TimelineItem[] = [
    ...experience.map((e) => ({
      kind: "Experience" as const,
      title: e.role,
      subtitle: `${e.org} · ${e.location}`,
      start: e.start,
      end: e.end,
      highlights: e.highlights,
    })),
    ...research.map((r) => ({
      kind: "Research" as const,
      title: r.title,
      subtitle: r.org,
      start: r.start,
      end: r.end,
      highlights: r.highlights,
    })),
  ];

  return (
    <div className="relative border-l border-border pl-8">
      {items.map((item, i) => (
        <div key={i} className="relative pb-12 last:pb-0">
          <span className="absolute -left-[calc(2rem+5px)] top-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-accent-2" />
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge>{item.kind}</Badge>
            <span className="text-xs text-muted">
              {item.start} — {item.end}
            </span>
          </div>
          <h3 className="text-lg font-semibold">{item.title}</h3>
          <p className="mb-3 text-sm text-muted">{item.subtitle}</p>
          <ul className="space-y-2">
            {item.highlights.map((h, hi) => (
              <li key={hi} className="text-sm leading-relaxed text-foreground/80">
                {h}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
