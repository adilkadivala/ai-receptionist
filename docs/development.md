# Development

## Layout

| Folder | What | Dev URL |
|---|---|---|
| `apps/landing` | Next.js marketing site | http://localhost:3100 |
| `apps/dashboard` | React dashboard; `/api` is proxied to the api | http://localhost:5173 |
| `apps/server` | Python api, voice and worker | http://localhost:8000 |
| `packages/api-client` | TypeScript client generated from the api | — |
| `packages/ui` | shadcn/ui components, shared blocks and theme for both frontends | — |
| `packages/product` | Plans, prices and languages both frontends show | — |

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
   Then, once `BUSINESS_NUMBER` is set (see "Saving calls" below), add the business so its calls are saved:
   ```bash
   cd apps/server && uv run python -m scripts.add_business
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

If port 8000 is taken by another project, run the api on another port and point the dashboard at it:
```bash
API_URL=http://localhost:8001 pnpm dev:dashboard
```

## Talking to the receptionist without a phone

With the api running, open `http://localhost:<port>/dev/call` (for example `http://localhost:8000/dev/call`) in a browser on the same computer and press **Start call**. You talk through the microphone to the same listening, AI and voice as a phone call; only the phone line is missing, so it works without Telnyx, a phone number or call charges. It needs `DEEPGRAM_API_KEY` and `CARTESIA_API_KEY`, plus Anthropic credentials. When you hang up, the transcript is in the api's log, the call is saved as a call to `BUSINESS_NUMBER` (below), and the summary goes to the owner by email and on WhatsApp if they're set up.

The page and its `/dev/call/offer` endpoint answer only requests made on this computer. Through a tunnel such as ngrok they return 404, so nobody else can start calls that spend our API minutes.

## Answering as a real business

Until each business's settings come from the database, the server answers for one business set in `apps/server/.env`:
- `BUSINESS_NAME`: the name in the greeting and the prompt.
- `BUSINESS_INFO_FILE`: a text file of what the receptionist may tell callers (services, hours, area, prices, how booking works), relative to `apps/server`, in the same shape as `DEMO_BUSINESS_INFO` in `voice/prompt.py`. Without it, it plays the demo plumber. The server refuses to start if the file is missing.
- `ANNOUNCE_RECORDING=true` adds "this call may be recorded" to the AI notice. Leave it off until calls are actually recorded.
- `CALLER_LANGUAGES`: the languages its callers mostly speak, English first (`en,es` by default, `en,hi` for an Indian business). They steer the listening, and the greeting offers the second one.
- `BUSINESS_COUNTRY`: where it is (`US`, `CA`, `IN`…). A caller's number without a country code is taken as a local one, checked for length and read back in that country's groups. Spoken digits are counted in code (`voice/numbers.py`), not by the AI, which miscounts them.
- `TTS_VOICE_ID` and `VOICE_GENDER`: the Cartesia voice, and whether it's a woman's or a man's, which Hindi, Arabic and French grammar follow. A voice native to the callers' main language sounds most natural and speaks English in the same accent. The landing page's demo voices (`apps/landing/scripts/demo-voices.json`) are a good place to start.

Restart the api after changing them.

### From the business's website

To give a prospect a demo answering as their business, let Claude read their website and write the business-info file:
```bash
cd apps/server && uv run python -m scripts.import_website https://brightpipes.com
```
- Claude (`claude-opus-5-5`) reads up to 15 pages of that site and only that site: services, prices, hours, contact, areas served, booking, FAQs, and the shipping, returns and cancellation policies. Anthropic's servers fetch the pages, through the API's web fetch tool.
- It writes `business-info/<domain>.txt` in `apps/server` (kept out of git), with the questions callers ask that the site answers, and prints what it couldn't confirm, the tokens used, and the two `.env` lines to set.
- **Read the file and fix it before anyone calls**: websites go out of date, and the receptionist answers from this file as if it were true.
- A site that builds its pages with JavaScript can come back nearly empty. Then write the file by hand.

## Putting emergencies through to a person

Set `TRANSFER_NUMBER` in `apps/server/.env` to the phone of whoever handles emergencies, with + and the country code. It must not be `BUSINESS_NUMBER`, or the call would come back to the receptionist. When harm or damage is happening now (a burst pipe, flooding), the receptionist asks for the caller's name and number if it doesn't have them, says it's putting them through, and calls its `transfer_call` tool. If anyone could be hurt, it first tells them to get safe and call emergency services. A caller who just wants a person, with no emergency, gets a message taken instead. Without `TRANSFER_NUMBER` it takes emergencies as messages, as before.

