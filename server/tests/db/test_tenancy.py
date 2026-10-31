"""Row-level security: one organization can never see or change another's data."""

import uuid

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import DBAPIError, IntegrityError

from core.models import Agent, Call, Organization, PhoneNumber
from tests.db.conftest import add_organization


async def count(session, model) -> int:
    return (await session.execute(select(func.count()).select_from(model))).scalar_one()


async def test_each_organization_sees_only_its_own_rows(db):
    plumber, plumber_agent = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")

    async with db.tenant(plumber) as session:
        names = (await session.execute(select(Organization.name))).scalars().all()
        agents = (await session.execute(select(Agent.id))).scalars().all()
    assert names == ["Bright Pipes"]
    assert agents == [plumber_agent]

    async with db.tenant(hotel) as session:
        assert (await session.execute(select(Organization.name))).scalars().all() == ["Harbor Hotel"]


async def test_nothing_is_visible_without_an_organization(db):
    await add_organization(db, "Bright Pipes")
    async with db.engine.connect() as conn:
        assert (await conn.execute(select(func.count()).select_from(Agent))).scalar_one() == 0
        assert (await conn.execute(select(func.count()).select_from(Organization))).scalar_one() == 0


async def test_organization_setting_ends_with_the_transaction(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    async with db.tenant(plumber) as session:
        assert await count(session, Agent) == 1
    # Same connection pool: the next transaction must not inherit the organization.
    async with db.engine.connect() as conn:
        assert (await conn.execute(select(func.count()).select_from(Agent))).scalar_one() == 0


async def test_cannot_write_rows_for_another_organization(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    with pytest.raises(DBAPIError, match="row-level security"):
        async with db.tenant(plumber) as session:
            session.add(Agent(organization_id=hotel, name="sneaky"))
            await session.flush()


async def test_cannot_change_another_organizations_rows(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, hotel_agent = await add_organization(db, "Harbor Hotel")
    async with db.tenant(plumber) as session:
        result = await session.execute(text("UPDATE agents SET name = 'hacked' WHERE id = :id"), {"id": hotel_agent})
        assert result.rowcount == 0
    async with db.tenant(hotel) as session:
        assert (await session.get(Agent, hotel_agent)).name == "Harbor Hotel front desk"


async def test_number_cannot_point_at_another_organizations_agent(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    _, hotel_agent = await add_organization(db, "Harbor Hotel")
    with pytest.raises(IntegrityError):
        async with db.tenant(plumber) as session:
            session.add(PhoneNumber(organization_id=plumber, agent_id=hotel_agent, e164="+15550001111"))
            await session.flush()


async def test_resolve_number_finds_the_organization_without_one_set(db):
    plumber, agent = await add_organization(db, "Bright Pipes")
    async with db.tenant(plumber) as session:
        number = PhoneNumber(organization_id=plumber, agent_id=agent, e164="+15550001111")
        session.add(number)
        await session.flush()

    route = await db.resolve_number("+15550001111")
    assert (route.organization_id, route.agent_id, route.phone_number_id) == (plumber, agent, number.id)
    assert await db.resolve_number("+15559999999") is None


async def test_a_number_belongs_to_one_organization(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    async with db.tenant(plumber) as session:
        session.add(PhoneNumber(organization_id=plumber, e164="+15550001111"))
    with pytest.raises(IntegrityError):
        async with db.tenant(hotel) as session:
            session.add(PhoneNumber(organization_id=hotel, e164="+15550001111"))
            await session.flush()


async def test_deleting_an_agent_keeps_its_number_and_calls(db):
    plumber, agent = await add_organization(db, "Bright Pipes")
    async with db.tenant(plumber) as session:
        number = PhoneNumber(organization_id=plumber, agent_id=agent, e164="+15550001111")
        session.add(number)
        await session.flush()
        session.add(Call(organization_id=plumber, agent_id=agent, phone_number_id=number.id, outcome="message"))
        await session.flush()
        await session.execute(text("DELETE FROM agents WHERE id = :id"), {"id": agent})

    async with db.tenant(plumber) as session:
        number = (await session.execute(select(PhoneNumber))).scalar_one()
        call = (await session.execute(select(Call))).scalar_one()
    assert number.agent_id is None and number.organization_id == plumber
    assert call.agent_id is None and call.phone_number_id == number.id


async def test_deleting_an_organization_removes_all_its_data(db):
    plumber, agent = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    async with db.tenant(plumber) as session:
        session.add(PhoneNumber(organization_id=plumber, agent_id=agent, e164="+15550001111"))
        session.add(Call(organization_id=plumber, agent_id=agent, outcome="booking"))
        await session.flush()
        await session.execute(text("DELETE FROM organizations WHERE id = :id"), {"id": plumber})

    async with db.tenant(plumber) as session:
        assert [await count(session, m) for m in (Organization, Agent, PhoneNumber, Call)] == [0, 0, 0, 0]
    async with db.tenant(hotel) as session:
        assert await count(session, Agent) == 1


async def test_app_role_cannot_bypass_row_level_security(db):
    async with db.engine.connect() as conn:
        row = (await conn.execute(text("SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = current_user"))).one()
    assert tuple(row) == (False, False)


async def test_bad_phone_numbers_are_rejected(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    with pytest.raises(IntegrityError, match="e164"):
        async with db.tenant(plumber) as session:
            session.add(PhoneNumber(organization_id=plumber, e164="555-0001"))
            await session.flush()


async def test_an_unknown_organization_sees_nothing(db):
    await add_organization(db, "Bright Pipes")
    async with db.tenant(uuid.uuid4()) as session:
        assert await count(session, Organization) == 0
        assert await count(session, Agent) == 0
