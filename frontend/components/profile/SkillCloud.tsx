import { Badge } from "@/components/ui/Badge";
import { getSkillIconUrl } from "@/lib/skillIcons";
import { SkillBubble } from "./SkillBubble";

/** Skills split into two lanes per category: real tools/languages get an icon
 * bubble (a genuine logo exists), concepts and techniques (RAG, NAS, AutoML,
 * ...) get a plain text badge instead of a guessed 2-letter monogram — a grid
 * that's half unreadable "DE" / "NL" / "RA" circles for things with no real
 * logo read as broken, not polished, in testing. */
export function SkillCloud({ skills }: { skills: Record<string, string[]> }) {
  return (
    <div className="space-y-8">
      {Object.entries(skills).map(([category, items]) => {
        const withIcon = items.filter((item) => getSkillIconUrl(item));
        const withoutIcon = items.filter((item) => !getSkillIconUrl(item));

        return (
          <div key={category}>
            <p className="mb-4 text-sm text-muted">{category}</p>

            {withIcon.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-x-4 gap-y-8">
                {withIcon.map((item) => (
                  <SkillBubble key={item} skill={item} />
                ))}
              </div>
            )}

            {withoutIcon.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {withoutIcon.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
