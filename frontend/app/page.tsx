import { ChatHero } from "@/components/chat/ChatHero";
import { ClosingCta } from "@/components/layout/ClosingCta";
import { OpenSourceSection } from "@/components/opensource/OpenSourceSection";
import { ProfileSection } from "@/components/profile/ProfileSection";
import { ProjectsSection } from "@/components/projects/ProjectsSection";

export default function Home() {
  return (
    <main className="relative flex-1">
      <ChatHero />
      <ProjectsSection />
      <OpenSourceSection />
      <ProfileSection />
      <ClosingCta />
    </main>
  );
}
