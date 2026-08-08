from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr, Field

from app.services import calendar
from app.services.calendar import CalendarError, CalendarNotConfiguredError
from app.services.meetings import SlotUnavailableError, book_meeting
from app.services.scheduling import SchedulingError, parse_meeting_request

router = APIRouter(prefix="/api/meetings", tags=["meetings"])


class BookingRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    start: datetime
    duration_minutes: int = Field(default=30, ge=15, le=120)
    topic: str = Field(min_length=1, max_length=500)


class BookingResponse(BaseModel):
    event_id: str
    calendar_link: str
    meet_link: str | None
    email_sent: bool


def _handle_calendar_errors(exc: Exception):
    if isinstance(exc, CalendarNotConfiguredError):
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    if isinstance(exc, CalendarError):
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.post("", response_model=BookingResponse)
def create_booking(request: BookingRequest) -> BookingResponse:
    try:
        result = book_meeting(
            name=request.name,
            email=request.email,
            start=request.start,
            duration_minutes=request.duration_minutes,
            topic=request.topic,
        )
    except SlotUnavailableError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (CalendarNotConfiguredError, CalendarError) as exc:
        _handle_calendar_errors(exc)
        raise
    return BookingResponse(
        event_id=result.event_id,
        calendar_link=result.calendar_link,
        meet_link=result.meet_link,
        email_sent=result.email_sent,
    )


@router.get("/availability")
def check_availability(start: datetime, end: datetime):
    try:
        free = calendar.is_slot_free(start.isoformat(), end.isoformat())
    except (CalendarNotConfiguredError, CalendarError) as exc:
        _handle_calendar_errors(exc)
        raise
    return {"free": free}


class ScheduleRequest(BaseModel):
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    message: str = Field(min_length=1, max_length=1000)


class ScheduleResponse(BaseModel):
    booked: bool
    clarification_question: str | None = None
    resolved_start: datetime | None = None
    resolved_topic: str | None = None
    event_id: str | None = None
    calendar_link: str | None = None
    meet_link: str | None = None
    email_sent: bool = False


@router.post("/schedule", response_model=ScheduleResponse)
def schedule_via_message(request: ScheduleRequest) -> ScheduleResponse:
    try:
        parsed = parse_meeting_request(request.message, now=datetime.now(timezone.utc))
    except SchedulingError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    if parsed.needs_clarification:
        return ScheduleResponse(booked=False, clarification_question=parsed.clarification_question)

    duration_minutes = max(15, min(120, parsed.duration_minutes or 30))

    try:
        result = book_meeting(
            name=request.name,
            email=request.email,
            start=parsed.start,
            duration_minutes=duration_minutes,
            topic=parsed.topic or "Meeting",
        )
    except SlotUnavailableError as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc
    except (CalendarNotConfiguredError, CalendarError) as exc:
        _handle_calendar_errors(exc)
        raise

    return ScheduleResponse(
        booked=True,
        resolved_start=parsed.start,
        resolved_topic=parsed.topic,
        event_id=result.event_id,
        calendar_link=result.calendar_link,
        meet_link=result.meet_link,
        email_sent=result.email_sent,
    )
