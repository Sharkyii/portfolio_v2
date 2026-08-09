import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

export function Section({
  eyebrow,
  title,
  description,
  children,
  className,
  ...props
}: SectionProps) {
  return (
    <section
      className={cn("relative mx-auto w-full max-w-6xl px-6 py-24 sm:px-8", className ?? undefined)}
      {...props}
    >
      {(eyebrow || title || description) && (
        <div className="mb-12 max-w-2xl">
          {eyebrow && (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          )}
          {description && <p className="mt-4 text-muted">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
