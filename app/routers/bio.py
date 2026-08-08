from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.bio import BioGenerationError, generate_sonnet

router = APIRouter(prefix="/api/bio", tags=["bio"])


class BioRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class BioResponse(BaseModel):
    sonnet: str


@router.post("", response_model=BioResponse)
def create_bio(request: BioRequest) -> BioResponse:
    try:
        sonnet = generate_sonnet(request.message)
    except BioGenerationError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
    return BioResponse(sonnet=sonnet)
