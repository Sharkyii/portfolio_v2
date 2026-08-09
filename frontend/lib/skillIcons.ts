// Maps skill names (from tools/resume/profile.json) to verified Devicon slugs
// (github.com/devicon/devicon, MIT licensed) — checked individually against
// the CDN before being added here, since a wrong slug means a broken image.
// Concepts without a real logo (RAG, NAS, AutoML, ...) are left unmapped on
// purpose; SkillBubble falls back to a monogram for those rather than
// guessing a misleading icon.
const SKILL_ICON_SLUGS: Record<string, string> = {
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

export function getSkillIconUrl(skill: string): string | null {
  const slug = SKILL_ICON_SLUGS[skill];
  if (!slug) return null;
  return `https://cdn.jsdelivr.net/npm/devicon@latest/icons/${slug}/${slug}-original.svg`;
}
