from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


class DashboardStats(BaseModel):
    totalUsers: int
    activeUsers: int
    totalChats: int
    todayChats: int
    totalAppointments: int
    pendingAppointments: int
    systemHealth: str
    serverUptime: int


class AnalyticsData(BaseModel):
    dailyActiveUsers: List[int]
    chatVolume: List[int]
    userGrowth: List[int]
    topQueries: List[dict]
    specialistUsage: List[dict]
    totalStats: dict


class SystemConfig(BaseModel):
    maintenanceMode: bool
    allowRegistration: bool
    aiEnabled: bool
    notificationsEnabled: bool
    maxChatHistory: int
    rateLimit: int
    version: str
    lastUpdated: str


class LogEntry(BaseModel):
    id: str
    timestamp: str
    level: str
    message: str
    source: str
    userId: Optional[int] = None


class HealthContentCreate(BaseModel):
    title: str
    category: str
    content: str
    tags: List[str]
    isPublished: bool = False


class HealthContentResponse(HealthContentCreate):
    id: int
    createdAt: str
    updatedAt: str
