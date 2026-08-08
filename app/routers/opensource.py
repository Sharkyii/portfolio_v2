from fastapi import APIRouter, HTTPException

from app.services.opensource import OpenSourceFetchError, get_github_stats

router = APIRouter(prefix="/api/opensource", tags=["opensource"])


@router.get("")
def get_opensource_stats():
    try:
        return get_github_stats()
    except OpenSourceFetchError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
