from functools import lru_cache
from typing import List, Optional

from pydantic import AnyHttpUrl, Field, PostgresDsn, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        env_ignore_empty=True,
    )

    app_name: str = "Lead Nexus"
    environment: str = "development"
    api_v1_prefix: str = "/api"
    secret_key: str = Field(default="super-secret-change-me")
    access_token_expire_minutes: int = 60 * 24
    algorithm: str = "HS256"

    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_db: str = "lead_nexus"

    database_url_env: Optional[str] = Field(default=None, alias="database_url")

    # cors_origins_list_internal won't match CORS_ORIGINS env var
    # We use cors_origins_str to read from CORS_ORIGINS env var
    cors_origins_list_internal: List[AnyHttpUrl] = Field(default_factory=list, exclude=True)
    cors_origins_str: Optional[str] = Field(default=None, validation_alias="CORS_ORIGINS")

    fastapi_admin_secret: str = Field(default="admin-secret")

    @computed_field
    @property
    def database_url(self) -> str:
        if self.database_url_env:
            return self.database_url_env
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )
    
    @computed_field
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS_ORIGINS from comma-separated string or use list"""
        if self.cors_origins_str:
            return [origin.strip() for origin in self.cors_origins_str.split(",") if origin.strip()]
        return [str(origin) for origin in self.cors_origins_list_internal] if self.cors_origins_list_internal else []


@lru_cache
def get_settings() -> Settings:
    return Settings()


