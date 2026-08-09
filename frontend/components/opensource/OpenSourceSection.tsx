"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { ContributionHeatmap } from "./ContributionHeatmap";
import { LanguageBars } from "./LanguageBars";
import { PRMarquee } from "./PRMarquee";
import { StatCounter } from "./StatCounter";

export function OpenSourceSection() {
  const state = useFetch(api.opensource);

  return (
    <section id="open-source" className="relative mx-auto max-w-6xl px-6 py-24 sm:px-8">
      <div className="mb-12 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
          Open Source
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Contributing back
        </h2>
      </div>

      {state.status === "loading" && <p className="text-muted">Loading GitHub stats...</p>}
      {state.status === "error" && (
        <p className="text-muted">Couldn&apos;t load GitHub stats: {state.error}</p>
      )}

      {state.status === "ready" && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
            <StatCounter value={state.data.merged_pr_count} label="Merged PRs" />
            <StatCounter value={state.data.total_stars} label="Stars earned" />
            <StatCounter value={state.data.top_languages.length} label="Languages used" />
          </div>

          {state.data.contribution_calendar && (
            <Card className="overflow-x-auto p-6">
              <p className="mb-4 text-sm text-muted">Contribution activity</p>
              <ContributionHeatmap days={state.data.contribution_calendar} />
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="p-6">
              <p className="mb-4 text-sm text-muted">Top languages</p>
              <LanguageBars languages={state.data.top_languages} />
            </Card>

            <Card className="flex flex-col justify-center p-6">
              <p className="mb-4 text-sm text-muted">Recent merged PRs</p>
              <PRMarquee prs={state.data.recent_prs} />
            </Card>
          </div>
        </div>
      )}
    </section>
  );
}
