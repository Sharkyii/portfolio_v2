import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.services.projects import get_project_image_path, list_projects

router = APIRouter(prefix="/api/projects", tags=["projects"])

_MEDIA_TYPES = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
}


@router.get("")
def get_projects():
    return list_projects()


@router.get("/{project_id}/image/{filename}")
def get_project_image(project_id: str, filename: str):
    path = get_project_image_path(project_id, filename)
    if not path:
        raise HTTPException(status_code=404, detail="Image not found")
    media_type = _MEDIA_TYPES.get(os.path.splitext(path)[1].lower(), "application/octet-stream")
    return FileResponse(path, media_type=media_type)
