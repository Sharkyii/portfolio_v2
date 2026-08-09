import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "default" | "onImage";

const variants: Record<Variant, string> = {
  default: "border-border text-muted",
  // For use over a photo/image background instead of the flat surface color.
  onImage: "border-white/15 text-white/80",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
}

export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs",
        variants[variant],
        className ?? undefined
      )}
      {...props}
    />
  );
}
