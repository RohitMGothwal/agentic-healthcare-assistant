from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import auth, chat, appointments, health_report, notifications
from app.core.config import settings

app = FastAPI(title=settings.app_name, version="1.0.0")

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


@app.get("/")
async def root():
    return {"status": "ok", "message": "Agentic Healthcare API is running"}
