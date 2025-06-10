
import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime
from .ai.email_ai_service import EmailAIService
from .ai.social_ai_service import SocialAIService
from .ai.lead_ai_service import LeadAIService
from .ai.campaign_ai_service import CampaignAIService

logger = logging.getLogger(__name__)

class AIService:
    """Unified AI service that delegates to specialized services"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.email_service = EmailAIService(api_key)
        self.social_service = SocialAIService(api_key)
        self.lead_service = LeadAIService(api_key)
        self.campaign_service = CampaignAIService(api_key)
    
    # Email generation methods
    async def generate_email_content(self, campaign_type: str, target_audience: Dict[str, Any]) -> Dict[str, Any]:
        """Generate email marketing content using GPT"""
        return await self.email_service.generate_email_content(campaign_type, target_audience)
    
    # Social media generation methods
    async def generate_social_post(self, platform: str, content_theme: str, brand_voice: str = "professional") -> Dict[str, Any]:
        """Generate social media content using GPT"""
        return await self.social_service.generate_social_post(platform, content_theme, brand_voice)
    
    # Lead enrichment methods
    async def generate_lead_enrichment_insights(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized insights for lead enrichment"""
        return await self.lead_service.generate_lead_enrichment_insights(lead_data)
    
    # Campaign optimization methods
    async def optimize_campaign_copy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize campaign copy and provide recommendations"""
        return await self.campaign_service.optimize_campaign_copy(campaign_data)
