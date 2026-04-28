from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.api.routes import auth, chat, appointments, health_report, notifications, chatbot, outbreaks
from app.core.config import settings
from app.db.database import engine, Base

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")
    yield

app = FastAPI(title=settings.app_name, version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.api_version}/auth", tags=["auth"])
app.include_router(chat.router, prefix=f"{settings.api_version}/chat", tags=["chat"])
app.include_router(appointments.router, prefix=f"{settings.api_version}/appointments", tags=["appointments"])
app.include_router(health_report.router, prefix=f"{settings.api_version}/health-report", tags=["health-report"])
app.include_router(notifications.router, prefix=f"{settings.api_version}/notifications", tags=["notifications"])
app.include_router(chatbot.router, prefix=f"{settings.api_version}/chatbot", tags=["chatbot"])
app.include_router(outbreaks.router, prefix=f"{settings.api_version}/outbreaks", tags=["outbreaks"])


@app.get("/")
async def root():
    return {"status": "ok", "message": "Agentic Healthcare API is running"}
