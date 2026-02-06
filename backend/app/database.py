import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import get_database_url

logger = logging.getLogger("db")

DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,  # évite les connexions mortes
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
