from fastapi import APIRouter, FastAPI

from core.config import get_settings
from voice.routes import router as telnyx_router

app = FastAPI(title="AI Receptionist API", version="0.1.0")

api = APIRouter(prefix="/api")


@api.get("/health", tags=["meta"])
def health() -> dict:
    # `missing` lists the .env keys a call needs that aren't set yet.
    return {"ok": True, "missing": get_settings().missing_keys()}


app.include_router(api)
app.include_router(telnyx_router)  # public: Telnyx connects here
