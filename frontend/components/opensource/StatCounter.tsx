"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

export function StatCounter({ value, label }: { value: number; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [isInView, value]);

  return (
    <div ref={ref} className="text-center">
      <span className="gradient-text text-5xl font-bold tabular-nums">{display}</span>
      <p className="mt-2 text-sm text-muted">{label}</p>
    </div>
  );
}
