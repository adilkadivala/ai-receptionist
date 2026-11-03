"""The admin pages' api: every customer's data in one place, for the founders. Read only.

There's no login yet, so these routes answer only requests made on this computer, the same guard as the browser test
call (voice.browser.this_computer_only). Through a tunnel such as ngrok they return 404. A real admin login must
replace that guard before the api is deployed anywhere.
"""

import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status

from api.schemas.admin import (
    AdminCall,
    AdminCallPage,
    AdminOrganization,
    AdminOrganizationDetail,
    AdminOutcomeCount,
    AdminOverview,
)
from core.db import Database, get_database
from repositories import admin
from voice.browser import this_computer_only

router = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(this_computer_only)])


@router.get("/overview")
async def overview(
    time_zone: str = Query("UTC", description="IANA name, such as Asia/Kolkata: where today and this week start."),
    db: Database = Depends(get_database),
) -> AdminOverview:
    try:
        customers, rows = await admin.call_totals(db, time_zone)
    except admin.UnknownTimeZone:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_CONTENT, f"Unknown time zone {time_zone!r}") from None
    return AdminOverview(
        customers=customers,
        **{
            total: sum(row[total] for row in rows)
            for total in ("calls_today", "calls_this_week", "calls", "call_seconds_this_week", "call_seconds")
        },
        outcomes=[
            AdminOutcomeCount(outcome=row["outcome"], calls=row["calls"])
            for row in sorted(rows, key=lambda row: (-row["calls"], row["outcome"] or ""))
        ],
    )


@router.get("/organizations")
async def organizations(db: Database = Depends(get_database)) -> list[AdminOrganization]:
    return [AdminOrganization.model_validate(row) for row in await admin.list_organizations(db)]


@router.get("/organizations/{organization_id}")
async def organization(organization_id: uuid.UUID, db: Database = Depends(get_database)) -> AdminOrganizationDetail:
    found = await admin.get_organization(db, organization_id)
    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such customer")
    return AdminOrganizationDetail.model_validate(found)


@router.get("/organizations/{organization_id}/calls")
async def calls(
    organization_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    db: Database = Depends(get_database),
) -> AdminCallPage:
    found = await admin.list_calls(db, organization_id, page, page_size)
    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such customer")
    return AdminCallPage.model_validate(found)


@router.get("/organizations/{organization_id}/calls/{call_id}")
async def call(organization_id: uuid.UUID, call_id: uuid.UUID, db: Database = Depends(get_database)) -> AdminCall:
    """The full call. Each time it's opened, audit_log records that its transcript was viewed."""
    found = await admin.get_call(db, organization_id, call_id)
    if found is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "No such call")
    return AdminCall.model_validate(found)
