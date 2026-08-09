from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.routers import bio, meetings, meme, opensource, profile, projects, qa, resume

app = FastAPI(title="Portfolio Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_settings().allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(bio.router)
app.include_router(qa.router)
app.include_router(projects.router)
app.include_router(opensource.router)
app.include_router(meetings.router)
app.include_router(resume.router)
app.include_router(meme.router)
app.include_router(profile.router)


@app.get("/api/health")
def health_check():
    return {"status": "ok"}
