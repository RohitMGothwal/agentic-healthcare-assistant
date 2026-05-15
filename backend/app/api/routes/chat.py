from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List
from app.db.database import get_db
from app.models.chat import ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageCreate, ChatMessageResponse, SymptomAnalysisRequest, SymptomAnalysisResponse
from app.api.routes.auth import oauth2_scheme
from app.core.security import decode_token
from app.services.health_ai_service import HealthAIService
from app.services.local_health_ai_service import local_health_ai
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

# Initialize Health AI Services
health_ai = HealthAIService()


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Annotated[Session, Depends(get_db)]):
    from jwt import PyJWTError
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
    except PyJWTError:
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
        # Check for duplicate messages (same user, same message, within 5 seconds)
        from datetime import datetime, timedelta
        five_seconds_ago = datetime.utcnow() - timedelta(seconds=5)
        recent_duplicate = db.query(ChatMessage).filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.message == message.message,
            ChatMessage.is_user == 1,
            ChatMessage.created_at >= five_seconds_ago
        ).first()
        
        if recent_duplicate:
            logger.warning(f"Duplicate message detected from user {current_user.username}, ignoring")
            # Return the existing response if available
            existing_response = db.query(ChatMessage).filter(
                ChatMessage.user_id == current_user.id,
                ChatMessage.is_user == 0,
                ChatMessage.created_at >= recent_duplicate.created_at
            ).order_by(ChatMessage.created_at.desc()).first()
            
            if existing_response:
                return existing_response
        
        # Save user message
        user_message = ChatMessage(
            user_id=current_user.id,
            message=message.message,
            is_user=1,
            language=message.language or "en"
        )
        db.add(user_message)
        db.commit()
        db.refresh(user_message)
        
        # Generate AI response using Local Health AI Service (faster, no API costs)
        ai_response = None
        try:
            logger.info(f"Processing chat message for user {current_user.username}: {message.message[:50]}...")
            logger.info(f"Local AI knowledge base size: {len(local_health_ai.knowledge_base)} conditions")
            ai_result = await local_health_ai.chat(message=message.message)
            ai_response = ai_result.get("response", "I'm sorry, I couldn't process your query.")
            logger.info(f"Local AI response generated successfully")
        except Exception as ai_error:
            logger.error(f"Local AI processing error: {str(ai_error)}")
            logger.error(f"Error type: {type(ai_error)}")
            import traceback
            logger.error(f"Traceback: {traceback.format_exc()}")
            
            # Fallback to cloud AI if local fails
            try:
                ai_result = await health_ai.process_health_query(
                    message=message.message,
                    phone_number=current_user.username,
                    channel="app",
                    language=message.language
                )
                ai_response = ai_result.get("message", "I'm sorry, I couldn't process your query.")
            except Exception as cloud_error:
                logger.error(f"Cloud AI fallback error: {str(cloud_error)}")
                ai_response = "I'm experiencing technical difficulties. Please try again later."
        
        # Save AI response
        bot_message = ChatMessage(
            user_id=current_user.id,
            message=ai_response,
            is_user=0,
            response=ai_response,
            language=message.language or "en"
        )
        db.add(bot_message)
        db.commit()
        db.refresh(bot_message)
        
        return bot_message
        
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Chat processing error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to process message: {str(e)}")


@router.post("/analyze", response_model=SymptomAnalysisResponse)
async def analyze_symptoms(
    request: SymptomAnalysisRequest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """
    Analyze symptoms and return possible conditions
    """
    try:
        result = await local_health_ai.analyze_symptoms(request.symptoms)
        
        if not result or not result.get("possible_conditions"):
            return SymptomAnalysisResponse(
                conditions=[],
                disclaimer="No matching conditions found. Please consult a healthcare professional.",
                urgency="low"
            )
        
        # Determine overall urgency
        urgencies = [c.get("urgency", "Medium").lower() for c in result["possible_conditions"]]
        overall_urgency = "high" if "high" in urgencies else "medium" if "medium" in urgencies else "low"
        
        return SymptomAnalysisResponse(
            conditions=result["possible_conditions"],
            disclaimer=result.get("disclaimer", ""),
            urgency=overall_urgency
        )
        
    except Exception as e:
        logger.error(f"Symptom analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to analyze symptoms: {str(e)}")
