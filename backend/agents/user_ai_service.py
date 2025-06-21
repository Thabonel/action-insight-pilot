
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
from database.user_secrets_client import get_user_secrets

logger = logging.getLogger(__name__)

class UserAIService:
    """User-specific AI service that uses user's own API keys"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.user_secrets = get_user_secrets()
        self._api_key: Optional[str] = None
        self._services_initialized = False
        
        # AI service instances (will be initialized with user's API key)
        self.email_service: Optional[EmailAIService] = None
        self.social_service: Optional[SocialAIService] = None
        self.lead_service: Optional[LeadAIService] = None
        self.campaign_service: Optional[CampaignAIService] = None
    
    async def _get_user_api_key(self) -> Optional[str]:
        """Retrieve user's OpenAI API key"""
        if self._api_key:
            return self._api_key
        
        try:
            self._api_key = await self.user_secrets.get_user_secret(self.user_id, 'openai_api_key')
            if not self._api_key:
                logger.warning(f"No OpenAI API key found for user {self.user_id}")
            return self._api_key
        except Exception as e:
            logger.error(f"Failed to retrieve API key for user {self.user_id}: {e}")
            return None
    
    async def _initialize_services(self) -> bool:
        """Initialize AI services with user's API key"""
        if self._services_initialized:
            return True
        
        api_key = await self._get_user_api_key()
        if not api_key:
            return False
        
        try:
            self.email_service = EmailAIService(api_key)
            self.social_service = SocialAIService(api_key)
            self.lead_service = LeadAIService(api_key)
            self.campaign_service = CampaignAIService(api_key)
            
            self._services_initialized = True
            logger.info(f"✅ AI services initialized for user {self.user_id}")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize AI services for user {self.user_id}: {e}")
            return False
    
    async def has_api_key(self) -> bool:
        """Check if user has configured an OpenAI API key"""
        return await self.user_secrets.has_user_secret(self.user_id, 'openai_api_key')
    
    # Email generation methods
    async def generate_email_content(self, campaign_type: str, target_audience: Dict[str, Any]) -> Dict[str, Any]:
        """Generate email marketing content using user's GPT key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        return await self.email_service.generate_email_content(campaign_type, target_audience)
    
    # Social media generation methods
    async def generate_social_post(self, platform: str, content_theme: str, brand_voice: str = "professional") -> Dict[str, Any]:
        """Generate social media content using user's GPT key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        return await self.social_service.generate_social_post(platform, content_theme, brand_voice)
    
    # Lead enrichment methods
    async def generate_lead_enrichment_insights(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized insights for lead enrichment using user's API key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        return await self.lead_service.generate_lead_enrichment_insights(lead_data)
    
    # Campaign optimization methods
    async def optimize_campaign_copy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize campaign copy using user's API key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        return await self.campaign_service.optimize_campaign_copy(campaign_data)
    
    # Daily focus agent
    async def generate_daily_focus(self, query: str, campaigns: list, context: list = None) -> Dict[str, Any]:
        """Generate daily focus recommendations using user's API key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        api_key = await self._get_user_api_key()
        
        try:
            # Prepare the prompt for daily focus
            system_prompt = """You are an AI marketing assistant specializing in daily focus recommendations. 
            Analyze the user's campaigns and provide actionable daily priorities."""
            
            user_prompt = f"""
            Query: {query}
            
            Current Campaigns ({len(campaigns)} total):
            {json.dumps(campaigns, indent=2)}
            
            Context: {json.dumps(context or [], indent=2)}
            
            Please provide:
            1. A clear focus summary for today
            2. Top 3 priority actions
            3. Business impact explanation
            4. Specific next steps
            """
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4.1-2025-04-14",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
            
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            return {
                "success": True,
                "data": {
                    "focus_summary": ai_response,
                    "title": "Your Marketing Focus for Today",
                    "explanation": ai_response,
                    "business_impact": "Focusing on these priorities will improve your marketing ROI",
                    "recommended_actions": [
                        "Review campaign performance",
                        "Optimize underperforming content",
                        "Follow up on high-value leads"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"Daily focus generation failed for user {self.user_id}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    # General campaign agent
    async def process_general_query(self, query: str, campaigns: list, context: list = None) -> Dict[str, Any]:
        """Process general marketing queries using user's API key"""
        if not await self._initialize_services():
            raise ValueError(f"User {self.user_id} has not configured an OpenAI API key")
        
        api_key = await self._get_user_api_key()
        
        try:
            system_prompt = """You are an AI marketing assistant. Analyze the user's campaigns and provide helpful insights and recommendations based on their query."""
            
            user_prompt = f"""
            User Query: {query}
            
            Available Campaigns ({len(campaigns)} total):
            {json.dumps(campaigns, indent=2)}
            
            Context: {json.dumps(context or [], indent=2)}
            
            Please provide relevant marketing insights and actionable recommendations.
            """
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "gpt-4.1-2025-04-14",
                        "messages": [
                            {"role": "system", "content": system_prompt},
                            {"role": "user", "content": user_prompt}
                        ],
                        "temperature": 0.7,
                        "max_tokens": 1000
                    }
                )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.status_code} - {response.text}")
            
            result = response.json()
            ai_response = result['choices'][0]['message']['content']
            
            return {
                "success": True,
                "data": {
                    "explanation": ai_response,
                    "business_impact": "These insights can help improve your marketing effectiveness",
                    "recommended_actions": [
                        "Review the analysis",
                        "Implement suggested optimizations",
                        "Monitor performance changes"
                    ]
                }
            }
            
        except Exception as e:
            logger.error(f"General query processing failed for user {self.user_id}: {e}")
            return {
                "success": False,
                "error": str(e)
            }
