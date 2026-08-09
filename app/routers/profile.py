import json
import os

from fastapi import APIRouter, HTTPException

_PROFILE_PATH = os.path.normpath(
    os.path.join(os.path.dirname(__file__), "..", "..", "tools", "resume", "profile.json")
)

router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("")
def get_profile():
    if not os.path.isfile(_PROFILE_PATH):
        raise HTTPException(status_code=404, detail="Profile not configured yet")
    with open(_PROFILE_PATH, encoding="utf-8") as f:
        return json.load(f)
