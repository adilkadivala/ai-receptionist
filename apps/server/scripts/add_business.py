"""Add the business set in apps/server/.env to the database, so its calls are saved.

    uv run python -m scripts.add_business

Creates an organization named BUSINESS_NAME, its receptionist, and its number BUSINESS_NUMBER, once: run again, it says
the number is already there. Until each business's settings come from the database the receptionist still reads them
from .env; this gives its calls somewhere to go.
"""

import asyncio
import sys
import uuid

from sqlalchemy.exc import OperationalError

from core.config import get_settings
from core.db import Database, get_database
from core.models import Agent, Organization, PhoneNumber


async def add_business(db: Database, name: str, number: str) -> tuple[uuid.UUID, bool]:
    """Adds an organization called `name` with one receptionist answering `number`. Returns the organization's ID and
    whether it was added: False when the number already belongs to a business."""
    if route := await db.resolve_number(number):
        return route.organization_id, False
    organization_id = uuid.uuid4()
    async with db.tenant(organization_id) as session:
        session.add(Organization(id=organization_id, name=name))
        await session.flush()
        agent = Agent(organization_id=organization_id, name=f"{name} front desk")
        session.add(agent)
        await session.flush()
        session.add(PhoneNumber(organization_id=organization_id, agent_id=agent.id, e164=number))
    return organization_id, True


async def main() -> None:
    settings = get_settings()
    if not settings.business_number:
        sys.exit("Set BUSINESS_NUMBER in apps/server/.env first: the number callers dial, such as +16175550142")
    db = get_database()
    try:
        organization_id, added = await add_business(db, settings.business_name, settings.business_number)
    except OperationalError as exc:
        sys.exit(f"Can't reach the database ({type(exc).__name__}). Start it: docker compose -f infra/compose/dev.yml up -d")
    finally:
        await db.dispose()
    if added:
        print(f"Added {settings.business_name} ({organization_id}) with {settings.business_number}: its calls are saved now.")
    else:
        print(f"{settings.business_number} is already in the database (organization {organization_id}); nothing to do.")


if __name__ == "__main__":
    asyncio.run(main())
