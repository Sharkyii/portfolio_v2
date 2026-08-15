import Image from "next/image";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

/** Every card is the same fixed box regardless of the source image's native
 * dimensions — `object-cover` crops to fill its own contained region, so a
 * 1200x630 SVG cover next to an arbitrary-sized screenshot still reads as one
 * consistent set. The image stays boxed to its own area rather than
 * full-bleeding behind the text: several project images are themselves dense
 * (dashboards, product screenshots, even the hand-drawn covers already carry
 * their own title text), and stacking more text on top of that read as
 * cluttered and illegible. */
export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="group flex h-[520px] w-[340px] flex-shrink-0 flex-col overflow-hidden rounded-3xl border border-border card-texture transition-colors duration-200 hover:border-border-strong sm:w-[400px]">
      <div className="relative h-44 w-full flex-shrink-0 overflow-hidden bg-surface-raised sm:h-48">
        {project.image ? (
          <Image
            src={project.image}
            alt={project.title}
            fill
            unoptimized
            sizes="400px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            {project.title}
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-surface/90 via-transparent to-transparent" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {project.category && (
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
            {project.category}
          </p>
        )}
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{project.title}</h3>
        {project.summary && (
          <p className="line-clamp-3 text-sm leading-relaxed text-muted">{project.summary}</p>
        )}

        {project.stack.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.stack.slice(0, 4).map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
        )}

        <div className="mt-auto flex gap-2 pt-2">
          {project.github_url && (
            <a
              href={project.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-white/5"
            >
              GitHub →
            </a>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-3.5 py-1.5 text-xs font-medium text-background shadow-[0_0_0_1px_rgba(238,241,234,0.35)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(238,241,234,0.4)]"
            >
              Live site →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
