"use client";

import Link from "next/link";
import { useState } from "react";
import { BookingForm } from "@/components/meeting/BookingForm";
import { ConfirmationCard } from "@/components/meeting/ConfirmationCard";
import { DatePicker } from "@/components/meeting/DatePicker";
import { NLScheduler } from "@/components/meeting/NLScheduler";
import { TimePicker } from "@/components/meeting/TimePicker";
import { TimezoneSelect } from "@/components/meeting/TimezoneSelect";
import { Card } from "@/components/ui/Card";
import { Glow } from "@/components/ui/Glow";
import { cn } from "@/lib/cn";
import { resolveTimeZone } from "@/lib/timezone";
import type { BookingResponse } from "@/lib/types";

type Mode = "pick" | "nl";

export default function MeetPage() {
  const [mode, setMode] = useState<Mode>("pick");
  const [timeZoneId, setTimeZoneId] = useState("auto");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [duration, setDuration] = useState(30);
  const [booking, setBooking] = useState<BookingResponse | null>(null);
  const [slotTaken, setSlotTaken] = useState(false);

  const timeZone = resolveTimeZone(timeZoneId);

  function handleTimezoneChange(id: string) {
    setTimeZoneId(id);
    setSelectedSlot(null);
    setSlotTaken(false);
  }

  function handleSelectDate(date: Date) {
    setSelectedDate(date);
    setSelectedSlot(null);
    setSlotTaken(false);
  }

  function handleSelectSlot(slot: Date | null) {
    setSelectedSlot(slot);
    setSlotTaken(false);
  }

  return (
    <main className="relative flex-1 px-6 py-24">
      <Glow className="left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2" />

      <div className="relative mx-auto max-w-3xl">
        <Link href="/" className="mb-8 inline-block text-sm text-muted hover:text-foreground">
          ← Back
        </Link>

        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-accent-2">
            Schedule
          </p>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Book a meeting
          </h1>
        </div>

        <div className="mb-8 flex justify-center gap-2">
          <button
            onClick={() => setMode("pick")}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              mode === "pick" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
            )}
          >
            Pick a slot
          </button>
          <button
            onClick={() => setMode("nl")}
            className={cn(
              "rounded-full px-4 py-2 text-sm transition-colors",
              mode === "nl" ? "bg-white/10 text-foreground" : "text-muted hover:text-foreground"
            )}
          >
            Just tell me when
          </button>
        </div>

        <Card className="p-6 sm:p-8">
          {mode === "nl" ? (
            <NLScheduler />
          ) : booking ? (
            <ConfirmationCard booking={booking} />
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted">Pick a date</p>
                <TimezoneSelect value={timeZoneId} onChange={handleTimezoneChange} />
              </div>
              <DatePicker selected={selectedDate} onSelect={handleSelectDate} />

              {selectedDate && (
                <TimePicker
                  date={selectedDate}
                  timeZone={timeZone}
                  selected={selectedSlot}
                  onSelect={handleSelectSlot}
                />
              )}

              {slotTaken && (
                <p className="text-sm text-red-400">
                  That slot was just taken — pick another time.
                </p>
              )}

              {selectedSlot && !slotTaken && (
                <BookingForm
                  slot={selectedSlot}
                  timeZone={timeZone}
                  duration={duration}
                  onDurationChange={setDuration}
                  onSuccess={setBooking}
                  onSlotTaken={() => {
                    setSlotTaken(true);
                    setSelectedSlot(null);
                  }}
                />
              )}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
