# Development

## Setup (once)

You need Docker and [uv](https://docs.astral.sh/uv/).

1. Start the local database: Postgres 17 with pgvector, on port 5433.
   ```bash
   docker compose -f infra/compose/dev.yml up -d
   ```
2. Install the server's Python packages: about 500 MB of libraries, no AI models.
   ```bash
   cd server && uv sync
   ```
3. Create the tables.
   ```bash
   cd server && uv run alembic upgrade head
   ```

## Every day

Run the checks, which are the same ones CI runs:
```bash
cd server && uv run ruff check . && uv run ruff format --check . && uv run pytest -q
```

The database tests use their own database, `receptionist_test`, and skip themselves if Postgres isn't running. CI sets `REQUIRE_DB=1`, so there they fail instead.

To change the database:
1. Edit `server/core/models.py`.
2. Generate a migration:
   ```bash
   cd server && uv run alembic revision --autogenerate -m "what changed"
   ```
3. Read the migration it generated. A new table that belongs to an organization also needs a row-level security policy and a grant for the app role. Copy the pattern in `migrations/versions/0001_foundation.py`.

## How each business's data is kept apart

- The api, voice and worker processes connect as `receptionist_app`, which can't bypass row-level security.
- All work for a business runs inside `Database.tenant(organization_id)`. That sets the organization for one transaction, and every table then shows and accepts only that organization's rows. Outside it, tables return nothing.
- The one exception is `Database.resolve_number()`. A call arrives knowing only the dialed number, and this finds which business owns it.
- Migrations run as `receptionist_owner`, which owns the tables and isn't limited by the rules.
- `server/tests/db/test_tenancy.py` tries to read, write and link across businesses, and every attempt must fail.

## Resetting the local database

This deletes all local data:
```bash
docker compose -f infra/compose/dev.yml down -v && docker compose -f infra/compose/dev.yml up -d
```
