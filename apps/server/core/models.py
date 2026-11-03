"""Database tables.

Every table except `organizations` carries `organization_id`. Row-level security (migration 0001)
limits each transaction to the organization set by `Database.tenant()`. References between tables
include `organization_id` (composite foreign keys), so a row can never point at another
organization's agent or number, even through a bug in our code.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Any

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    MetaData,
    Numeric,
    Text,
    UniqueConstraint,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import ARRAY, JSONB
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

PLANS = ("starter", "pro", "business", "enterprise")
REGIONS = ("us", "eu", "in")
# How a call ended, for the owner's call list and for billing reports.
CALL_OUTCOMES = ("answered", "message", "booking", "transfer", "spam", "failed", "abandoned")


def _in(column: str, values: tuple[str, ...]) -> str:
    return f"{column} IN ({', '.join(repr(v) for v in values)})"


class Base(DeclarativeBase):
    # Predictable constraint names, so migrations can refer to them.
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(table_name)s_%(column_0_N_name)s",
            "uq": "uq_%(table_name)s_%(column_0_N_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_N_name)s",
            "pk": "pk_%(table_name)s",
        }
    )


def _id() -> Mapped[uuid.UUID]:
    return mapped_column(primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))


def _created_at() -> Mapped[datetime]:
    return mapped_column(DateTime(timezone=True), server_default=func.now())


def _org_id() -> Mapped[uuid.UUID]:
    return mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"))


class Organization(Base):
    """The paying customer: a plumber, a hotel group, a hospital."""

    __tablename__ = "organizations"
    __table_args__ = (
        CheckConstraint(_in("plan", PLANS), name="plan"),
        CheckConstraint(_in("region", REGIONS), name="region"),
    )

    id: Mapped[uuid.UUID] = _id()
    name: Mapped[str] = mapped_column(Text)
    plan: Mapped[str] = mapped_column(Text, default="starter", server_default="starter")
    # Where this organization's data and calls live. Chosen at sign-up; never moves.
    region: Mapped[str] = mapped_column(Text, default="us", server_default="us")
    # Hospitals: only vendors with a signed business associate agreement, no recordings, short retention.
    hipaa_mode: Mapped[bool] = mapped_column(default=False, server_default=text("false"))
    created_at: Mapped[datetime] = _created_at()


class Agent(Base):
    """One receptionist setup: what it says, knows and can do."""

    __tablename__ = "agents"
    __table_args__ = (UniqueConstraint("organization_id", "id"),)

    id: Mapped[uuid.UUID] = _id()
    organization_id: Mapped[uuid.UUID] = _org_id()
    name: Mapped[str] = mapped_column(Text)
    # None uses the default greeting, which always includes the AI and recording notice.
    greeting: Mapped[str | None] = mapped_column(Text)
    business_info: Mapped[str] = mapped_column(Text, default="", server_default="")
    # Languages the business expects; the voice still follows whatever the caller speaks.
    languages: Mapped[list[str]] = mapped_column(ARRAY(Text), default=lambda: ["en"], server_default="{en}")
    voice_id: Mapped[str | None] = mapped_column(Text)
    transfer_number: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = _created_at()
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class PhoneNumber(Base):
    """A number callers dial. Unique across all organizations: it decides who answers."""

    __tablename__ = "phone_numbers"
    __table_args__ = (
        UniqueConstraint("organization_id", "id"),
        CheckConstraint(r"e164 ~ '^\+[1-9][0-9]{6,14}$'", name="e164"),
        ForeignKeyConstraint(
            ["organization_id", "agent_id"],
            ["agents.organization_id", "agents.id"],
            ondelete="SET NULL (agent_id)",
        ),
    )

    id: Mapped[uuid.UUID] = _id()
    organization_id: Mapped[uuid.UUID] = _org_id()
    agent_id: Mapped[uuid.UUID | None]
    e164: Mapped[str] = mapped_column(Text, unique=True)
    provider: Mapped[str] = mapped_column(Text, default="telnyx", server_default="telnyx")
    created_at: Mapped[datetime] = _created_at()


class Call(Base):
    """One phone call, saved when it ends."""

    __tablename__ = "calls"
    __table_args__ = (
        CheckConstraint(_in("outcome", CALL_OUTCOMES), name="outcome"),
        ForeignKeyConstraint(
            ["organization_id", "agent_id"],
            ["agents.organization_id", "agents.id"],
            ondelete="SET NULL (agent_id)",
        ),
        ForeignKeyConstraint(
            ["organization_id", "phone_number_id"],
            ["phone_numbers.organization_id", "phone_numbers.id"],
            ondelete="SET NULL (phone_number_id)",
        ),
        Index("ix_calls_organization_id_started_at", "organization_id", text("started_at DESC")),
    )

    id: Mapped[uuid.UUID] = _id()
    organization_id: Mapped[uuid.UUID] = _org_id()
    agent_id: Mapped[uuid.UUID | None]
    phone_number_id: Mapped[uuid.UUID | None]
    # Telnyx's call_control_id.
    provider_call_id: Mapped[str | None] = mapped_column(Text, unique=True)
    from_number: Mapped[str | None] = mapped_column(Text)
    to_number: Mapped[str | None] = mapped_column(Text)
    language: Mapped[str | None] = mapped_column(Text)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    duration_seconds: Mapped[int | None]
    outcome: Mapped[str | None] = mapped_column(Text)
    # [{"role": "caller" | "ai", "text": ...}, ...]
    transcript: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, default=list, server_default="[]")
    # Claude's summary for the owner (voice.summary.CallSummary): caller, number given, need, urgency, next steps.
    # None until it's written, and for calls where the caller said nothing or Claude failed.
    summary: Mapped[dict[str, Any] | None] = mapped_column(JSONB)
    # What the call cost us across providers, to track the per-plan margin.
    cost_usd: Mapped[Decimal | None] = mapped_column(Numeric(10, 5))
    created_at: Mapped[datetime] = _created_at()
