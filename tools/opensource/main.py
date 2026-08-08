# Implementation moved to app/services/opensource.py so it can be served via
# GET /api/opensource. Kept here as a pointer since this directory is where
# the feature was originally scoped.
from app.services.opensource import get_github_stats  # noqa: F401
