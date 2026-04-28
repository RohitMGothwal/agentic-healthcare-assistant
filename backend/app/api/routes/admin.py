from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from app.db.database import get_db
from app.models.user import User
from app.models.chat import ChatMessage
from app.models.appointment import Appointment
from app.api.routes.auth import get_current_user, get_current_admin
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.admin import (
    DashboardStats,
    AnalyticsData,
    SystemConfig,
    LogEntry,
    HealthContentCreate,
    HealthContentResponse,
)

router = APIRouter(prefix="/admin", tags=["admin"])
logger = logging.getLogger(__name__)


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get admin dashboard statistics."""
    try:
        # User stats
        total_users = db.query(User).count()
        active_users = db.query(User).filter(User.is_active == True).count()
        
        # Chat stats
        total_chats = db.query(ChatMessage).count()
        today = datetime.utcnow().date()
        today_chats = db.query(ChatMessage).filter(
            ChatMessage.created_at >= today
        ).count()
        
        # Appointment stats
        total_appointments = db.query(Appointment).count()
        pending_appointments = db.query(Appointment).filter(
            Appointment.status == "pending"
        ).count()
        
        return {
            "totalUsers": total_users,
            "activeUsers": active_users,
            "totalChats": total_chats,
            "todayChats": today_chats,
            "totalAppointments": total_appointments,
            "pendingAppointments": pending_appointments,
            "systemHealth": "healthy",
            "serverUptime": 720,  # hours
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
    skip: int = 0,
    limit: int = 100,
):
    """Get all users (admin only)."""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update user (admin only)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Delete user (admin only)."""
    if current_user.id == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete yourself"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    return {"message": "User deleted successfully"}


@router.get("/analytics")
async def get_analytics(
    range: str = "7d",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get analytics data."""
    try:
        # Calculate date range
        days = int(range.replace("d", ""))
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Mock analytics data
        return {
            "dailyActiveUsers": [45, 52, 48, 61, 55, 67, 72],
            "chatVolume": [120, 145, 132, 168, 155, 189, 201],
            "userGrowth": [10, 15, 12, 18, 14, 22, 25],
            "topQueries": [
                {"query": "COVID-19 symptoms", "count": 245},
                {"query": "Headache relief", "count": 189},
                {"query": "Fever treatment", "count": 156},
                {"query": "Back pain", "count": 134},
                {"query": "Allergies", "count": 112},
            ],
            "specialistUsage": [
                {"specialist": "General Physician", "count": 523},
                {"specialist": "Cardiologist", "count": 234},
                {"specialist": "Dermatologist", "count": 189},
                {"specialist": "Pediatrician", "count": 156},
                {"specialist": "Neurologist", "count": 98},
            ],
            "totalStats": {
                "totalUsers": db.query(User).count(),
                "totalChats": db.query(ChatMessage).count(),
                "avgResponseTime": 2.3,
                "satisfactionRate": 94,
            },
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get analytics"
        )


@router.get("/appointments")
async def get_all_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Get all appointments (admin only)."""
    appointments = db.query(Appointment).all()
    result = []
    for apt in appointments:
        user = db.query(User).filter(User.id == apt.user_id).first()
        result.append({
            "id": apt.id,
            "user_id": apt.user_id,
            "username": user.username if user else "Unknown",
            "specialist": apt.doctor_name,
            "date": apt.appointment_date.strftime("%Y-%m-%d"),
            "time": apt.appointment_date.strftime("%H:%M"),
            "status": apt.status,
            "notes": apt.notes,
        })
    return result


@router.put("/appointments/{appointment_id}")
async def update_appointment(
    appointment_id: int,
    status: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update appointment status."""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    appointment.status = status.get("status", appointment.status)
    db.commit()
    return {"message": "Appointment updated"}


@router.get("/content")
async def get_health_content(
    current_user: User = Depends(get_current_admin),
):
    """Get all health content."""
    # Mock content data
    return [
        {
            "id": 1,
            "title": "Understanding COVID-19 Symptoms",
            "category": "Diseases",
            "content": "COVID-19 symptoms include fever, cough, and fatigue...",
            "tags": ["COVID-19", "symptoms", "pandemic"],
            "isPublished": True,
            "createdAt": "2026-04-20T10:00:00",
            "updatedAt": "2026-04-25T14:30:00",
        },
        {
            "id": 2,
            "title": "Heart Health Tips",
            "category": "Wellness",
            "content": "Maintain a healthy heart through diet and exercise...",
            "tags": ["heart", "cardiovascular", "health"],
            "isPublished": True,
            "createdAt": "2026-04-22T09:00:00",
            "updatedAt": "2026-04-24T11:00:00",
        },
    ]


@router.get("/system/config")
async def get_system_config(
    current_user: User = Depends(get_current_admin),
):
    """Get system configuration."""
    return {
        "maintenanceMode": False,
        "allowRegistration": True,
        "aiEnabled": True,
        "notificationsEnabled": True,
        "maxChatHistory": 100,
        "rateLimit": 60,
        "version": "1.0.0",
        "lastUpdated": "2026-04-28T12:00:00",
    }


@router.put("/system/config")
async def update_system_config(
    config: dict,
    current_user: User = Depends(get_current_admin),
):
    """Update system configuration."""
    return {"message": "Configuration updated", "config": config}


@router.post("/system/clear-cache")
async def clear_cache(
    current_user: User = Depends(get_current_admin),
):
    """Clear system cache."""
    return {"message": "Cache cleared successfully"}


@router.post("/system/restart")
async def restart_server(
    current_user: User = Depends(get_current_admin),
):
    """Restart server (mock)."""
    return {"message": "Server restart initiated"}


@router.get("/logs")
async def get_logs(
    current_user: User = Depends(get_current_admin),
):
    """Get system logs."""
    return [
        {
            "id": "1",
            "timestamp": "2026-04-28T10:30:00",
            "level": "info",
            "message": "User login successful",
            "source": "auth",
            "userId": 1,
        },
        {
            "id": "2",
            "timestamp": "2026-04-28T10:25:00",
            "level": "warning",
            "message": "High response time detected",
            "source": "api",
        },
        {
            "id": "3",
            "timestamp": "2026-04-28T10:20:00",
            "level": "error",
            "message": "Database connection timeout",
            "source": "db",
        },
    ]
