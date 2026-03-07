from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.config import get_settings

settings = get_settings()

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        # Auto-reconnect if connection drops
    pool_size=10,              # Max 10 persistent connections
    max_overflow=20            # Allow 20 extra during traffic spikes
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """Dependency injection — provides DB session to each request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()