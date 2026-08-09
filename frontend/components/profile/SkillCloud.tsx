import { Badge } from "@/components/ui/Badge";

export function SkillCloud({ skills }: { skills: Record<string, string[]> }) {
  return (
    <div className="space-y-5">
      {Object.entries(skills).map(([category, items]) => (
        <div key={category}>
          <p className="mb-2 text-sm text-muted">{category}</p>
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
