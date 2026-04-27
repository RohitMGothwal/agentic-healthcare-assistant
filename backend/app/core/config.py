from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Agentic Healthcare API"
    api_version: str = "/api/v1"
    secret_key: str = "change-me"
    database_url: Optional[str] = None
    cors_origins: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
