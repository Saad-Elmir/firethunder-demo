import logging
from fastapi import FastAPI, Request # type: ignore
from sqlalchemy import text
from app.database import engine, init_db
from app.config import get_jwt_secret
from strawberry.fastapi import GraphQLRouter
from app.graphql_schema import schema
from fastapi import FastAPI, Request


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("app")

app = FastAPI(title="Demo API")

async def get_context(request: Request):
    return {"request": request}

graphql_app = GraphQLRouter(schema, context_getter=get_context)
app.include_router(graphql_app, prefix="/graphql")

@app.on_event("startup")
def startup_db_check():
    get_jwt_secret()  # Check JWT secret early for a clear error if missing
    try:
        init_db()  # Ensure tables are created and DB is reachable
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



