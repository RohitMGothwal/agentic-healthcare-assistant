from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Annotated, List
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models.health_metric import HealthMetric
from app.models.user import User
from app.schemas.health_metric import HealthMetricCreate, HealthMetricResponse, HealthReport
from app.api.routes.auth import oauth2_scheme, decode_token

router = APIRouter()


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


@router.get("/", response_model=HealthReport)
async def get_health_report(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    # Get metrics from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    metrics = db.query(HealthMetric).filter(
        HealthMetric.user_id == current_user.id,
        HealthMetric.recorded_at >= thirty_days_ago
    ).order_by(HealthMetric.recorded_at.desc()).all()
    
    return {"metrics": metrics}


@router.post("/", response_model=HealthMetricResponse)
async def create_health_metric(
    metric: HealthMetricCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    db_metric = HealthMetric(
        user_id=current_user.id,
        metric_name=metric.metric_name,
        value=metric.value,
        unit=metric.unit,
        recorded_at=metric.recorded_at
    )
    db.add(db_metric)
    db.commit()
    db.refresh(db_metric)
    return db_metric


@router.get("/summary")
async def get_health_summary(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)]
):
    """Get latest values for common metrics"""
    metrics = db.query(HealthMetric).filter(
        HealthMetric.user_id == current_user.id
    ).order_by(HealthMetric.recorded_at.desc()).all()
    
    # Get latest for each metric type
    latest_metrics = {}
    for metric in metrics:
        if metric.metric_name not in latest_metrics:
            latest_metrics[metric.metric_name] = metric
    
    return {
        "latest_metrics": [
            {
                "name": name,
                "value": metric.value,
                "unit": metric.unit,
                "recorded_at": metric.recorded_at
            }
            for name, metric in latest_metrics.items()
        ]
    }
