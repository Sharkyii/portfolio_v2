import { SkillBubble } from "./SkillBubble";

export function SkillCloud({ skills }: { skills: Record<string, string[]> }) {
  return (
    <div className="space-y-8">
      {Object.entries(skills).map(([category, items]) => (
        <div key={category}>
          <p className="mb-4 text-sm text-muted">{category}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-8">
            {items.map((item) => (
              <SkillBubble key={item} skill={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
