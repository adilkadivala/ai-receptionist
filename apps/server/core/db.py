"""Database access.

Work for an organization runs inside `Database.tenant(organization_id)`: one transaction with the
organization set for row-level security. Outside of it, every tenant table returns no rows and
rejects writes. The setting is transaction-local, so it never leaks to the next user of a pooled
connection.

Queries that cross organizations go only through SECURITY DEFINER functions that return a narrow answer:
`resolve_number()` maps the dialed number to its organization, which calls need before they know who they belong
to, and the admin pages' customer list and call totals (repositories.admin) run in `Database.platform()`.
"""

import uuid
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from dataclasses import dataclass
from functools import lru_cache

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from core.config import get_settings

SET_ORGANIZATION = text("SELECT set_config('app.organization_id', :organization_id, true)")
READ_ONLY = text("SET TRANSACTION READ ONLY")
RESOLVE_NUMBER = text("SELECT organization_id, agent_id, phone_number_id FROM resolve_phone_number(:e164)")


@dataclass(frozen=True)
class NumberRoute:
    organization_id: uuid.UUID
    agent_id: uuid.UUID | None
    phone_number_id: uuid.UUID


class Database:
    def __init__(self, url: str):
        self.engine = create_async_engine(url, pool_pre_ping=True)
        self._sessions = async_sessionmaker(self.engine, expire_on_commit=False)

    @asynccontextmanager
    async def tenant(self, organization_id: uuid.UUID) -> AsyncIterator[AsyncSession]:
        """A transaction that can only see and change this organization's rows. Commits on exit."""
        async with self._sessions() as session, session.begin():
            await session.execute(SET_ORGANIZATION, {"organization_id": str(organization_id)})
            yield session

    @asynccontextmanager
    async def platform(self) -> AsyncIterator[AsyncSession]:
        """A read-only transaction with no organization set. Every tenant table is empty in it, so it can only read
        across organizations through the SECURITY DEFINER functions granted to the app role."""
        async with self._sessions() as session, session.begin():
            await session.execute(READ_ONLY)
            yield session

    async def resolve_number(self, e164: str) -> NumberRoute | None:
        """Which organization and agent answer this number, or None if it isn't ours."""
        async with self._sessions() as session:
            row = (await session.execute(RESOLVE_NUMBER, {"e164": e164})).first()
        return NumberRoute(*row) if row else None

    async def dispose(self) -> None:
        await self.engine.dispose()


@lru_cache
def get_database() -> Database:
    return Database(get_settings().database_url)
