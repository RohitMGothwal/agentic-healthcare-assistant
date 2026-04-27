from typing import List, Optional
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Agentic Healthcare API"
    api_version: str = "/api/v1"
    secret_key: str = "change-me-in-production"
    database_url: str = "sqlite:///./healthcare.db"
    cors_origins: List[str] = ["*"]
    openai_api_key: Optional[str] = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
