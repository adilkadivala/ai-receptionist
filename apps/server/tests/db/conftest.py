"""Tests against a real Postgres: the test database from infra/compose/dev.yml.

Skipped when it isn't running, unless REQUIRE_DB=1 (CI sets it, so a missing database fails there).
The session starts by migrating the test database down to nothing and back up, which also tests
the migrations themselves.
"""

import os
import uuid
from pathlib import Path

import pytest
from alembic import command
from alembic.config import Config
from sqlalchemy import create_engine, text
from sqlalchemy.exc import OperationalError

from core.db import Database
from core.models import Agent, Organization

SERVER_DIR = Path(__file__).resolve().parents[2]
APP_URL = os.environ.get("TEST_DATABASE_URL", "postgresql+psycopg://receptionist_app:app-dev@localhost:5433/receptionist_test")
OWNER_URL = os.environ.get(
    "TEST_MIGRATION_DATABASE_URL", "postgresql+psycopg://receptionist_owner:owner-dev@localhost:5433/receptionist_test"
)


@pytest.fixture(scope="session")
def owner_engine():
    engine = create_engine(OWNER_URL)
    try:
        engine.connect().close()
    except OperationalError as exc:
        if os.environ.get("REQUIRE_DB"):
            raise
        pytest.skip(f"test database not reachable ({type(exc).__name__}); run: docker compose -f infra/compose/dev.yml up -d")
    config = Config(str(SERVER_DIR / "alembic.ini"))
    config.attributes["url"] = OWNER_URL
    config.attributes["configure_logger"] = False
    command.downgrade(config, "base")
    command.upgrade(config, "head")
    yield engine
    engine.dispose()


@pytest.fixture
async def db(owner_engine):
    with owner_engine.begin() as conn:
        conn.execute(text("TRUNCATE organizations CASCADE"))
    database = Database(APP_URL)
    yield database
    await database.dispose()


async def add_organization(db: Database, name: str) -> tuple[uuid.UUID, uuid.UUID]:
    """A new organization with one agent. Returns (organization_id, agent_id)."""
    organization_id = uuid.uuid4()
    async with db.tenant(organization_id) as session:
        session.add(Organization(id=organization_id, name=name))
        await session.flush()
        agent = Agent(organization_id=organization_id, name=f"{name} front desk")
        session.add(agent)
        await session.flush()
    return organization_id, agent.id
