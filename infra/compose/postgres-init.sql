-- Roles and databases for local development and CI. Run once, as the Postgres superuser.
--
-- receptionist_owner  owns the tables and runs migrations. Row-level security doesn't apply to it.
-- receptionist_app    what the api, voice and worker processes connect as. Not a superuser and
--                     can't bypass row-level security, so every query only sees one organization.
-- The passwords are for local use only; production roles are created with their own secrets.

CREATE ROLE receptionist_owner LOGIN PASSWORD 'owner-dev';
CREATE ROLE receptionist_app LOGIN PASSWORD 'app-dev' NOSUPERUSER NOBYPASSRLS;

CREATE DATABASE receptionist OWNER receptionist_owner;
CREATE DATABASE receptionist_test OWNER receptionist_owner;

-- pgvector needs a superuser to install; the knowledge search will use it.
\connect receptionist
CREATE EXTENSION IF NOT EXISTS vector;
\connect receptionist_test
CREATE EXTENSION IF NOT EXISTS vector;
