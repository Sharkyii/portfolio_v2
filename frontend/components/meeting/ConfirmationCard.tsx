import { Button } from "@/components/ui/Button";
import type { BookingResponse } from "@/lib/types";

export function ConfirmationCard({ booking }: { booking: BookingResponse }) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xl">
        ✓
      </div>
      <h3 className="text-xl font-semibold">You&apos;re booked</h3>
      <p className="text-sm text-muted">
        {booking.email_sent
          ? "A confirmation email is on its way."
          : "Confirmation email couldn't be sent, but the meeting is on the calendar."}
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        {booking.meet_link && (
          <Button href={booking.meet_link} variant="primary">
            Join Google Meet
          </Button>
        )}
        <Button href={booking.calendar_link} variant="ghost">
          View in Calendar
        </Button>
      </div>
    </div>
  );
}