The handover stays inside TeXML, because Telnyx advises against mixing TeXML calls with Call Control commands. `voice/texml.py` puts a `<Dial>` to `TRANSFER_NUMBER` after the media stream, and Telnyx runs what follows the stream once it stops. Putting a caller through therefore means closing our stream without hanging up (`apps/server/voice/transfer.py`). Calls the AI ends itself are hung up first, so they never reach the `<Dial>`.
- The owner's phone shows `BUSINESS_NUMBER` as the caller, so they know it comes from the receptionist. It rings for 25 seconds; afterwards the caller hears that the team will call back.
- The same `<Dial>` should catch calls our server drops, when it's down or restarting, so those callers reach a person instead of silence.
- The number is in the TeXML, so after setting or changing it, print the TeXML again and paste it into the number's TeXML bin in the Telnyx portal:
  ```bash
  cd apps/server && uv run python -m voice.texml
  ```
- A browser test call can't be put through: it ends, and the api logs where a phone call would have gone.
- The call is saved with the outcome `transfer`. The owner's summary says it was put through and to call back if they missed it: nothing tells the server whether the owner answered.

Not yet tried on a live phone call: that Telnyx moves on to the `<Dial>` when we close the stream, and when our server can't be reached at all. Try both before relying on them: put a call through, then call once with the api stopped.

## Saving calls

Every call is saved in the `calls` table when it ends, phone or browser test: who called, the number dialed, when, how long, the language the caller ended in, the transcript, and once Claude has written it, the summary and the outcome (`message`, `answered`, `spam`, `transfer` when it was put through to `TRANSFER_NUMBER`, or `abandoned` when the caller said nothing). A call belongs to the business that owns the number dialed, looked up with `resolve_phone_number`, so the business and its number must be in the database first:
1. Set `BUSINESS_NUMBER` in `apps/server/.env`: the number callers dial, with + and the country code, such as `+16176656213`. Browser test calls count as calls to it.
2. Add the business: `cd apps/server && uv run python -m scripts.add_business`. It creates the organization (`BUSINESS_NAME`), its receptionist and its number, once; running it again changes nothing.

