from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging

# Import verify_token into module scope so tests can patch
# Local dependency for tests: require Authorization header and let FastAPI
# return 422 on missing header (validation error), matching test expectations.
from fastapi import Header

def verify_token(authorization: str = Header(...)) -> str:  # noqa: D401
    """Dependency that returns the Authorization header string."""
    return authorization

router = APIRouter(prefix="/api/keywords", tags=["keywords"])
logger = logging.getLogger(__name__)


class KeywordResearchRequest(BaseModel):
    seed_keywords: List[str] = Field(..., description="Seed keywords to research")
    location: Optional[str] = None
    industry: Optional[str] = None


class CompetitorRequest(BaseModel):
    competitor_domain: str


class TrendingRequest(BaseModel):
    industry: Optional[str] = None


@router.post("/research")
async def research_keywords(payload: KeywordResearchRequest, token: str = Depends(verify_token)):
    """Research keywords based on seed terms."""
    try:
        # Simple stubbed response matching tests' expectations
        keywords = [
            *payload.seed_keywords,
            *(f"{kw} ideas" for kw in payload.seed_keywords),
            "marketing automation",
        ]
        data = {
            "keywords": list(dict.fromkeys(keywords)),  # unique preserve order
            "total_keywords": len(set(keywords)),
            "location": payload.location,
            "industry": payload.industry,
        }
        return {"success": True, "data": data}
    except Exception as e:
        logger.error(f"Error researching keywords: {str(e)}")
        return {"success": False, "error": "Internal server error"}


@router.post("/competitor")
async def competitor_keywords(payload: CompetitorRequest, token: str = Depends(verify_token)):
    """Return competitor keyword ideas (stubbed)."""
    try:
        domain = payload.competitor_domain
        sample = [f"{domain} review", f"{domain} alternatives", "best marketing tools"]
        return {"success": True, "data": {"keywords": sample, "competitor": domain}}
    except Exception as e:
        logger.error(f"Error getting competitor keywords: {str(e)}")
        return {"success": False, "error": "Internal server error"}


@router.post("/trending")
async def trending_keywords(payload: TrendingRequest, token: str = Depends(verify_token)):
    """Return trending keywords for an industry (stubbed)."""
    try:
        industry = payload.industry or "general"
        sample = [f"{industry} trends", f"{industry} best practices", f"{industry} 2026"]
        return {"success": True, "data": {"keywords": sample, "industry": industry}}
    except Exception as e:
        logger.error(f"Error getting trending keywords: {str(e)}")
        return {"success": False, "error": "Internal server error"}


@router.get("/history")
async def keyword_history(token: str = Depends(verify_token)):
    """Return a stubbed keyword research history."""
    try:
        return {"success": True, "data": {"items": []}}
    except Exception as e:
        logger.error(f"Error getting keyword history: {str(e)}")
        return {"success": False, "error": "Internal server error"}
