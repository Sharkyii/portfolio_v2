"use client";

import { motion } from "motion/react";
import Link from "next/link";

const ITEMS = [
  { href: "/#projects", icon: "🧩", label: "Projects" },
  { href: "/#open-source", icon: "🌱", label: "Open Source" },
  { href: "/#experience", icon: "🧭", label: "Experience" },
  { href: "/#skills", icon: "🧠", label: "Skills" },
  { href: "/meet", icon: "📅", label: "Meet" },
];

const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export function QuickNav() {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="mt-6 flex flex-wrap justify-center gap-3"
    >
      {ITEMS.map((it) => (
        <motion.div key={it.href} variants={item}>
          <Link
            href={it.href}
            className="flex flex-col items-center gap-1.5 rounded-2xl border border-border bg-surface px-5 py-3 text-xs text-muted transition-colors hover:border-accent-2 hover:text-foreground"
          >
            <span className="text-xl">{it.icon}</span>
            {it.label}
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}
