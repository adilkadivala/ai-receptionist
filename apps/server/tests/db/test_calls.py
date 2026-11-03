"""Saving calls: each lands with the business that owns the number dialed, and only that business sees it."""

from sqlalchemy import select

from core.models import Call, PhoneNumber
from scripts.add_business import add_business
from tests.conftest import make_settings
from tests.db.conftest import add_organization
from tests.test_after_call import SALON, ended
from tests.test_summary import PRIYA
from voice import summary
from voice.after_call import after_call


async def test_adding_the_business_is_done_once(db):
    organization_id, added = await add_business(db, "Glow Salon", SALON)
    again, added_again = await add_business(db, "Glow Salon", SALON)
    assert added and not added_again and again == organization_id
    async with db.tenant(organization_id) as session:
        [number] = (await session.execute(select(PhoneNumber))).scalars().all()
    assert number.e164 == SALON and number.agent_id is not None
    route = await db.resolve_number(SALON)
    assert route.organization_id == organization_id and route.agent_id == number.agent_id


async def test_a_call_is_saved_with_its_summary_for_its_business_only(db, monkeypatch):
    async def fake_summarize(transcript, settings):
        return PRIYA

    monkeypatch.setattr(summary, "summarize", fake_summarize)
    salon, _ = await add_business(db, "Glow Salon", SALON)
    hotel, _ = await add_organization(db, "Harbor Hotel")

    await after_call(ended(), make_settings(), label="Call 1", db=db)

    async with db.tenant(salon) as session:
        [call] = (await session.execute(select(Call))).scalars().all()
    route = await db.resolve_number(SALON)
    assert (call.agent_id, call.phone_number_id) == (route.agent_id, route.phone_number_id)
    assert (call.from_number, call.to_number, call.provider_call_id, call.language) == (
        "+919876543210",
        SALON,
        "v3:call-1",
        "hi",
    )
    assert call.duration_seconds == 84 and call.ended_at > call.started_at
    assert call.transcript[1] == {"role": "caller", "text": "मुझे कल haircut चाहिए, मेरा नाम प्रिया है"}
    assert call.summary["caller_name"] == "Priya" and call.outcome == "message"

    async with db.tenant(hotel) as session:
        assert (await session.execute(select(Call))).scalars().all() == []


async def test_a_call_to_an_unknown_number_saves_nothing(db):
    salon, _ = await add_business(db, "Glow Salon", SALON)
    await after_call(ended(to_number="+16175550000", turns=[("AI", "Hello.")]), make_settings(), label="Call 1", db=db)
    async with db.tenant(salon) as session:
        assert (await session.execute(select(Call))).scalars().all() == []
