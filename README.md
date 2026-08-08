# Portfolio backend

FastAPI backend, deployed on Vercel via its Python runtime. No database —
Google Calendar is the source of truth for meeting bookings, and project
data is parsed live from `tools/projects/**/README.md` on each cold start.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/bio` | Generates a sonnet-style bio grounded in the project list |
| POST | `/api/ask` | RAG Q&A over the project READMEs (TF-IDF retrieval + Claude) |
| GET | `/api/projects` | Parsed project metadata (title, summary, stack, image, github link) |
| GET | `/api/projects/{id}/image/{filename}` | Serves a project's cover image |
| GET | `/api/opensource` | Merged PRs, total stars, top languages, contribution calendar |
| POST | `/api/meetings` | Books a Meet-enabled calendar event + sends a confirmation email |
| POST | `/api/meetings/schedule` | Same, but parsed from a free-text message via Claude tool use |
| GET | `/api/meetings/availability` | Checks whether a time range is free |
| GET | `/api/resume` | Serves `tools/resume/resume.pdf` |
| GET | `/api/health` | Liveness check |

`/api/opensource`'s `contribution_calendar` field is `null` until `GITHUB_TOKEN`
is set — it needs GraphQL, which requires auth even for public data.

`/api/meetings/schedule` takes `{name, email, message}` where `message` is
free text like *"next Wednesday at 3pm for 30 min to talk about Cascade"*.
Claude resolves relative dates against the current server time and extracts
start time / duration / topic via tool use; if the message is too ambiguous
it returns `{booked: false, clarification_question: "..."}` instead of
guessing.

Every integration degrades gracefully: an unconfigured feature returns
`503` instead of crashing the app, so you can deploy incrementally.

## Local dev

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in whichever keys you're ready to use
uvicorn app.main:app --reload
```

Interactive API docs at `http://localhost:8000/docs`.

## Adding a project

Any directory under `tools/projects/` with a `README.md` becomes a project
automatically. See `tools/projects/README.md` for the image-file convention.

## Deploying to Vercel

```bash
npx vercel
```

`vercel.json` routes all `/api/*` traffic to `api/index.py`, which exports
the FastAPI app for Vercel's Python runtime. Set the env vars from
`.env.example` in the Vercel project settings — nothing reads from a local
`.env` file in production.

## Meeting booking setup (optional)

1. Create an OAuth 2.0 Client ID (Desktop app) in Google Cloud Console.
2. `pip install google-auth-oauthlib` locally (not a deploy dependency).
3. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `tools/meeting_book/.env`.
4. Run `python tools/meeting_book/google_auth_setup.py` once and approve access.
5. Copy the printed refresh token into `GOOGLE_REFRESH_TOKEN` in your Vercel env vars.
6. For email confirmations, set `SMTP_EMAIL` + `SMTP_APP_PASSWORD` (an
   [App Password](https://myaccount.google.com/apppasswords), not your real
   account password).
