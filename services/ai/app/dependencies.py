from app.config import Settings, get_settings


def get_app_settings() -> Settings:
    """FastAPI dependency that returns the settings singleton."""
    return get_settings()


async def get_db_session():
    """FastAPI dependency that yields a database session.

    This will be implemented once the database layer is set up.
    For now it yields None as a placeholder so routers can already
    declare the dependency in their signatures.
    """
    yield None
