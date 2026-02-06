import os
from dotenv import load_dotenv

# Charge le .env à la racine du projet (../.env depuis backend/)
load_dotenv(
    dotenv_path=os.path.join(os.path.dirname(__file__), "..", "..", ".env"),
    override=True
)


def get_database_url() -> str:
    host = os.getenv("POSTGRES_HOST", "127.0.0.1")
    port = os.getenv("POSTGRES_PORT", "5432")
    db = os.getenv("POSTGRES_DB")
    user = os.getenv("POSTGRES_USER")
    password = os.getenv("POSTGRES_PASSWORD")

    # On force une erreur claire si une variable manque
    missing = [k for k, v in {
        "POSTGRES_DB": db,
        "POSTGRES_USER": user,
        "POSTGRES_PASSWORD": password,
    }.items() if not v]

    if missing:
        raise RuntimeError(f"Missing env vars: {', '.join(missing)}")

    return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"
