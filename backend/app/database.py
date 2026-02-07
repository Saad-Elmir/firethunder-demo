import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.config import get_database_url
from app.models import Base  
import app.models  # force registration of tables in Base.metadata

logger = logging.getLogger("db")

DATABASE_URL = get_database_url()

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

def init_db() -> None:
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
