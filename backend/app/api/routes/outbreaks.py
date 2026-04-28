from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
from datetime import datetime
from app.db.database import get_db
from app.models.user import User
from app.services.health_database_service import HealthDatabaseService
from app.services.whatsapp_service import WhatsAppService
from app.services.sms_service import SMSService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class OutbreakAlert(BaseModel):
    disease: str
    location: str
    cases: int
    severity: str = "medium"  # low, medium, high
    precautions: str
    start_date: Optional[datetime] = None

class OutbreakResponse(BaseModel):
    id: int
    disease: str
    location: str
    cases: int
    severity: str
    status: str
    created_at: datetime

health_db = HealthDatabaseService()
whatsapp_service = WhatsAppService()
sms_service = SMSService()

@router.post("/alerts/create")
async def create_outbreak_alert(
    alert: OutbreakAlert,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Create a new outbreak alert and notify users
    """
    try:
        # Save outbreak to database
        await health_db.report_outbreak(
            disease=alert.disease,
            location=alert.location,
            cases=alert.cases
        )
        
        # Get all users in affected area
        # In production, filter by location
        users = db.query(User).all()
        
        # Prepare alert message
        alert_message = f"""🚨 HEALTH ALERT 🚨

Disease: {alert.disease}
Location: {alert.location}
Cases Reported: {alert.cases}
Severity: {alert.severity.upper()}

Precautions:
{alert.precautions}

Stay safe! For more info, reply OUTBREAK or call 104."""
        
        # Send notifications to all users
        phone_numbers = [user.phone_number for user in users if hasattr(user, 'phone_number') and user.phone_number]
        
        if phone_numbers:
            background_tasks.add_task(
                send_bulk_alerts,
                phone_numbers,
                alert_message
            )
        
        return {
            "status": "success",
            "message": f"Outbreak alert created and {len(phone_numbers)} users notified",
            "alert": alert
        }
        
    except Exception as e:
        logger.error(f"Outbreak alert creation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/active")
async def get_active_outbreaks(
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all active outbreak alerts
    """
    try:
        outbreaks = await health_db.get_active_outbreaks(region)
        return {
            "status": "success",
            "count": len(outbreaks),
            "outbreaks": outbreaks
        }
        
    except Exception as e:
        logger.error(f"Active outbreaks retrieval error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts/{outbreak_id}")
async def get_outbreak_details(
    outbreak_id: int,
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific outbreak
    """
    try:
        # In production, fetch from database
        return {
            "id": outbreak_id,
            "status": "active",
            "details": "Outbreak details would be fetched from database"
        }
        
    except Exception as e:
        logger.error(f"Outbreak details error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/alerts/{outbreak_id}/resolve")
async def resolve_outbreak(
    outbreak_id: int,
    db: Session = Depends(get_db)
):
    """
    Mark an outbreak as resolved
    """
    try:
        # In production, update database
        return {
            "status": "success",
            "message": f"Outbreak {outbreak_id} marked as resolved"
        }
        
    except Exception as e:
        logger.error(f"Outbreak resolution error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics")
async def get_health_statistics(
    region: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get health statistics from government databases
    """
    try:
        stats = await health_db.get_health_statistics(region)
        return {
            "status": "success",
            "statistics": stats
        }
        
    except Exception as e:
        logger.error(f"Health statistics error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/centers/nearby")
async def get_nearby_health_centers(
    latitude: float,
    longitude: float,
    radius: int = 10,  # km
    db: Session = Depends(get_db)
):
    """
    Get nearby health centers using government health facility database
    """
    try:
        centers = await health_db.get_nearby_health_centers(latitude, longitude)
        return {
            "status": "success",
            "count": len(centers),
            "centers": centers
        }
        
    except Exception as e:
        logger.error(f"Health centers error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def send_bulk_alerts(phone_numbers: List[str], message: str):
    """Send alerts to multiple phone numbers"""
    for phone in phone_numbers:
        try:
            # Try WhatsApp first, fallback to SMS
            success = await whatsapp_service.send_message(phone, message)
            if not success:
                await sms_service.send_message(phone, message[:1600])
        except Exception as e:
            logger.error(f"Failed to send alert to {phone}: {str(e)}")
