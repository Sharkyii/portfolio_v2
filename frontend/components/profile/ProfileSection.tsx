"use client";

import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { useFetch } from "@/lib/useFetch";
import { AchievementGrid } from "./AchievementGrid";
import { ExperienceTimeline } from "./ExperienceTimeline";
import { SkillCloud } from "./SkillCloud";

export function ProfileSection() {
  const state = useFetch(api.profile);

  if (state.status === "loading") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
        <p className="text-muted">Loading profile...</p>
      </section>
    );
  }
  if (state.status === "error") {
    return (
      <section className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
        <p className="text-muted">Couldn&apos;t load profile: {state.error}</p>
      </section>
    );
  }

  const { experience, research, achievements, leadership, skills, education } = state.data;

  return (
    <>
      <section id="experience" className="mx-auto max-w-4xl px-6 py-24 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
            Experience &amp; Research
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Where I&apos;ve been</h2>
        </div>
        <ExperienceTimeline experience={experience} research={research} />
      </section>

      <section id="achievements" className="mx-auto max-w-6xl px-6 py-24 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
            Achievements
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Hackathons &amp; more</h2>
        </div>
        <AchievementGrid achievements={[...achievements, ...leadership]} />
      </section>

      <section id="skills" className="mx-auto max-w-4xl px-6 py-24 sm:px-8">
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
            Skills &amp; Education
          </p>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Toolbox</h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="p-6">
            <SkillCloud skills={skills} />
          </Card>
          <Card className="p-6">
            {education.map((e, i) => (
              <div key={i}>
                <p className="font-medium">{e.institution}</p>
                <p className="text-sm text-muted">{e.credential}</p>
                <p className="mt-1 text-xs text-muted">
                  {e.start} — {e.end}
                </p>
                {e.detail && <p className="mt-2 text-sm text-foreground/80">{e.detail}</p>}
              </div>
            ))}
          </Card>
        </div>
      </section>
    </>
  );
}
