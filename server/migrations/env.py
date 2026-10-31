"""Alembic environment. Migrations run as the owner role (MIGRATION_DATABASE_URL), never the app role.

Tests pass a different URL through `config.attributes["url"]`.
"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from core.config import get_settings
from core.models import Base

config = context.config
if config.config_file_name is not None and config.attributes.get("configure_logger", True):
    fileConfig(config.config_file_name)

url = config.attributes.get("url") or get_settings().migration_database_url


def run_migrations_offline() -> None:
    context.configure(url=url, target_metadata=Base.metadata, literal_binds=True, dialect_opts={"paramstyle": "named"})
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    engine = create_engine(url, poolclass=pool.NullPool)
    with engine.connect() as connection:
        context.configure(connection=connection, target_metadata=Base.metadata)
        with context.begin_transaction():
            context.run_migrations()
    engine.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
