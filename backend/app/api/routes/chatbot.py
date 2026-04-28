from fastapi import APIRouter, HTTPException, Depends, Request, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.chat import ChatMessage
from app.services.whatsapp_service import WhatsAppService
from app.services.sms_service import SMSService
from app.services.health_ai_service import HealthAIService
from app.core.config import settings
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

class WhatsAppMessage(BaseModel):
    From: str
    Body: str
    MessageSid: Optional[str] = None
    ProfileName: Optional[str] = None

class SMSMessage(BaseModel):
    From: str
    Body: str
    MessageSid: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    language: str = "en"
    confidence: float = 0.0
    category: Optional[str] = None

# Initialize services
whatsapp_service = WhatsAppService()
sms_service = SMSService()
health_ai = HealthAIService()

@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Receive WhatsApp messages from Twilio webhook
    """
    try:
        form_data = await request.form()
        message_data = dict(form_data)
        
        phone_number = message_data.get('From', '').replace('whatsapp:', '')
        message_body = message_data.get('Body', '').strip()
        
        if not phone_number or not message_body:
            return {"status": "error", "message": "Invalid message data"}
        
        logger.info(f"Received WhatsApp from {phone_number}: {message_body}")
        
        # Process message with AI
        ai_response = await health_ai.process_health_query(
            message=message_body,
            phone_number=phone_number,
            channel="whatsapp"
        )
        
        # Send response back via WhatsApp
        background_tasks.add_task(
            whatsapp_service.send_message,
            phone_number,
            ai_response['message']
        )
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"WhatsApp webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/webhook/sms")
async def sms_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Receive SMS messages from Twilio webhook
    """
    try:
        form_data = await request.form()
        message_data = dict(form_data)
        
        phone_number = message_data.get('From', '')
        message_body = message_data.get('Body', '').strip()
        
        if not phone_number or not message_body:
            return {"status": "error", "message": "Invalid message data"}
        
        logger.info(f"Received SMS from {phone_number}: {message_body}")
        
        # Process message with AI (SMS has shorter responses)
        ai_response = await health_ai.process_health_query(
            message=message_body,
            phone_number=phone_number,
            channel="sms"
        )
        
        # Truncate for SMS if needed
        response_text = ai_response['message']
        if len(response_text) > 1600:  # Twilio SMS limit
            response_text = response_text[:1597] + "..."
        
        # Send response back via SMS
        background_tasks.add_task(
            sms_service.send_message,
            phone_number,
            response_text
        )
        
        return {"status": "success"}
        
    except Exception as e:
        logger.error(f"SMS webhook error: {str(e)}")
        return {"status": "error", "message": str(e)}

@router.post("/send-alert")
async def send_outbreak_alert(
    phone_numbers: List[str],
    message: str,
    channel: str = "whatsapp",  # "whatsapp" or "sms"
    background_tasks: BackgroundTasks = None
):
    """
    Send outbreak alerts to multiple users
    """
    try:
        if channel == "whatsapp":
            for phone in phone_numbers:
                background_tasks.add_task(
                    whatsapp_service.send_message,
                    phone,
                    f"🚨 HEALTH ALERT:\n\n{message}\n\nStay safe!"
                )
        else:
            for phone in phone_numbers:
                background_tasks.add_task(
                    sms_service.send_message,
                    phone,
                    f"HEALTH ALERT: {message[:140]}"
                )
        
        return {"status": "success", "recipients": len(phone_numbers)}
        
    except Exception as e:
        logger.error(f"Alert sending error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat-history/{phone_number}")
async def get_chat_history(
    phone_number: str,
    db: Session = Depends(get_db)
):
    """
    Get chat history for a phone number
    """
    messages = db.query(ChatMessage).filter(
        ChatMessage.phone_number == phone_number
    ).order_by(ChatMessage.created_at.desc()).limit(50).all()
    
    return {
        "phone_number": phone_number,
        "messages": [
            {
                "id": msg.id,
                "message": msg.message,
                "response": msg.response,
                "language": msg.language,
                "created_at": msg.created_at
            }
            for msg in messages
        ]
    }
