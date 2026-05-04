from typing import List, Optional
from pydantic_settings import BaseSettings
import os


class Settings(BaseSettings):
    app_name: str = "Agentic Healthcare API"
    api_version: str = "/api/v1"
    secret_key: str = "change-me-in-production"
    # Use PostgreSQL if available, otherwise fallback to SQLite
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./healthcare.db")
    cors_origins: List[str] = ["*"]
    openai_api_key: Optional[str] = None
    
    # AI Provider Configuration
    ai_provider: str = os.getenv("AI_PROVIDER", "groq")  # Options: openai, groq, ollama
    
    # Groq Configuration
    groq_api_key: Optional[str] = os.getenv("GROQ_API_KEY")
    groq_model: str = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    
    # Ollama Configuration
    use_ollama: bool = False
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "llama2"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
