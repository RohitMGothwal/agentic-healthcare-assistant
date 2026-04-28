from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List
from app.db.database import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse
from app.api.routes.auth import oauth2_scheme
from app.core.security import decode_token
from app.services.health_ai_service import HealthAIService
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Health AI Service
health_ai = HealthAIService()


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    from jose import JWTError
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_token(token)
        if payload is None:
            raise credentials_exception
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user


@router.get("/", response_model=List[ChatMessageResponse])
async def get_chat_history(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    messages = db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).order_by(ChatMessage.created_at).all()
    return messages


@router.post("/", response_model=ChatMessageResponse)
async def send_chat(
    message: ChatMessageCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    try:
        # Save user message
        user_message = ChatMessage(
            user_id=current_user.id,
            message=message.message,
            is_user=1
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # Generate AI response using Health AI Service
        try:
            ai_result = await health_ai.process_health_query(
                message=message.message,
                phone_number=current_user.username,  # Using username as identifier
                channel="app"
            )
            ai_response = ai_result.get("message", "I'm sorry, I couldn't process your query.")
        except Exception as ai_error:
            logger.error(f"AI processing error: {str(ai_error)}")
            ai_response = "I'm experiencing technical difficulties. Please try again later."
        
        # Save AI response
        bot_message = ChatMessage(
            user_id=current_user.id,
            message=ai_response,
            is_user=0,
            response=ai_response
        )
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)
        
        return bot_message
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to process message")
