from fastapi import APIRouter, FastAPI
from pydantic import BaseModel

from api.routes.admin import router as admin_router
from core.config import get_settings
from voice.browser import router as browser_call_router
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
app.include_router(admin_router)  # this computer only, until there's an admin login
app.include_router(telnyx_router)  # public: Telnyx connects here
app.include_router(browser_call_router)  # this computer only: test calls from a browser
