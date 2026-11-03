"""What the admin pages' api returns (api.routes.admin). Names start with Admin, so they never clash with the
customer-facing schemas in the generated client."""

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class AdminNumberRef(BaseModel):
    id: uuid.UUID
    e164: str
    agent_id: uuid.UUID | None


class AdminAgentRef(BaseModel):
    id: uuid.UUID
    name: str


class AdminOrganization(BaseModel):
    """One customer in the list, with its call totals."""

    id: uuid.UUID
    name: str
    plan: str
    region: str
    hipaa_mode: bool
    created_at: datetime
    phone_numbers: list[AdminNumberRef]
    agents: list[AdminAgentRef]
    calls: int
    call_seconds: int
    last_call_at: datetime | None


class AdminOutcomeCount(BaseModel):
    outcome: str | None = Field(description="How the calls ended; null while it isn't set yet.")
    calls: int


class AdminOverview(BaseModel):
    """Totals across every customer. Today and this week (from Monday) are in the time zone asked for."""

    customers: int
    calls_today: int
    calls_this_week: int
    calls: int
    call_seconds_this_week: int
    call_seconds: int
    outcomes: list[AdminOutcomeCount] = Field(description="All-time calls per outcome, most first.")


class AdminPhoneNumber(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    e164: str
    provider: str
    agent_id: uuid.UUID | None
    created_at: datetime


class AdminAgent(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    greeting: str | None
    languages: list[str]
    transfer_number: str | None
    created_at: datetime


class AdminOrganizationDetail(BaseModel):
    """One customer: its numbers and agents, and its call totals."""

    id: uuid.UUID
    name: str
    plan: str
    region: str
    hipaa_mode: bool
    created_at: datetime
    phone_numbers: list[AdminPhoneNumber]
    agents: list[AdminAgent]
    calls: int
    call_seconds: int
    last_call_at: datetime | None


class AdminCallRow(BaseModel):
    id: uuid.UUID
    agent_id: uuid.UUID | None
    from_number: str | None
    to_number: str | None
    language: str | None
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    outcome: str | None
    headline: str | None = Field(description="The summary's one-line headline, once there's a summary.")


class AdminCallPage(BaseModel):
    items: list[AdminCallRow]
    total: int
    page: int
    page_size: int


class AdminTranscriptTurn(BaseModel):
    role: str = Field(description='"caller" or "ai".')
    text: str


class AdminCall(BaseModel):
    """One call, with the full transcript and, once it's written, Claude's summary (voice.summary.CallSummary)."""

    id: uuid.UUID
    organization_id: uuid.UUID
    agent_id: uuid.UUID | None
    agent_name: str | None
    phone_number_id: uuid.UUID | None
    from_number: str | None
    to_number: str | None
    language: str | None
    started_at: datetime
    ended_at: datetime | None
    duration_seconds: int | None
    outcome: str | None
    cost_usd: float | None
    transcript: list[AdminTranscriptTurn]
    summary: dict[str, Any] | None
