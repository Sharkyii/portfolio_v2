import Link from "next/link";
import { CommandPaletteTrigger } from "@/components/command/CommandPaletteTrigger";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { LastActiveBadge } from "./LastActiveBadge";

const LINKS = [
  { href: "/#projects", label: "Projects" },
  { href: "/#open-source", label: "Open Source" },
  { href: "/#experience", label: "Experience" },
  { href: "/#skills", label: "Skills" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm font-semibold tracking-tight">
            Sneh Kansagara
          </Link>
          <LastActiveBadge />
        </div>

        <nav className="hidden gap-6 text-sm text-muted sm:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CommandPaletteTrigger />
          <a href={api.resumeUrl} className="text-sm text-muted hover:text-foreground">
            Resume
          </a>
          <Button href="/meet" className="!px-4 !py-2 text-xs">
            Book a meeting
          </Button>
        </div>
      </div>
    </header>
  );
}
