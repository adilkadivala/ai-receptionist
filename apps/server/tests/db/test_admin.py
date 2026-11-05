"""The admin's reads across organizations (repositories.admin): every customer at once, without loosening row-level
security for anything else."""

import uuid
from datetime import UTC, datetime, timedelta
from zoneinfo import ZoneInfo

import pytest
from sqlalchemy import func, select, text
from sqlalchemy.exc import DBAPIError

from core.models import AuditEntry, Call, PhoneNumber
from repositories import admin
from tests.db.conftest import add_organization

NOW = datetime.now(UTC)


async def add_call(db, organization_id, agent_id=None, *, at=NOW, seconds=60, outcome="message", **values) -> uuid.UUID:
    async with db.tenant(organization_id) as session:
        call = Call(
            organization_id=organization_id,
            agent_id=agent_id,
            started_at=at,
            ended_at=at + timedelta(seconds=seconds),
            duration_seconds=seconds,
            outcome=outcome,
            **values,
        )
        session.add(call)
        await session.flush()
    return call.id


async def add_number(db, organization_id, agent_id, e164) -> None:
    async with db.tenant(organization_id) as session:
        session.add(PhoneNumber(organization_id=organization_id, agent_id=agent_id, e164=e164))


async def test_customer_list_shows_every_organization_with_its_totals(db):
    plumber, plumber_agent = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    await add_number(db, plumber, plumber_agent, "+15550001111")
    await add_call(db, plumber, plumber_agent, at=NOW - timedelta(days=2), seconds=90)
    await add_call(db, plumber, plumber_agent, at=NOW - timedelta(hours=1), seconds=30)

    customers = {row["name"]: row for row in await admin.list_organizations(db)}

    assert customers.keys() == {"Bright Pipes", "Harbor Hotel"}
    plumbing = customers["Bright Pipes"]
    assert [(n["e164"], n["agent_id"]) for n in plumbing["phone_numbers"]] == [("+15550001111", str(plumber_agent))]
    assert plumbing["agents"] == [{"id": str(plumber_agent), "name": "Bright Pipes front desk"}]
    assert (plumbing["calls"], plumbing["call_seconds"]) == (2, 120)
    assert abs(plumbing["last_call_at"] - (NOW - timedelta(hours=1))) < timedelta(seconds=1)
    assert (customers["Harbor Hotel"]["calls"], customers["Harbor Hotel"]["last_call_at"]) == (0, None)
    assert customers["Harbor Hotel"]["id"] == hotel


