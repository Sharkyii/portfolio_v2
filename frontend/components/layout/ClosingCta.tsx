import { Button } from "@/components/ui/Button";
import { Glow } from "@/components/ui/Glow";
import { api } from "@/lib/api";

export function ClosingCta() {
  return (
    <section className="relative mx-auto max-w-4xl px-6 py-32 text-center sm:px-8">
      <Glow className="left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2" />
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Let&apos;s <span className="gradient-text">talk</span>
      </h2>
      <p className="mx-auto mt-4 max-w-md text-muted">
        Grab the full resume, or skip straight to booking time on my calendar.
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button href="/meet" variant="primary">
          Book a meeting
        </Button>
        <Button href={api.resumeUrl} variant="ghost">
          Download resume
        </Button>
      </div>
    </section>
  );
}
