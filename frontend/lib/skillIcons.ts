// Maps skill names (from tools/resume/profile.json) to a real, verified icon
// where one exists. Every URL below was checked against its CDN before being
// added — a wrong slug means a broken image.
//
// Two sources:
//  - Devicon (github.com/devicon/devicon, MIT) — "original" variants ship
//    their own brand colors, rendered as-is.
//  - Simple Icons (github.com/simple-icons/simple-icons, CC0) — broader
//    coverage of newer/smaller tools, but each SVG is a single black path
//    with no fill set. Rendered via <img>, that reads as invisible on a dark
//    card, so `invert: true` marks these for a CSS invert filter in
//    SkillBubble to turn them white.
const DEVICON_SLUGS: Record<string, string> = {
  Python: "python",
  "C++": "cplusplus",
  Java: "java",
  Kotlin: "kotlin",
  Go: "go",
  PyTorch: "pytorch",
  Kubeflow: "kubeflow",
  Kafka: "apachekafka",
  Redis: "redis",
  Neo4j: "neo4j",
  pgvector: "postgresql",
  Docker: "docker",
};

const SIMPLE_ICON_SLUGS: Record<string, string> = {
  DVC: "dvc",
  Qdrant: "qdrant",
  LangGraph: "langgraph",
  Optuna: "optuna",
  n8n: "n8n",
};

export interface SkillIcon {
  url: string;
  invert: boolean;
}

export function getSkillIcon(skill: string): SkillIcon | null {
  const deviconSlug = DEVICON_SLUGS[skill];
  if (deviconSlug) {
    return {
      url: `https://cdn.jsdelivr.net/npm/devicon@latest/icons/${deviconSlug}/${deviconSlug}-original.svg`,
      invert: false,
    };
  }

  const simpleSlug = SIMPLE_ICON_SLUGS[skill];
  if (simpleSlug) {
    return {
      url: `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${simpleSlug}.svg`,
      invert: true,
    };
  }

  return null;
}
