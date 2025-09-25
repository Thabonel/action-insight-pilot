from fastapi import APIRouter, HTTPException
from typing import Dict, Any
import logging

router = APIRouter(prefix="/api/research", tags=["research"])
logger = logging.getLogger(__name__)

@router.post("/analyze")
async def analyze_market_research(research_data: Dict[str, Any]):
    """Analyze market research data"""
    try:
        topic = research_data.get("topic")
        if not topic:
            raise HTTPException(status_code=400, detail="Research topic is required")
        
        return {
            "status": "success",
            "analysis": {
                "topic": topic,
                "insights": ["market trend 1", "competitor insight 2"],
                "recommendations": ["recommendation 1", "recommendation 2"]
            }
        }
    except Exception as e:
        logger.error(f"Error analyzing research: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/topics")
async def get_research_topics():
    """Get available research topics"""
    return {
        "topics": [
            {"id": "market_trends", "name": "Market Trends"},
            {"id": "competitor_analysis", "name": "Competitor Analysis"},
            {"id": "customer_insights", "name": "Customer Insights"}
        ]
    }