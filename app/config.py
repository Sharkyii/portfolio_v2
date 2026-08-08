"""Central settings, all sourced from environment variables.

Every integration is optional at import time so the app boots even if a given
feature's credentials aren't configured yet — the relevant endpoint returns a
503 instead of crashing the whole process.
"""
import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


class Settings:
    # Anthropic (bio/sonnet generation)
    anthropic_api_key: str | None = os.environ.get("ANTHROPIC_API_KEY")

    # GitHub (open-source PR dashboard)
    github_token: str | None = os.environ.get("GITHUB_TOKEN")
    github_username: str = os.environ.get("GITHUB_USERNAME", "Sharkyii")

    # Google Calendar / Meet (meeting booking)
    google_client_id: str | None = os.environ.get("GOOGLE_CLIENT_ID")
    google_client_secret: str | None = os.environ.get("GOOGLE_CLIENT_SECRET")
    google_refresh_token: str | None = os.environ.get("GOOGLE_REFRESH_TOKEN")
    google_calendar_id: str = os.environ.get("GOOGLE_CALENDAR_ID", "primary")

    # Outbound email confirmations
    smtp_email: str | None = os.environ.get("SMTP_EMAIL")
    smtp_app_password: str | None = os.environ.get("SMTP_APP_PASSWORD")

    # Resume file
    resume_path: str = os.environ.get(
        "RESUME_PATH", os.path.join(os.path.dirname(__file__), "..", "tools", "resume", "resume.pdf")
    )

    # CORS
    allowed_origins: list[str] = [
        origin.strip()
        for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if origin.strip()
    ]

    projects_dir: str = os.path.join(os.path.dirname(__file__), "..", "tools", "projects")


@lru_cache
def get_settings() -> Settings:
    return Settings()
