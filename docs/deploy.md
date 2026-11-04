# Deploying

The receptionist runs on one server, as `docs/architecture.md` plans for launch: Docker Compose (`infra/compose/prod.yml`) runs
- the api, with live calls inside it;
- Postgres;
- a daily database backup;
- Caddy, which serves HTTPS with certificates it gets and renews itself.

Telnyx sends each call's audio to `wss://<your host>/telnyx/media/<token>` through Caddy. Nothing else is public: the browser test page is hidden behind Caddy, and the database has no port on the internet.

The business dashboard and the landing page aren't part of this yet: callers and owners don't need them for a pilot.

## What you need

- **A Linux server:** Ubuntu 24.04 on x86-64 (what's tested), 2 vCPUs and 4 GB of memory, with a public IPv4 address.
  - Put it in US East, near the US servers of Telnyx, Deepgram, Cartesia and Anthropic, which keeps replies quick for a US number.
  - For example an AWS EC2 `t3.medium` in `us-east-1` (`docs/architecture.md`'s choice), or any VPS with those specs.
  - Open ports 22 (SSH), 80 and 443.
- **A hostname pointing at the server's IP address:** an A record such as `calls.yourdomain.com`. Without a domain, use the IP with dashes plus `.sslip.io`. For example `3-91-20-7.sslip.io` points at 3.91.20.7 with no setup.
- **The keys** from your local `apps/server/.env`.

## First deploy

On the server:

1. Install Docker Engine and its Compose plugin: [docs.docker.com/engine/install/ubuntu](https://docs.docker.com/engine/install/ubuntu/).
2. Get the code and make a shortcut for the commands below:
   ```bash
   git clone https://github.com/adilkadivala/ai-receptionist.git && cd ai-receptionist
   alias dc='docker compose --env-file apps/server/.env -f infra/compose/prod.yml'
   ```
3. Copy your local `apps/server/.env` to `apps/server/.env` on the server, for example with `scp`, and change these lines. It never goes in git.
   - `PUBLIC_HOST`: the hostname, without `https://`.
   - `MEDIA_STREAM_TOKEN`: a new one for production.
   - `POSTGRES_PASSWORD`, `DB_OWNER_PASSWORD`, `DB_APP_PASSWORD`: three new, different passwords.

   Make each token and password with `python3 -c "import secrets; print(secrets.token_urlsafe(24))"`. Those use only letters, digits, `-` and `_`, so they fit in the database URLs.

   Also check the business's settings (`BUSINESS_NAME`, `BUSINESS_NUMBER`, `TRANSFER_NUMBER`, `BUSINESS_INFO_FILE`, languages, owner email and WhatsApp), as `docs/development.md` describes them. A `BUSINESS_INFO_FILE` must be inside `apps/server` on the server too.
4. Start everything:
   ```bash
   dc up -d --build
   ```
   - The first build downloads about 350 MB and takes a few minutes.
   - Postgres creates its roles from the passwords on its first start.
   - The `migrate` service creates the tables before the api starts.
   - Caddy gets the HTTPS certificate within a minute once the hostname points at the server.
5. Check it:
   ```bash
   curl https://calls.yourdomain.com/api/health
   ```
   It answers `{"ok":true,"missing":[]}`. Anything in `missing` is a key the phone calls still need.
6. Add the business, so its calls are saved:
   ```bash
   dc exec api python -m scripts.add_business
   ```
7. Point the Telnyx number at the server. Print the TeXML for this host and token, then paste it into the number's TeXML bin in the Telnyx portal, replacing the ngrok one:
   ```bash
   dc exec api python -m voice.texml
   ```
   With `TRANSFER_NUMBER` set, the TeXML also rings that phone whenever the server drops a call, so a call cut by a deploy or an outage should reach a person. Print and paste it again whenever `TRANSFER_NUMBER` or the host changes.

## Talking to it without a phone

The browser test page answers only on the server itself. Forward the port over SSH:
```bash
ssh -L 8000:localhost:8000 you@calls.yourdomain.com
```
Then open `http://localhost:8000/dev/call` in your browser. It's the same receptionist and database that phone calls reach.

## Every day

- **Logs:** `dc logs -f api`. Each call's transcript, its saving and the owner's messages are logged there.
- **Saved calls:**
  ```bash
  dc exec postgres psql -U postgres receptionist -c "SELECT started_at, from_number, duration_seconds, outcome, summary->>'headline' FROM calls ORDER BY started_at DESC LIMIT 20"
  ```
- **Update:** `git pull && dc up -d --build`. This restarts the api, which **cuts calls in progress**, so deploy when the line is quiet.
- **Backups:** a dump of the database is made every day, and the last 14 days are kept in the `backups` volume.
  - They're on the same disk as the database, so copy them off the server now and then:
    ```bash
    dc cp backup:/backups ./backups
    ```
  - To restore a dump into an empty database:
    ```bash
    gunzip -c receptionist-<date>.sql.gz | dc exec -T postgres psql -U postgres receptionist
    ```

## Not covered yet

- **Calls cut on deploy:** deploys don't wait for calls in progress to end. With `TRANSFER_NUMBER` set those callers should be rung through to it, which no live call has confirmed yet. `docs/architecture.md` plans voice to drain calls instead.
- **No staging server, and no images built by CI.** The server builds its own image.
- **The database lives on the server:** a lost disk loses everything since the last copy you took off the server. A managed database such as RDS adds point-in-time recovery.
- **No monitoring:** nothing alerts you when the server is down. An uptime check on `/api/health` is the cheapest start.
