"""
Keyword Research API Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging
from pydantic import BaseModel

from models import APIResponse
from auth import verify_token
from config import agent_manager
from database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/keywords", tags=["keyword-research"])

class KeywordResearchRequest(BaseModel):
    seed_keywords: List[str]
    location: Optional[str] = "US"
    industry: Optional[str] = "marketing"

class CompetitorKeywordsRequest(BaseModel):
    competitor_domain: str
    
class TrendingKeywordsRequest(BaseModel):
    industry: Optional[str] = "marketing"

@router.post("/research", response_model=APIResponse)
async def research_keywords(
    request: KeywordResearchRequest, 
    token: dict = Depends(verify_token)
):
    """Research keywords and return metrics"""
    try:
        user_id = token.get("sub")
        
        if agent_manager.is_agent_available("keyword_research_agent"):
            # Use the keyword research agent
            agent = agent_manager.get_agent("keyword_research_agent")
            
            input_data = {
                "seed_keywords": request.seed_keywords,
                "location": request.location,
                "user_id": user_id
            }
            
            result = await agent.execute_task("research_keywords", input_data)
            return APIResponse(
                success=result["success"], 
                data=result.get("data"), 
                error=result.get("error")
            )
        else:
            raise HTTPException(status_code=503, detail="Keyword research agent not available")
            
    except Exception as e:
        logger.error(f"Error in keyword research: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/competitor", response_model=APIResponse)
async def get_competitor_keywords(
    request: CompetitorKeywordsRequest, 
    token: dict = Depends(verify_token)
):
    """Get competitor keywords"""
    try:
        user_id = token.get("sub")
        
        if agent_manager.is_agent_available("keyword_research_agent"):
            agent = agent_manager.get_agent("keyword_research_agent")
            
            input_data = {
                "competitor_domain": request.competitor_domain,
                "user_id": user_id
            }
            
            result = await agent.execute_task("competitor_keywords", input_data)
            return APIResponse(
                success=result["success"], 
                data=result.get("data"), 
                error=result.get("error")
            )
        else:
            raise HTTPException(status_code=503, detail="Keyword research agent not available")
            
    except Exception as e:
        logger.error(f"Error in competitor keyword research: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/trending", response_model=APIResponse)
async def get_trending_keywords(
    request: TrendingKeywordsRequest, 
    token: dict = Depends(verify_token)
):
    """Get trending keywords"""
    try:
        user_id = token.get("sub")
        
        if agent_manager.is_agent_available("keyword_research_agent"):
            agent = agent_manager.get_agent("keyword_research_agent")
            
            input_data = {
                "industry": request.industry,
                "user_id": user_id
            }
            
            result = await agent.execute_task("trending_keywords", input_data)
            return APIResponse(
                success=result["success"], 
                data=result.get("data"), 
                error=result.get("error")
            )
        else:
            raise HTTPException(status_code=503, detail="Keyword research agent not available")
            
    except Exception as e:
        logger.error(f"Error in trending keyword research: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/history", response_model=APIResponse)
async def get_keyword_history(token: dict = Depends(verify_token)):
    """Get previous keyword research requests"""
    try:
        user_id = token.get("sub")
        
        supabase = await get_supabase_client()
        result = supabase.table("keyword_research")\
            .select("*")\
            .eq("created_by", user_id)\
            .order("created_at", desc=True)\
            .limit(20)\
            .execute()
        
        return APIResponse(success=True, data=result.data)
        
    except Exception as e:
        logger.error(f"Error getting keyword history: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/history/{research_id}", response_model=APIResponse)
async def get_keyword_research_detail(research_id: str, token: dict = Depends(verify_token)):
    """Get specific keyword research details"""
    try:
        user_id = token.get("sub")
        
        supabase = await get_supabase_client()
        result = supabase.table("keyword_research")\
            .select("*")\
            .eq("id", research_id)\
            .eq("created_by", user_id)\
            .single()\
            .execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Keyword research not found")
        
        return APIResponse(success=True, data=result.data)
        
    except Exception as e:
        logger.error(f"Error getting keyword research detail: {e}")
        return APIResponse(success=False, error=str(e))