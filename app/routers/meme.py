import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

_IMAGE_PATH = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "..", "tools", "image.png"))

router = APIRouter(prefix="/api/meme", tags=["meme"])


@router.get("")
def get_meme():
    if not os.path.isfile(_IMAGE_PATH):
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(_IMAGE_PATH, media_type="image/png")
