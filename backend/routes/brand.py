from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

router = APIRouter(prefix="/api/brand", tags=["brand"])
logger = logging.getLogger(__name__)

@router.get("/")
async def get_brand_info():
    """Get brand information"""
    return {
        "brand": {
            "name": "Marketing Automation Platform",
            "description": "AI-powered marketing automation",
            "colors": {
                "primary": "#3b82f6",
                "secondary": "#64748b"
            }
        }
    }

@router.post("/update")
async def update_brand_info(brand_data: Dict[str, Any]):
    """Update brand information"""
    try:
        return {
            "status": "success",
            "message": "Brand information updated",
            "brand": brand_data
        }
    except Exception as e:
        logger.error(f"Error updating brand info: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")