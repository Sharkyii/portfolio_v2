import { Card } from "@/components/ui/Card";
import type { ProfileAchievement } from "@/lib/types";

export function AchievementGrid({ achievements }: { achievements: ProfileAchievement[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {achievements.map((a, i) => (
        <Card key={i} className="p-5 transition-colors hover:border-border-strong">
          <p className="font-medium">{a.title}</p>
          {a.detail && <p className="mt-1 text-sm text-muted">{a.detail}</p>}
        </Card>
      ))}
    </div>
  );
}
