"""The admin api answers only on this computer, until there's an admin login. No database needed: the guard refuses
before any query runs."""

import uuid

import pytest
from fastapi.testclient import TestClient

ORGANIZATION = uuid.uuid4()
PATHS = [
    "/api/admin/overview",
    "/api/admin/organizations",
    f"/api/admin/organizations/{ORGANIZATION}",
    f"/api/admin/organizations/{ORGANIZATION}/calls",
    f"/api/admin/organizations/{ORGANIZATION}/calls/{uuid.uuid4()}",
]


@pytest.mark.parametrize("path", PATHS)
def test_hidden_from_other_hosts(client, path):
    assert client.get(path, headers={"host": "abc.ngrok-free.app"}).status_code == 404


@pytest.mark.parametrize("path", PATHS)
def test_hidden_when_forwarded_by_a_tunnel(path):
    from api.main import app

    # ngrok can keep the Host header as localhost, but it always adds X-Forwarded-For.
    client = TestClient(app, base_url="http://localhost:8000")
    assert client.get(path, headers={"x-forwarded-for": "203.0.113.7"}).status_code == 404


def test_listed_in_the_api_description_for_the_dashboards_client():
    from api.main import app

    assert {path for path in app.openapi()["paths"] if path.startswith("/api/admin/")} == {
        "/api/admin/overview",
        "/api/admin/organizations",
        "/api/admin/organizations/{organization_id}",
        "/api/admin/organizations/{organization_id}/calls",
        "/api/admin/organizations/{organization_id}/calls/{call_id}",
    }