async def test_call_totals_count_today_this_week_and_all_time_in_the_viewers_time_zone(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    zone = ZoneInfo("Asia/Kolkata")
    local_now = datetime.now(zone)
    today = local_now.replace(hour=0, minute=0, second=0, microsecond=0)
    week = today - timedelta(days=today.weekday())
    starts = {
        "now": local_now - timedelta(seconds=5),
        "just before today": today - timedelta(minutes=1),
        "just before this week": week - timedelta(minutes=1),
    }
    await add_call(db, plumber, at=starts["now"], seconds=60, outcome="booking")
    await add_call(db, hotel, at=starts["just before today"], seconds=120, outcome="message")
    await add_call(db, hotel, at=starts["just before this week"], seconds=180, outcome="message")
    await add_call(db, hotel, at=starts["now"], seconds=30, outcome=None)

    organizations, rows = await admin.call_totals(db, "Asia/Kolkata")

    this_week = [start >= week for start in (starts["now"], starts["just before today"], starts["just before this week"])]
    by_outcome = {row["outcome"]: row for row in rows}
    assert organizations == 2
    assert by_outcome.keys() == {"booking", "message", None}
    assert sum(row["calls_today"] for row in rows) == 2
    assert sum(row["calls_this_week"] for row in rows) == 2 + this_week[1] + this_week[2]
    assert sum(row["calls"] for row in rows) == 4
    assert by_outcome["message"]["calls"] == 2
    assert sum(row["call_seconds"] for row in rows) == 390
    assert sum(row["call_seconds_this_week"] for row in rows) == 90 + 120 * this_week[1] + 180 * this_week[2]


async def test_the_platform_session_sees_no_rows_and_writes_nothing(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    await add_call(db, plumber)
    async with db.platform() as session:
        assert (await session.execute(select(func.count()).select_from(Call))).scalar_one() == 0
    with pytest.raises(DBAPIError, match="read-only transaction"):
        async with db.platform() as session:
            await session.execute(text("INSERT INTO organizations (name) VALUES ('sneaky')"))


async def test_only_the_app_role_may_run_the_admin_functions(db, owner_engine):
    with owner_engine.connect() as conn:
        grantees = conn.execute(
            text("""
                SELECT p.proname, array_agg(a.grantee::regrole::text ORDER BY a.grantee::regrole::text)
                FROM pg_proc p, aclexplode(p.proacl) a
                WHERE p.proname IN ('admin_organizations', 'admin_call_totals') AND a.privilege_type = 'EXECUTE'
                GROUP BY p.proname
            """)
        ).all()
    # No PUBLIC grant ("-"): only the owner, which runs them, and the app role.
    assert dict(grantees) == {
        "admin_organizations": ["receptionist_app", "receptionist_owner"],
        "admin_call_totals": ["receptionist_app", "receptionist_owner"],
    }


async def test_one_customer_is_read_inside_its_own_organization(db):
    plumber, plumber_agent = await add_organization(db, "Bright Pipes")
    hotel, hotel_agent = await add_organization(db, "Harbor Hotel")
    await add_number(db, plumber, plumber_agent, "+15550001111")
    await add_number(db, hotel, hotel_agent, "+15550002222")
    await add_call(db, plumber, at=NOW - timedelta(days=1), seconds=40)
    await add_call(db, hotel, seconds=50)

    customer = await admin.get_organization(db, plumber)

    assert customer["name"] == "Bright Pipes"
    assert [number.e164 for number in customer["phone_numbers"]] == ["+15550001111"]
    assert [agent.id for agent in customer["agents"]] == [plumber_agent]
    assert (customer["calls"], customer["call_seconds"]) == (1, 40)
    assert await admin.get_organization(db, uuid.uuid4()) is None


async def test_calls_come_newest_first_a_page_at_a_time(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    ids = [await add_call(db, plumber, at=NOW - timedelta(hours=hours)) for hours in (3, 1, 2)]
    await add_call(db, hotel)

    first = await admin.list_calls(db, plumber, page=1, page_size=2)
    second = await admin.list_calls(db, plumber, page=2, page_size=2)

    assert first["total"] == 3
    assert [call["id"] for call in first["items"] + second["items"]] == [ids[1], ids[2], ids[0]]
    assert first["items"][0]["headline"] is None
    assert await admin.list_calls(db, uuid.uuid4(), page=1, page_size=2) is None


async def test_opening_a_call_shows_everything_and_audits_it(db):
    plumber, agent = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    transcript = [{"role": "ai", "text": "Bright Pipes, how can I help?"}, {"role": "caller", "text": "My tap is leaking."}]
    call_id = await add_call(db, plumber, agent, from_number="+15557654321", to_number="+15550001111", transcript=transcript)

    call = await admin.get_call(db, plumber, call_id)

    assert call["transcript"] == transcript
    assert (call["agent_name"], call["from_number"], call["summary"]) == ("Bright Pipes front desk", "+15557654321", None)
    async with db.tenant(plumber) as session:
        entry = (await session.execute(select(AuditEntry))).scalar_one()
    assert (entry.actor, entry.action, entry.target_id) == (admin.ADMIN_ON_THIS_COMPUTER, admin.TRANSCRIPT_VIEWED, call_id)
    async with db.tenant(hotel) as session:
        assert (await session.execute(select(func.count()).select_from(AuditEntry))).scalar_one() == 0


async def test_a_call_is_found_only_under_its_own_organization(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    call_id = await add_call(db, plumber)

    assert await admin.get_call(db, hotel, call_id) is None
    async with db.tenant(hotel) as session:
        assert (await session.execute(select(func.count()).select_from(AuditEntry))).scalar_one() == 0


async def test_the_summary_shows_once_calls_have_one(db, owner_engine):
    # Migration 0002 (call saving) adds the column; until it's merged, add it here.
    with owner_engine.begin() as conn:
        conn.execute(text("ALTER TABLE calls ADD COLUMN IF NOT EXISTS summary jsonb"))
    plumber, _ = await add_organization(db, "Bright Pipes")
    call_id = await add_call(db, plumber)
    async with db.tenant(plumber) as session:
        await session.execute(
            text("""UPDATE calls SET summary = '{"headline": "Ramesh: kitchen tap leaking", "urgency": "urgent"}'""")
        )

    call = await admin.get_call(db, plumber, call_id)
    page = await admin.list_calls(db, plumber, page=1, page_size=10)

    assert call["summary"] == {"headline": "Ramesh: kitchen tap leaking", "urgency": "urgent"}
    assert page["items"][0]["headline"] == "Ramesh: kitchen tap leaking"


async def test_the_audit_log_is_append_only(db):
    plumber, _ = await add_organization(db, "Bright Pipes")
    call_id = await add_call(db, plumber)
    await admin.get_call(db, plumber, call_id)
    for statement in ("UPDATE audit_log SET actor = 'nobody'", "DELETE FROM audit_log"):
        with pytest.raises(DBAPIError, match="permission denied"):
            async with db.tenant(plumber) as session:
                await session.execute(text(statement))
