import type { ReactNode, SVGProps } from "react";

// Hand-drawn icons for skills that are concepts/techniques, not products —
// there's no real logo to fetch for "RAG" or "AutoML" the way there is for
// Python or Docker. Kept to one consistent style (24x24, stroke-based,
// rounded joins) so a custom icon sits next to a real logo without looking
// like a mismatched afterthought.
const ICON_PATHS: Record<string, ReactNode> = {
  SQL: (
    <>
      <ellipse cx="12" cy="5" rx="7" ry="3" />
      <path d="M5 5v6c0 1.66 3.13 3 7 3s7-1.34 7-3V5" />
      <path d="M5 11v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6" />
    </>
  ),
  "Deep Learning": (
    <>
      <circle cx="4" cy="7" r="1.4" />
      <circle cx="4" cy="17" r="1.4" />
      <circle cx="12" cy="4" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="12" cy="20" r="1.4" />
      <circle cx="20" cy="9" r="1.4" />
      <circle cx="20" cy="15" r="1.4" />
      <path d="M5.3 7 10.7 4.6M5.3 7 10.7 11.3M5.3 17 10.7 12.7M5.3 17 10.7 19.4M13.3 4.6 18.7 8.6M13.3 12 18.7 9.3M13.3 12 18.7 14.7M13.3 20 18.7 15.4" />
    </>
  ),
  LLMs: (
    <>
      <path d="M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-6l-4 4v-4H6a2 2 0 0 1-2-2z" />
      <path d="M18.5 13.5 19.3 15.2 21 16 19.3 16.8 18.5 18.5 17.7 16.8 16 16 17.7 15.2z" />
    </>
  ),
  NLP: (
    <>
      <path d="M4 6h16" />
      <path d="M4 12h10" />
      <path d="M4 18h13" />
    </>
  ),
  RAG: (
    <>
      <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
      <circle cx="10" cy="14" r="3" />
      <path d="M12.2 16.2 15 19" />
    </>
  ),
  "Reinforcement Learning": (
    <>
      <path d="M4 12a8 8 0 0 1 14.5-4.6" />
      <path d="M19 3v5h-5" />
      <path d="M20 12a8 8 0 0 1-14.5 4.6" />
      <path d="M5 21v-5h5" />
    </>
  ),
  GNNs: (
    <>
      <circle cx="6" cy="6" r="1.5" />
      <circle cx="18" cy="6" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="6" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
      <path d="M6 6 12 12M18 6 12 12M6 18 12 12M18 18 12 12M6 6 6 18M18 6 18 18" />
    </>
  ),
  AutoML: (
    <>
      <path d="M4 16a8 8 0 0 1 16 0" />
      <path d="M12 16 16.2 10.4" />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
      <path d="M4 16h1.5M18.5 16H20M6.3 9.3l1 1M17.7 9.3l-1 1" />
    </>
  ),
  NAS: (
    <>
      <circle cx="12" cy="4" r="1.4" />
      <circle cx="6" cy="12" r="1.4" />
      <circle cx="12" cy="12" r="1.4" />
      <circle cx="18" cy="12" r="1.4" />
      <circle cx="4" cy="20" r="1.2" />
      <circle cx="8" cy="20" r="1.2" />
      <circle cx="16" cy="20" r="1.2" />
      <circle cx="20" cy="20" r="1.2" />
      <path d="M12 5.4v3.2M12 8.6 6 10.8M12 8.6 12 10.8M12 8.6 18 10.8M6 13.4 4 18.8M6 13.4 8 18.8M18 13.4 16 18.8M18 13.4 20 18.8" />
    </>
  ),
  "CI/CD": (
    <>
      <circle cx="8" cy="12" r="5" />
      <circle cx="16" cy="12" r="5" />
    </>
  ),
  "Tavily API": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" fill="currentColor" stroke="none" />
    </>
  ),
};

export function hasConceptIcon(skill: string): boolean {
  return skill in ICON_PATHS;
}

export function ConceptIcon({ skill, ...props }: { skill: string } & SVGProps<SVGSVGElement>) {
  const paths = ICON_PATHS[skill];
  if (!paths) return null;

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths}
    </svg>
  );
}
