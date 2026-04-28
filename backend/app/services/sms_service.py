import os
from twilio.rest import Client
import logging

logger = logging.getLogger(__name__)

class SMSService:
    def __init__(self):
        self.account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.sms_number = os.getenv('TWILIO_SMS_NUMBER')
        
        if self.account_sid and self.auth_token:
            self.client = Client(self.account_sid, self.auth_token)
        else:
            self.client = None
            logger.warning("Twilio SMS credentials not configured")
    
    async def send_message(self, to_number: str, message: str):
        """Send SMS via Twilio"""
        try:
            if not self.client:
                logger.error("Twilio client not initialized")
                return False
            
            # Ensure message is within SMS limits
            if len(message) > 1600:
                message = message[:1597] + "..."
            
            message = self.client.messages.create(
                from_=self.sms_number,
                body=message,
                to=to_number
            )
            
            logger.info(f"SMS sent: {message.sid}")
            return True
            
        except Exception as e:
            logger.error(f"Error sending SMS: {str(e)}")
            return False
    
    async def send_bulk_sms(self, phone_numbers: list, message: str):
        """Send bulk SMS to multiple recipients"""
        results = []
        for number in phone_numbers:
            result = await self.send_message(number, message)
            results.append({"number": number, "sent": result})
        return results
