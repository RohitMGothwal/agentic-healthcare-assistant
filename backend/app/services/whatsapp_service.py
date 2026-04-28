import os
from twilio.rest import Client
from twilio.twiml.messaging_response import MessagingResponse
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class WhatsAppService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER')
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio credentials not configured")
    
    async def send_message(self, to_number: str, message: str):
        """Send WhatsApp message via Twilio"""
        try:
            if not self.client:
                logger.error("Twilio client not initialized")
                return False
            
            # Format number for WhatsApp
            if not to_number.startswith('whatsapp:'):
                to_number = f"whatsapp:{to_number}"
            
            if not self.whatsapp_number.startswith('whatsapp:'):
                from_number = f"whatsapp:{self.whatsapp_number}"
            else:
                from_number = self.whatsapp_number
            
            message = self.client.messages.create(
                from_=from_number,
                body=message,
                to=to_number
            )
            
            logger.info(f"WhatsApp message sent: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp message: {str(e)}")
            return False
    
    async def send_template_message(self, to_number: str, template_name: str, parameters: dict):
        """Send WhatsApp template message"""
        try:
            if not self.client:
                return False
            
            if not to_number.startswith('whatsapp:'):
                to_number = f"whatsapp:{to_number}"
            
            if not self.whatsapp_number.startswith('whatsapp:'):
                from_number = f"whatsapp:{self.whatsapp_number}"
            else:
                from_number = self.whatsapp_number
            
            message = self.client.messages.create(
                from_=from_number,
                content_sid=template_name,
                to=to_number
            )
            
            logger.info(f"WhatsApp template sent: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending WhatsApp template: {str(e)}")
            return False
