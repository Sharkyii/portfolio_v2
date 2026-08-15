"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

/** Vertical scroll drives horizontal motion: the pinned track measures how
 * far the card row overflows the viewport, then maps scroll progress through
 * a tall spacer directly onto that distance — so scrolling down slides the
 * cards left, revealing new ones from the right. */
export function HorizontalScrollGallery({ projects }: { projects: Project[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [pinHeight, setPinHeight] = useState<number | null>(null);

  useEffect(() => {
    function measure() {
      if (!rowRef.current) return;
      const distance = Math.max(rowRef.current.scrollWidth - window.innerWidth, 0);
      setTravel(distance);
      setPinHeight(window.innerHeight + distance);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [projects]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], [0, -travel]);

  return (
    <div
      ref={containerRef}
      style={{ height: pinHeight ? `${pinHeight}px` : "100vh" }}
      className="relative"
    >
      <div className="sticky top-0 flex h-screen items-center overflow-hidden">
        <motion.div ref={rowRef} style={{ x }} className="flex gap-6 px-6 sm:px-12">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              project={project}
              index={index}
              total={projects.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
