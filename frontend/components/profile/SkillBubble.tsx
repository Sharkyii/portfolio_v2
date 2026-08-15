"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { getSkillIcon } from "@/lib/skillIcons";
import { cn } from "@/lib/cn";
import { ConceptIcon, hasConceptIcon } from "./icons/ConceptIcon";

export function SkillBubble({ skill }: { skill: string }) {
  const icon = getSkillIcon(skill);
  const [failed, setFailed] = useState(false);
  const showRealIcon = icon && !failed;
  const showConceptIcon = !showRealIcon && hasConceptIcon(skill);

  return (
    <motion.div
      whileHover={{ scale: 1.15, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      className="group relative flex flex-col items-center gap-2"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full border border-border bg-surface p-3.5 transition-shadow duration-200 group-hover:border-accent-2 group-hover:shadow-[0_0_20px_rgba(238,241,234,0.4)]">
        {showRealIcon ? (
          // eslint-disable-next-line @next/next/no-img-element -- external, dynamic icon set; next/image optimization adds no value here
          <img
            src={icon.url}
            alt={skill}
            className={cn("h-full w-full object-contain", icon.invert && "invert")}
            onError={() => setFailed(true)}
          />
        ) : showConceptIcon ? (
          <ConceptIcon skill={skill} className="h-full w-full text-foreground" />
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
