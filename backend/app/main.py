import logging
from fastapi import FastAPI # type: ignore
from sqlalchemy import text
from app.database import engine, init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(title="Demo API")

@app.on_event("startup")
def startup_db_check():
    try:
        safe_url = str(engine.url).replace(engine.url.password or "", "***")
        logger.info(f"DB engine url = {safe_url}")

        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection successful")
    except Exception as e:
        # IMPORTANT: Error Message
        logger.error("Database connection failed", exc_info=e)


@app.get("/health")
def health():
    return {"status": "UP"}



