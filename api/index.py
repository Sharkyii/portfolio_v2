"""Vercel Python runtime entrypoint. Vercel auto-detects the `app` ASGI
callable exported here; vercel.json rewrites all /api/* traffic to this file.
"""
from app.main import app  # noqa: F401
