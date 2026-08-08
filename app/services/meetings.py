"""Orchestrates meeting booking: checks the calendar for conflicts, creates a
Meet-enabled event, and emails a confirmation.

Deliberately holds no booking state of its own — Vercel's serverless
filesystem is read-only/ephemeral per invocation, so a local file or SQLite
DB wouldn't survive between requests. Google Calendar is the single source
of truth for "is this slot taken."
"""
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from app.services import calendar
from tools.meeting_book.meeting_book import EmailNotConfiguredError, send_confirmation_email


class SlotUnavailableError(RuntimeError):
    pass


@dataclass
class BookingResult:
    event_id: str
    calendar_link: str
    meet_link: str | None
    email_sent: bool


def book_meeting(
    name: str,
    email: str,
    start: datetime,
    duration_minutes: int,
    topic: str,
) -> BookingResult:
    if start.tzinfo is None:
        start = start.replace(tzinfo=timezone.utc)
    end = start + timedelta(minutes=duration_minutes)
    start_iso, end_iso = start.isoformat(), end.isoformat()

    if not calendar.is_slot_free(start_iso, end_iso):
        raise SlotUnavailableError("That time slot is already booked")

    event = calendar.create_meeting_event(
        summary=f"Meeting with {name}: {topic}",
        description=f"Booked via portfolio site.\nRequested by: {name} <{email}>\nTopic: {topic}",
        start_iso=start_iso,
        end_iso=end_iso,
        attendee_email=email,
    )

    email_sent = True
    try:
        body = f"Your meeting is confirmed for {start.isoformat()}.\n"
        if event.meet_link:
            body += f"Google Meet link: {event.meet_link}\n"
        body += f"Calendar event: {event.html_link}"
        send_confirmation_email(email, "Meeting confirmed", body)
    except EmailNotConfiguredError:
        email_sent = False

    return BookingResult(
        event_id=event.id,
        calendar_link=event.html_link,
        meet_link=event.meet_link,
        email_sent=email_sent,
    )
