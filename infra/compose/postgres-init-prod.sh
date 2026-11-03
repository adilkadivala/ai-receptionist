#!/bin/sh
# Roles and database for production (prod.yml). Runs once, on an empty data volume, as the Postgres superuser.
# Same roles as postgres-init.sql, with the passwords from the server's .env instead of the development ones.
set -eu
psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -v owner_password="$DB_OWNER_PASSWORD" -v app_password="$DB_APP_PASSWORD" <<'SQL'
CREATE ROLE receptionist_owner LOGIN PASSWORD :'owner_password';
CREATE ROLE receptionist_app LOGIN PASSWORD :'app_password' NOSUPERUSER NOBYPASSRLS;
CREATE DATABASE receptionist OWNER receptionist_owner;
\connect receptionist
CREATE EXTENSION IF NOT EXISTS vector;
SQL
