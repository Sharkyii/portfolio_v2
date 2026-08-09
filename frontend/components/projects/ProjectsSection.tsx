"use client";

import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { HorizontalScrollGallery } from "./HorizontalScrollGallery";

export function ProjectsSection() {
  const state = useFetch(api.projects);

  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto mb-16 max-w-2xl px-6 text-center">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
          Projects
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Things I&apos;ve built
        </h2>
        <p className="mt-3 text-sm text-muted">Keep scrolling — it moves sideways from here.</p>
      </div>

      {state.status === "loading" && (
        <p className="text-center text-muted">Loading projects...</p>
      )}
      {state.status === "error" && (
        <p className="text-center text-muted">Couldn&apos;t load projects: {state.error}</p>
      )}
      {state.status === "ready" && <HorizontalScrollGallery projects={state.data} />}
    </section>
  );
}
