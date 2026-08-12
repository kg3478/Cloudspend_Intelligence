from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Literal, Union
from functools import lru_cache

class Settings(BaseSettings):
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "cloudspend"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    
    database_url_override: Optional[str] = None
    use_local_sqlite: bool = False

    redis_url: str = "redis://localhost:6379/0"
    arq_redis_url: str = "redis://localhost:6379/1"
    
    duckdb_path: str = "./data/cloudspend.duckdb"
    parquet_dir: str = "./data/parquet"
    
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-3.6-flash"
    
    jwt_secret_key: str = "secret"
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    
    app_env: Literal["development", "production", "test"] = "development"
    log_level: str = "INFO"
    cors_origins: Union[list[str], str] = ["http://localhost:3000"]

    @property
    def cors_origins_list(self) -> list[str]:
        if isinstance(self.cors_origins, list):
            return self.cors_origins
        if isinstance(self.cors_origins, str):
            return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        return ["http://localhost:3000"]
    
    admin_email: str = "admin@cloudspend.local"
    admin_password: str = "changeme"
    version: str = "0.1.0"
    
    model_config = SettingsConfigDict(env_file=(".env", "../.env"), env_file_encoding="utf-8", case_sensitive=False, extra="ignore")

    @property
    def database_url(self) -> str:
        if self.database_url_override:
            return self.database_url_override
        if self.use_local_sqlite or self.postgres_host in ("postgres", "localhost_sqlite", "sqlite"):
            return "sqlite+aiosqlite:///./data/cloudspend.db"
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        
    @property
    def sync_database_url(self) -> str:
        if self.use_local_sqlite or self.postgres_host in ("postgres", "localhost_sqlite", "sqlite"):
            return "sqlite:///./data/cloudspend.db"
        return f"postgresql+psycopg2://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

@lru_cache
def get_settings() -> Settings:
    return Settings()
