import type { PullRequest } from "@/lib/types";

export function PRMarquee({ prs }: { prs: PullRequest[] }) {
  if (prs.length === 0) return null;

  // Duplicated once so the CSS animation can loop seamlessly at -50%.
  const items = [...prs, ...prs];

  return (
    <div className="relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
      <div className="flex w-max animate-marquee gap-4">
        {items.map((pr, i) => (
          <a
            key={`${pr.url}-${i}`}
            href={pr.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-w-[280px] flex-col gap-1 rounded-xl border border-border bg-surface px-4 py-3 text-sm hover:border-border-strong"
          >
            <span className="truncate text-foreground">{pr.title}</span>
            <span className="text-xs text-muted">{pr.repo}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
