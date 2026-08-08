"""One-time local script to obtain a Google OAuth refresh token for the
meeting-booking feature. Not part of the deployed app — run it once on your
own machine, then copy the printed refresh token into the deployment's
GOOGLE_REFRESH_TOKEN env var.

Setup:
  1. In Google Cloud Console, create an OAuth 2.0 Client ID (type: Desktop app).
  2. pip install google-auth-oauthlib (not in requirements.txt; local-only dependency).
  3. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in tools/meeting_book/.env.
  4. Run: python tools/meeting_book/google_auth_setup.py
  5. Approve access in the browser window that opens.
"""
import os

from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/calendar.events"]


def main() -> None:
    client_id = os.environ["GOOGLE_CLIENT_ID"]
    client_secret = os.environ["GOOGLE_CLIENT_SECRET"]

    client_config = {
        "installed": {
            "client_id": client_id,
            "client_secret": client_secret,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    }

    flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
    credentials = flow.run_local_server(port=0)

    print("\nAdd this to your deployment env as GOOGLE_REFRESH_TOKEN:\n")
    print(credentials.refresh_token)


if __name__ == "__main__":
    main()
