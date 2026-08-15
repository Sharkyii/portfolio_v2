"use client";

import { api } from "@/lib/api";
import { formatRelativeTime } from "@/lib/relativeTime";
import { useFetch } from "@/lib/useFetch";

/** Surfaces real GitHub activity next to the name — the point isn't the
 * exact timestamp, it's that this whole site is backed by a live system
 * pulling real data, not a static page with hardcoded content. */
export function LastActiveBadge() {
  const state = useFetch(api.opensource);

  if (state.status !== "ready" || !state.data.last_active_at) return null;

  return (
    <span className="hidden items-center gap-1.5 text-xs text-muted md:inline-flex">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground/50" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-foreground/70" />
      </span>
      last commit {formatRelativeTime(state.data.last_active_at)}
    </span>
  );
}
