from fastapi import APIRouter, FastAPI
from pydantic import BaseModel

from core.config import get_settings
from voice.routes import router as telnyx_router

app = FastAPI(title="AI Receptionist API", version="0.1.0")

api = APIRouter(prefix="/api")


class Health(BaseModel):
    ok: bool
    missing: list[str]  # the .env keys a call needs that aren't set yet


@api.get("/health", tags=["meta"])
def health() -> Health:
    return Health(ok=True, missing=get_settings().missing_keys())


app.include_router(api)
app.include_router(telnyx_router)  # public: Telnyx connects here
