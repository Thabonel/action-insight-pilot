from fastapi import APIRouter
from datetime import datetime
import os

router = APIRouter(prefix="/api/health", tags=["health"])

@router.get("/")
async def health_check():
    """System health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "version": "1.0.2"
    }

@router.get("/status")
async def system_status():
    """Detailed system status"""
    return {
        "status": "operational",
        "services": {
            "api": "healthy",
            "database": "healthy"
        },
        "timestamp": datetime.now().isoformat()
    }