A call to a number that isn't in the database, or one the database can't take (it isn't running), isn't saved: the api logs why, and the owner still gets the summary. Saving happens in the background after the call, with the summary (`apps/server/voice/after_call.py`), so it never delays or breaks a call.

To look at the saved calls until the dashboard shows them:
```bash
docker compose -f infra/compose/dev.yml exec postgres psql -U postgres receptionist -c "SELECT started_at, from_number, duration_seconds, outcome, summary->>'headline' FROM calls ORDER BY started_at DESC LIMIT 10"
```

## Call summaries by email

After every call where the caller said something, phone or browser test, Claude (`LLM_MODEL`) writes a short summary in English: who called and the number they gave, what they need, how urgent it is, the outcome (callback, booking request, question answered, spam) and what the team must do next. [Resend](https://resend.com) emails it to the owner with the whole transcript below. Set all three in `apps/server/.env`, or no email is sent:
- `RESEND_API_KEY`: an API key from Resend. A key with "sending access" only is enough.
- `OWNER_EMAIL`: who gets the summaries.
- `SUMMARY_FROM_EMAIL`: the sender, such as `Receptionist <calls@yourdomain.com>`, on a domain verified in Resend. Resend's test sender, `onboarding@resend.dev`, only delivers to the address the Resend account was opened with, which is enough to try it.

If Claude can't write the summary, the email still goes with the transcript alone. If the email can't be sent, the api logs why; the transcript is in the log either way.

## Call summaries on WhatsApp

The same summary can also reach the owner on WhatsApp, a minute after the call, through Meta's [WhatsApp Cloud API](https://developers.facebook.com/documentation/business-messaging/whatsapp/get-started). Claude writes the summary once for both; either channel failing never stops the other. If there's no summary (Claude failed), there's no WhatsApp message: the email still carries the transcript.

WhatsApp lets a business message someone first only with a template Meta has approved, so the summary goes out as a **utility** template with named fields. To set it up:
1. On [developers.facebook.com](https://developers.facebook.com), create an app with the WhatsApp use case. It comes with a free test number that can message a few numbers you add as recipients, before any business verification. Note the test number's **Phone number ID**.
2. Add the owner's WhatsApp number as a recipient of the test number (WhatsApp sends it a code to confirm).
3. In [WhatsApp Manager](https://business.facebook.com/latest/whatsapp_manager/message_templates), create a template named `call_summary`, category **Utility**, language **English** (`en`), with named variables, and this body, giving each variable a sample value:
   ```text
   New call for {{business}}.
   Caller: {{caller}}
   Number: {{number}}
   Needs: {{need}}
   Urgency: {{urgency}}
   Next step: {{next_step}}
   Sent by your AI receptionist.
   ```
   Approval can take up to 24 hours; until then sends fail with Meta's error 132001.
4. Make a System User token in Business Settings (System users), with `whatsapp_business_messaging` permission on the app and the WhatsApp account. The temporary token on the app's setup page expires within hours.
5. Set in `apps/server/.env`, then restart the api:
   - `WHATSAPP_TOKEN`: the System User token.
   - `WHATSAPP_PHONE_NUMBER_ID`: the ID from step 1, not the number itself.
   - `OWNER_WHATSAPP`: the owner's number with + and the country code, such as `+919876543210`.
   - `WHATSAPP_TEMPLATE` and `WHATSAPP_TEMPLATE_LANGUAGE` only if the template isn't `call_summary` in `en`.

The sender (`apps/server/voice/whatsapp.py`) pins Graph API v26.0. Meta charges per delivered template message, by category and the recipient's country.

For now the summary is written and sent by the voice process itself (`apps/server/voice/after_call.py`), in the background after the call has been saved, so it never delays or breaks a call. A failed email isn't retried, and one in progress is lost if the api restarts; the call itself is already saved by then. `docs/architecture.md` plans it as the worker's `summarize_call` job, queued with the saved call, which fixes both.

## Deploying

`docs/deploy.md` puts the receptionist on a server with HTTPS, so Telnyx reaches it without ngrok and it answers while this computer is off.

## The admin pages (founders only)

An admin area in the dashboard shows every customer's data in one place, read from the database:
- **Overview** (`/admin`): how many customers there are; calls today, this week (from Monday) and in all, in your own time zone; talk minutes this week and in all; and every call by outcome.
- **Customers** (`/admin/customers`): every organization, newest first, with its plan, data region, HIPAA mode, numbers, receptionists, calls, minutes, last call and sign-up date. Search by name, receptionist or a few digits of a number.
- **A customer** (`/admin/customers/<id>`): its numbers and who answers each, its receptionists, then its calls, newest first, 25 to a page.
- **A call** opens in a sheet over the customer: from, to, language, start and end, length, outcome, cost, Claude's summary once there is one, and the whole transcript.

With the api and the dashboard running (above), open `http://localhost:5173/admin`. It's read only.

**There's no admin login yet, so it only works on this computer:**
- The `/api/admin/*` routes answer only requests addressed to localhost and not forwarded by a proxy, the same guard as the browser test call. Through ngrok or any other tunnel they return 404. The dashboard's dev server forwards `/api` without adding a forwarding header, so it works.
- Only development builds include the pages. `pnpm build` leaves them out, so customers never download them.
- **Before the api is deployed anywhere, a real admin login has to replace this guard**: a staff role on top of the planned users and memberships, checked on every admin route. Until then, never expose these routes.

**How it reads across customers without loosening row-level security:**
- The customer list and the totals are the only reads that cross organizations. They go through two `SECURITY DEFINER` functions, `admin_organizations()` and `admin_call_totals(time_zone)` (migration 0003), built like `resolve_phone_number`. They return names, plans, numbers, receptionist names and counts, never calls, and only the app role may run them. `Database.platform()` runs them in a read-only transaction with no organization set.
- One customer's numbers, receptionists and calls are read through `Database.tenant()`, like every other read. So a transcript never crosses organizations.
- Each time a call is opened, a row goes into that customer's `audit_log`: who (`admin on this computer` until there's a login), `call.transcript_viewed`, and the call. The app role can add to and read `audit_log`, never change or delete it.

The code: `apps/server/api/routes/admin.py`, `api/schemas/admin.py`, `repositories/admin.py`; `apps/dashboard/src/features/admin/`, `pages/admin/`, `layouts/AdminLayout.tsx`.

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
- The tests migrate that database down to nothing and back up to the newest migration they know. Two branches with different migrations sharing `receptionist_test` trip over each other's revisions, so a branch with a migration `main` doesn't have yet can use a database of its own: create it once (`CREATE DATABASE receptionist_mine OWNER receptionist_owner`, as the `postgres` user), then point the tests at it with `TEST_DATABASE_URL` and `TEST_MIGRATION_DATABASE_URL` (the same URLs as in `tests/db/conftest.py`, with your database's name).

## Changing the api

After adding or changing an api route or its response model, regenerate the dashboard's client:
```bash
pnpm api:generate
```
This writes `packages/api-client/openapi.json` from the server, then `src/schema.d.ts` from that. Commit both. CI fails if either is out of date. In the dashboard, `api.GET("/api/...")` is then typed end to end.

## UI components

Both frontends use [shadcn/ui](https://ui.shadcn.com) components (built on Base UI) from `packages/ui`.

Add a component:
```bash
pnpm ui:add dialog
```
This runs the shadcn CLI version pinned in the lockfile and writes the component to `packages/ui/src/components/`. Import it in either app:
```tsx
import { Button } from "@receptionist/ui/components/button";
```

- **Where code goes:**
  - shadcn's own components: `packages/ui/src/components/`, added with `pnpm ui:add`.
  - Our pieces that both apps use: `packages/ui/src/blocks/` (for example `Logo`, `PlanCard`, `Blueprint`, `Pattern`), imported from `@receptionist/ui/blocks/<name>`.
  - Pieces only one app uses: that app's own `components/` folder.
  - Plans, prices and languages: `@receptionist/product`, never copied into an app.
- **Check where new files land.** The CLI sometimes writes a hook or helper that a shared component needs into `apps/dashboard/src/hooks/` or `src/lib/`. Move it to `packages/ui/src/hooks/` or `src/lib/`, where the component imports it from.
- **Don't edit shadcn's files.** Biome skips `packages/ui/src/components/` and `hooks/`, and we leave them as shadcn wrote them, so `pnpm ui:add <name> --diff` shows only upstream changes. Change the look with the tokens in `packages/ui/src/styles/globals.css` (our brand blue is `--primary`) or by passing `className`.
- **Links that look like buttons** use `<a className={buttonVariants()}>`, not `<Button render={<a />}>`. Base UI's Button always sets `role="button"`, so screen readers would announce the link as a button.
- **Right-to-left is on** (`"rtl": true` in each `components.json`), so components use start/end instead of left/right. Arabic, Urdu and Hebrew pages will also need `dir="rtl"` and shadcn's direction setup ([RTL guide](https://ui.shadcn.com/docs/rtl)).
- **Fonts** are Geist and Geist Mono, bundled with `packages/ui`. Browsers download only the alphabets a page uses (Latin, Cyrillic, Vietnamese); Arabic, Hindi, Chinese and the other scripts fall back to system fonts. Keep that fallback in `--font-sans` when changing fonts.
- **Design:** match the approved mockups in `docs/design/`, and use the Tailwind classes in its README, never the hex values.

## Recording the landing page's demo voices

The live call demo on the landing page plays recordings of each line, made with Cartesia, the voice real callers hear. The recordings are committed in `apps/landing/public/demo-audio/`, so the site never needs the key. Until every line has one, the demo reads its lines with the visitor's browser voices instead, which sound different on every system and are missing for some languages (Chrome has no Arabic voice, so that call plays as text only and says so); the recordings replace them automatically once they're there.

After changing a line in `apps/landing/content/demo-calls.ts`, delete its file in `public/demo-audio/` (or pass `--force` to redo them all) and run:

```bash
pnpm --filter @receptionist/landing demo-audio
```

It reads `CARTESIA_API_KEY` from `apps/server/.env`. The voices it picked are saved in `apps/landing/scripts/demo-voices.json`; edit the IDs there to change one. The whole demo is about 2,000 characters, well under $1.

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
- The exceptions are narrow `SECURITY DEFINER` functions, never a role that bypasses the rules:
  - `Database.resolve_number()`: a call arrives knowing only the dialed number, and this finds which business owns it.
  - The admin pages' customer list and totals (above), run in `Database.platform()`, a read-only transaction with no organization set.

  Future cross-organization work, such as claiming jobs or rolling up usage, follows the same pattern.
- Migrations run as `receptionist_owner`, which owns the tables and isn't limited by the rules.
- `apps/server/tests/db/test_tenancy.py` tries to read, write and link across businesses, and every attempt must fail. `tests/db/test_admin.py` checks the admin's reads across them: only the app role may run the functions, the platform transaction sees no rows and can't write, and a call is found only under its own business.

## Supply-chain safety

`pnpm-workspace.yaml` sets `minimumReleaseAge` to 7 days. pnpm won't install a version published more recently than that, which gives the community time to catch a bad or hijacked release. If you need a newer version urgently, wait or add a reviewed exception.

## Resetting the local database

This deletes all local data:
```bash
docker compose -f infra/compose/dev.yml down -v && docker compose -f infra/compose/dev.yml up -d
```
