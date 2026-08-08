"""Turns a natural-language scheduling request ("next Wednesday at 3pm for
30 min to talk about Cascade") into structured fields the existing
book_meeting() flow already knows how to handle — reuses its calendar
free/busy check and confirmation email rather than duplicating that logic.
"""
from dataclasses import dataclass
from datetime import datetime

from app.services.bio import MODEL, BioGenerationError, _client

_PROPOSE_MEETING_TOOL = {
    "name": "propose_meeting",
    "description": "Extract a concrete meeting time, duration, and topic from the user's message.",
    "input_schema": {
        "type": "object",
        "properties": {
            "needs_clarification": {
                "type": "boolean",
                "description": "True if the message is too ambiguous to pin down a concrete date/time.",
            },
            "clarification_question": {
                "type": "string",
                "description": "If needs_clarification is true, a short question to ask the user.",
            },
            "start_iso": {
                "type": "string",
                "description": (
                    "Meeting start as an ISO 8601 datetime with UTC offset, e.g. "
                    "2026-08-12T15:00:00+00:00. Resolve relative dates ('next Wednesday', "
                    "'tomorrow') against the current date given below. Assume UTC if no "
                    "timezone is stated."
                ),
            },
            "duration_minutes": {
                "type": "integer",
                "description": "Meeting length in minutes; default to 30 if unspecified.",
            },
            "topic": {
                "type": "string",
                "description": "A short topic for the meeting, inferred from context if not stated.",
            },
        },
        "required": ["needs_clarification"],
    },
}


class SchedulingError(RuntimeError):
    pass


@dataclass
class ParsedMeetingRequest:
    needs_clarification: bool
    clarification_question: str | None = None
    start: datetime | None = None
    duration_minutes: int | None = None
    topic: str | None = None


def parse_meeting_request(message: str, now: datetime) -> ParsedMeetingRequest:
    try:
        client = _client()
    except BioGenerationError as exc:
        raise SchedulingError(str(exc)) from exc

    response = client.messages.create(
        model=MODEL,
        max_tokens=400,
        system=f"The current date and time is {now.isoformat()} (UTC).",
        tools=[_PROPOSE_MEETING_TOOL],
        tool_choice={"type": "tool", "name": "propose_meeting"},
        messages=[{"role": "user", "content": message}],
    )

    tool_use = next((block for block in response.content if block.type == "tool_use"), None)
    if tool_use is None:
        raise SchedulingError("Model did not return a structured scheduling response")

    data = tool_use.input

    if data.get("needs_clarification") or not data.get("start_iso"):
        return ParsedMeetingRequest(
            needs_clarification=True,
            clarification_question=data.get("clarification_question")
            or "Could you clarify when you'd like to meet?",
        )

    try:
        start = datetime.fromisoformat(data["start_iso"])
    except ValueError as exc:
        raise SchedulingError(f"Model returned an unparseable time: {data['start_iso']!r}") from exc

    return ParsedMeetingRequest(
        needs_clarification=False,
        start=start,
        duration_minutes=data.get("duration_minutes") or 30,
        topic=data.get("topic") or "Meeting",
    )
