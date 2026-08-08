"""Google Calendar integration via plain REST calls (no google-api-python-client,
to keep the Vercel function bundle small).

Requires a one-time OAuth consent flow to obtain a refresh token — a personal
Gmail account can create Meet-enabled events via OAuth, but not via a bare
service account (that needs Workspace domain-wide delegation). Run
tools/meeting_book/google_auth_setup.py locally once to obtain
GOOGLE_REFRESH_TOKEN, then set it as an env var for the deployed app.
"""
import time
import uuid
from dataclasses import dataclass

import httpx

from app.config import get_settings

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_CALENDAR_API = "https://www.googleapis.com/calendar/v3"

_token_cache: dict[str, tuple[float, str]] = {}


class CalendarNotConfiguredError(RuntimeError):
    pass


class CalendarError(RuntimeError):
    pass


@dataclass
class MeetingEvent:
    id: str
    html_link: str
    meet_link: str | None


def _get_access_token() -> str:
    settings = get_settings()
    if not (settings.google_client_id and settings.google_client_secret and settings.google_refresh_token):
        raise CalendarNotConfiguredError(
            "Google Calendar isn't configured (missing GOOGLE_CLIENT_ID / "
            "GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN)"
        )

    cached = _token_cache.get("access_token")
    if cached and time.monotonic() < cached[0]:
        return cached[1]

    response = httpx.post(
        _TOKEN_URL,
        data={
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "refresh_token": settings.google_refresh_token,
            "grant_type": "refresh_token",
        },
        timeout=10.0,
    )
    if response.status_code != 200:
        raise CalendarError(f"Failed to refresh Google access token: {response.text}")

    data = response.json()
    expires_at = time.monotonic() + data.get("expires_in", 3600) - 60
    _token_cache["access_token"] = (expires_at, data["access_token"])
    return data["access_token"]


def is_slot_free(start_iso: str, end_iso: str) -> bool:
    settings = get_settings()
    token = _get_access_token()
    response = httpx.post(
        f"{_CALENDAR_API}/freeBusy",
        headers={"Authorization": f"Bearer {token}"},
        json={"timeMin": start_iso, "timeMax": end_iso, "items": [{"id": settings.google_calendar_id}]},
        timeout=10.0,
    )
    if response.status_code != 200:
        raise CalendarError(f"freeBusy check failed: {response.text}")

    busy_slots = response.json()["calendars"][settings.google_calendar_id]["busy"]
    return len(busy_slots) == 0


def create_meeting_event(
    summary: str, description: str, start_iso: str, end_iso: str, attendee_email: str
) -> MeetingEvent:
    settings = get_settings()
    token = _get_access_token()

    body = {
        "summary": summary,
        "description": description,
        "start": {"dateTime": start_iso},
        "end": {"dateTime": end_iso},
        "attendees": [{"email": attendee_email}],
        "conferenceData": {
            "createRequest": {
                "requestId": str(uuid.uuid4()),
                "conferenceSolutionKey": {"type": "hangoutsMeet"},
            }
        },
    }

    response = httpx.post(
        f"{_CALENDAR_API}/calendars/{settings.google_calendar_id}/events",
        params={"conferenceDataVersion": 1, "sendUpdates": "all"},
        headers={"Authorization": f"Bearer {token}"},
        json=body,
        timeout=10.0,
    )
    if response.status_code not in (200, 201):
        raise CalendarError(f"Failed to create calendar event: {response.text}")

    data = response.json()
    meet_link = None
    for entry_point in data.get("conferenceData", {}).get("entryPoints", []):
        if entry_point.get("entryPointType") == "video":
            meet_link = entry_point.get("uri")
            break

    return MeetingEvent(id=data["id"], html_link=data["htmlLink"], meet_link=meet_link)
