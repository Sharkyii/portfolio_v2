import os

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import get_settings

router = APIRouter(prefix="/api/resume", tags=["resume"])


@router.get("")
def get_resume():
    pdf_path = os.path.normpath(get_settings().resume_path)
    if os.path.isfile(pdf_path):
        return FileResponse(pdf_path, media_type="application/pdf", filename="resume.pdf")

    txt_path = os.path.join(os.path.dirname(pdf_path), "resume.txt")
    if os.path.isfile(txt_path):
        return FileResponse(txt_path, media_type="text/plain", filename="resume.txt")

    raise HTTPException(status_code=404, detail="Resume not uploaded yet")
