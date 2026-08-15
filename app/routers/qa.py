from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.services.rag import QAError, prepare_answer, stream_answer

router = APIRouter(prefix="/api/ask", tags=["qa"])


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


@router.post("")
def ask(request: AskRequest):
    try:
        # Synchronous on purpose: any config error (no ANTHROPIC_API_KEY) has
        # to raise here, before the streaming response starts and commits to
        # a 200 status.
        prepared = prepare_answer(request.question)
    except QAError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return StreamingResponse(stream_answer(prepared), media_type="application/x-ndjson")
