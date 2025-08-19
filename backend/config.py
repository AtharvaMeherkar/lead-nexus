import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv


# Load env from project root and backend directory
# Load from several common names to be Windows-friendly
load_dotenv()  # current working directory
for name in (".env", "ENV", "ENV.example"):
    candidate = Path(__file__).parent / name
    if candidate.exists():
        load_dotenv(dotenv_path=candidate, override=False)


@dataclass
class Settings:
    """Application configuration settings."""
    
    secret_key: str = os.getenv("SECRET_KEY", "change-me-in-production")
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///lead_nexus.db")
    cors_origins: str = os.getenv("CORS_ORIGINS", "http://localhost:5173")
    
    # Payment system is now mock-only
    payments_provider: str = "mock"


settings = Settings()


