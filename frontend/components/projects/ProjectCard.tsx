"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Image from "next/image";
import { useRef } from "react";
import { Badge } from "@/components/ui/Badge";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

export function ProjectCard({ project, index, total }: ProjectCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const isLast = index === total - 1;
  const scale = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.92]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, isLast ? 1 : 0.5]);

  return (
    <div
      ref={ref}
      className="sticky flex min-h-screen items-center justify-center px-6"
      style={{ top: 0, zIndex: index }}
    >
      <motion.div
        style={{ scale, opacity }}
        className="grid w-full max-w-5xl grid-cols-1 overflow-hidden rounded-3xl border border-border bg-surface shadow-2xl shadow-black/40 md:grid-cols-2"
      >
        <div className="relative aspect-video bg-surface-raised md:aspect-auto">
          {project.image ? (
            <Image
              src={project.image}
              alt={project.title}
              fill
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted">
              {project.title}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-center gap-4 p-8">
          {project.category && (
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
              {project.category}
            </p>
          )}
          <h3 className="text-2xl font-semibold tracking-tight">{project.title}</h3>
          {project.summary && (
            <p className="text-sm leading-relaxed text-muted">{project.summary}</p>
          )}

          {project.stack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.stack.slice(0, 6).map((s) => (
                <Badge key={s}>{s}</Badge>
              ))}
            </div>
          )}

          <div className="mt-2 flex gap-3">
            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border px-4 py-2 text-sm hover:border-border-strong hover:bg-white/5"
              >
                GitHub →
              </a>
            )}
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm text-white"
              >
                Live site →
              </a>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
