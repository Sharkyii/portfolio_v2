import { cn } from "@/lib/cn";

interface GlowProps {
  className?: string;
}

/** Decorative radial-gradient blob. Purely visual — aria-hidden, absolutely positioned
 * by the caller via `className`. */
export function Glow({ className }: GlowProps) {
  return (
    <div
      aria-hidden
      className={cn("glow pointer-events-none absolute -z-10 blur-3xl", className ?? undefined)}
    />
  );
}
