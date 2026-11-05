"""The admin pages' api (api.routes.admin) against the test database, as the dashboard calls it on this computer."""

import uuid
from datetime import timedelta

import pytest
from httpx import ASGITransport, AsyncClient

from api.main import app
from core.db import get_database
from tests.db.conftest import add_organization
from tests.db.test_admin import NOW, add_call, add_number


@pytest.fixture
async def local(db):
    app.dependency_overrides[get_database] = lambda: db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://localhost:8000") as client:
        yield client
    app.dependency_overrides.clear()


async def test_overview_totals_every_customer(db, local):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    await add_call(db, plumber, seconds=60, outcome="booking")
    await add_call(db, hotel, seconds=30, outcome="message")
    await add_call(db, hotel, at=NOW - timedelta(days=30), seconds=90, outcome="message")

    response = await local.get("/api/admin/overview", params={"time_zone": "UTC"})

    assert response.status_code == 200
    body = response.json()
    assert (body["customers"], body["calls"], body["call_seconds"]) == (2, 3, 180)
    assert body["outcomes"] == [{"outcome": "message", "calls": 2}, {"outcome": "booking", "calls": 1}]


async def test_overview_takes_the_time_zone_a_browser_reports(local):
    # Chrome still reports India as Asia/Calcutta, an old name some systems' tz databases have dropped.
    for time_zone in ("Asia/Calcutta", "Asia/Kolkata", "America/New_York", "UTC"):
        assert (await local.get("/api/admin/overview", params={"time_zone": time_zone})).status_code == 200


async def test_overview_refuses_an_unknown_time_zone(local):
    # Even with no calls at all, so nothing else would have asked Postgres about the zone.
    response = await local.get("/api/admin/overview", params={"time_zone": "Mars/Olympus_Mons"})
    assert response.status_code == 422


async def test_customer_list(db, local):
    plumber, agent = await add_organization(db, "Bright Pipes")
    await add_number(db, plumber, agent, "+15550001111")
    await add_call(db, plumber, agent, seconds=75)

    [customer] = (await local.get("/api/admin/organizations")).json()

    assert customer["name"] == "Bright Pipes"
    assert (customer["plan"], customer["region"], customer["hipaa_mode"]) == ("starter", "us", False)
    assert [number["e164"] for number in customer["phone_numbers"]] == ["+15550001111"]
    assert [agent["name"] for agent in customer["agents"]] == ["Bright Pipes front desk"]
    assert (customer["calls"], customer["call_seconds"]) == (1, 75)


async def test_customer_page_and_its_calls(db, local):
    plumber, agent = await add_organization(db, "Bright Pipes")
    await add_number(db, plumber, agent, "+15550001111")
    older = await add_call(db, plumber, agent, at=NOW - timedelta(days=1))
    newer = await add_call(db, plumber, agent)

    customer = (await local.get(f"/api/admin/organizations/{plumber}")).json()
    calls = (await local.get(f"/api/admin/organizations/{plumber}/calls", params={"page_size": 1})).json()

    assert customer["agents"][0]["languages"] == ["en"]
    assert customer["phone_numbers"][0]["provider"] == "telnyx"
    assert (calls["total"], calls["page"], calls["page_size"]) == (2, 1, 1)
    assert [call["id"] for call in calls["items"]] == [str(newer)]
    second = (await local.get(f"/api/admin/organizations/{plumber}/calls", params={"page": 2, "page_size": 1})).json()
    assert [call["id"] for call in second["items"]] == [str(older)]


async def test_unknown_customers_and_calls_are_not_found(db, local):
    plumber, _ = await add_organization(db, "Bright Pipes")
    hotel, _ = await add_organization(db, "Harbor Hotel")
    call_id = await add_call(db, plumber)

    assert (await local.get(f"/api/admin/organizations/{uuid.uuid4()}")).status_code == 404
    assert (await local.get(f"/api/admin/organizations/{uuid.uuid4()}/calls")).status_code == 404
    # A call is reached only through its own customer.
    assert (await local.get(f"/api/admin/organizations/{hotel}/calls/{call_id}")).status_code == 404
    assert (await local.get(f"/api/admin/organizations/{plumber}/calls/not-a-call")).status_code == 422
    assert (await local.get(f"/api/admin/organizations/{plumber}/calls", params={"page_size": 101})).status_code == 422


async def test_call_view(db, local):
    plumber, agent = await add_organization(db, "Bright Pipes")
    transcript = [{"role": "ai", "text": "Bright Pipes, how can I help?"}, {"role": "caller", "text": "My tap is leaking."}]
    call_id = await add_call(
        db, plumber, agent, from_number="+15557654321", to_number="+15550001111", language="en", transcript=transcript
    )

    response = await local.get(f"/api/admin/organizations/{plumber}/calls/{call_id}")

    assert response.status_code == 200
    call = response.json()
    assert (call["from_number"], call["to_number"], call["language"], call["duration_seconds"]) == (
        "+15557654321",
        "+15550001111",
        "en",
        60,
    )
    assert (call["outcome"], call["agent_name"], call["summary"]) == ("message", "Bright Pipes front desk", None)
    assert call["transcript"] == transcript
    assert call["ended_at"] is not None
