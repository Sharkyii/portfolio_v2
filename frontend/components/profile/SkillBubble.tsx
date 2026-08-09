"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { getSkillIconUrl } from "@/lib/skillIcons";

export function SkillBubble({ skill }: { skill: string }) {
  const iconUrl = getSkillIconUrl(skill);
  const [failed, setFailed] = useState(false);
  const showIcon = iconUrl && !failed;

  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="group relative flex flex-col items-center gap-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface p-3.5 transition-shadow duration-200 group-hover:border-accent-2 group-hover:shadow-[0_0_20px_rgba(192,132,252,0.45)]">
        {showIcon ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, dynamic icon set; next/image optimization adds no value here
          <img
            src={iconUrl}
            alt={skill}
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          />
        ) : (
          <span className="text-lg font-semibold text-accent-2">
            {skill.slice(0, 2).toUpperCase()}
          </span>
        )}
      </div>
      <span className="pointer-events-none absolute -bottom-6 whitespace-nowrap rounded-md bg-surface-raised px-2 py-1 text-[11px] text-muted opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100">
        {skill}
      </span>
    </motion.div>
  );
}
