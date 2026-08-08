from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.rag import QAError, answer_question

router = APIRouter(prefix="/api/ask", tags=["qa"])


class AskRequest(BaseModel):
    question: str = Field(min_length=1, max_length=1000)


@router.post("")
def ask(request: AskRequest):
    try:
        return answer_question(request.question)
    except QAError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
