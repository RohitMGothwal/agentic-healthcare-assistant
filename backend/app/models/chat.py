from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.db.database import Base


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Nullable for WhatsApp/SMS users
    phone_number = Column(String, nullable=True)  # For WhatsApp/SMS integration
    message = Column(Text, nullable=False)
    is_user = Column(Integer, default=1)  # 1 for user, 0 for bot
    response = Column(Text, nullable=True)
    language = Column(String, default="en")  # Detected language
    channel = Column(String, default="app")  # app, whatsapp, sms
    created_at = Column(DateTime(timezone=True), server_default=func.now())
