# Development

## Layout

| Folder | What | Dev URL |
|---|---|---|
| `apps/landing` | Next.js marketing site | http://localhost:3100 |
| `apps/dashboard` | React dashboard; `/api` is proxied to the api | http://localhost:5173 |
| `apps/server` | Python api, voice and worker | http://localhost:8000 |
| `packages/api-client` | TypeScript client generated from the api | — |
| `packages/ui` | Shared Tailwind theme | — |

## Setup (once)

You need Docker, [uv](https://docs.astral.sh/uv/), Node 22.22+ and pnpm 11.

1. Start the local database: Postgres 17 with pgvector, on port 5433.
   ```bash
   docker compose -f infra/compose/dev.yml up -d
   ```
2. Install the server's Python packages: about 500 MB of libraries, no AI models.
   ```bash
   cd apps/server && uv sync
   ```
3. Create the tables.
   ```bash
   cd apps/server && uv run alembic upgrade head
   ```
4. Install the frontend packages: about 500 MB in `node_modules`, mostly hard links into pnpm's shared store, so repeat installs download little.
   ```bash
   pnpm install
   ```

## Running

Each app runs in its own terminal:
```bash
cd apps/server && uv run uvicorn api.main:app --reload --port 8000
```
```bash
pnpm dev:dashboard
```
```bash
pnpm dev:landing
```

The dashboard's Overview page shows whether it can reach the api and which provider keys are missing.

## Every day

Run the same checks CI runs.

Server:
```bash
cd apps/server && uv run ruff check . && uv run ruff format --check . && uv run pytest -q
```

Frontends:
```bash
pnpm check && pnpm typecheck && pnpm test && pnpm build
```

- `pnpm fix` applies Biome's formatting and import order.
- The database tests use their own database, `receptionist_test`. They skip themselves if Postgres isn't running. CI sets `REQUIRE_DB=1`, so there they fail instead.

## Changing the api

After adding or changing an api route or its response model, regenerate the dashboard's client:
```bash
pnpm api:generate
```
This writes `packages/api-client/openapi.json` from the server, then `src/schema.d.ts` from that. Commit both. CI fails if either is out of date. In the dashboard, `api.GET("/api/...")` is then typed end to end.

## Changing the database

1. Edit `apps/server/core/models.py`.
2. Generate a migration:
   ```bash
   cd apps/server && uv run alembic revision --autogenerate -m "what changed"
   ```
3. Read the migration it generated. A new table that belongs to an organization also needs a row-level security policy and a grant for the app role. Copy the pattern in `migrations/versions/0001_foundation.py`.

## How each business's data is kept apart

- The api, voice and worker processes connect as `receptionist_app`, which can't bypass row-level security.
- All work for a business runs inside `Database.tenant(organization_id)`. That sets the organization for one transaction, so every table shows and accepts only that organization's rows. Outside it, tables return nothing.
- The one exception is `Database.resolve_number()`. A call arrives knowing only the dialed number, and this finds which business owns it. Future cross-organization work, such as claiming jobs or rolling up usage, follows the same pattern: a narrow `SECURITY DEFINER` function, never a role that bypasses the rules.
- Migrations run as `receptionist_owner`, which owns the tables and isn't limited by the rules.
- `apps/server/tests/db/test_tenancy.py` tries to read, write and link across businesses, and every attempt must fail.

## Supply-chain safety

`pnpm-workspace.yaml` sets `minimumReleaseAge` to 7 days. pnpm won't install a version published more recently than that, which gives the community time to catch a bad or hijacked release. If you need a newer version urgently, wait or add a reviewed exception.

## Resetting the local database

This deletes all local data:
```bash
docker compose -f infra/compose/dev.yml down -v && docker compose -f infra/compose/dev.yml up -d
```
