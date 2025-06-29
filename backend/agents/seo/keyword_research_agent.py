"""
Keyword Research Agent for SEO analysis
"""
import logging
from typing import Dict, Any, List
from ..base_agent_core import BaseAgentCore
from .keyword_research_service import KeywordResearchService

logger = logging.getLogger(__name__)

class KeywordResearchAgent(BaseAgentCore):
    """Agent for keyword research and SEO analysis"""
    
    def __init__(self, agent_id: int, supabase_client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.service = KeywordResearchService(
            api_key=config.get("seo_api_key") if config else None
        )
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return ["research_keywords", "competitor_keywords", "trending_keywords"]
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a keyword research task"""
        try:
            if task_type == "research_keywords":
                return await self._research_keywords(input_data)
            elif task_type == "competitor_keywords":
                return await self._get_competitor_keywords(input_data)
            elif task_type == "trending_keywords":
                return await self._get_trending_keywords(input_data)
            else:
                raise ValueError(f"Unsupported task type: {task_type}")
                
        except Exception as e:
            logger.error(f"Error executing task {task_type}: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    async def _research_keywords(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Research keywords from seed terms"""
        try:
            # Validate input
            if not self.validate_input_data(["seed_keywords"], input_data):
                return {
                    "success": False,
                    "error": "Missing required field: seed_keywords",
                    "data": None
                }
            
            seed_keywords = input_data["seed_keywords"]
            location = input_data.get("location", "US")
            
            # Use service to research keywords
            async with self.service:
                metrics = await self.service.research_keywords(seed_keywords, location)
            
            # Convert to dictionaries
            keywords_data = [self.service.to_dict(metric) for metric in metrics]
            
            # Save results to database
            research_data = {
                "created_by": input_data.get("user_id"),
                "query": ", ".join(seed_keywords),
                "keywords": keywords_data
            }
            
            saved_result = await self.save_result_to_database("keyword_research", research_data)
            
            return {
                "success": True,
                "data": {
                    "research_id": saved_result.get("id") if saved_result else None,
                    "keywords": keywords_data,
                    "total_keywords": len(keywords_data),
                    "query": ", ".join(seed_keywords)
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error in keyword research: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    async def _get_competitor_keywords(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get competitor keywords"""
        try:
            # Validate input
            if not self.validate_input_data(["competitor_domain"], input_data):
                return {
                    "success": False,
                    "error": "Missing required field: competitor_domain",
                    "data": None
                }
            
            competitor_domain = input_data["competitor_domain"]
            
            # Use service to get competitor keywords
            async with self.service:
                metrics = await self.service.get_competitor_keywords(competitor_domain)
            
            # Convert to dictionaries
            keywords_data = [self.service.to_dict(metric) for metric in metrics]
            
            # Save results to database
            research_data = {
                "created_by": input_data.get("user_id"),
                "query": f"Competitor analysis: {competitor_domain}",
                "keywords": keywords_data
            }
            
            saved_result = await self.save_result_to_database("keyword_research", research_data)
            
            return {
                "success": True,
                "data": {
                    "research_id": saved_result.get("id") if saved_result else None,
                    "keywords": keywords_data,
                    "total_keywords": len(keywords_data),
                    "competitor_domain": competitor_domain
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error in competitor keyword analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }
    
    async def _get_trending_keywords(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Get trending keywords"""
        try:
            industry = input_data.get("industry", "marketing")
            
            # Use service to get trending keywords
            async with self.service:
                metrics = await self.service.get_trending_keywords(industry)
            
            # Convert to dictionaries
            keywords_data = [self.service.to_dict(metric) for metric in metrics]
            
            # Save results to database
            research_data = {
                "created_by": input_data.get("user_id"),
                "query": f"Trending keywords: {industry}",
                "keywords": keywords_data
            }
            
            saved_result = await self.save_result_to_database("keyword_research", research_data)
            
            return {
                "success": True,
                "data": {
                    "research_id": saved_result.get("id") if saved_result else None,
                    "keywords": keywords_data,
                    "total_keywords": len(keywords_data),
                    "industry": industry
                },
                "error": None
            }
            
        except Exception as e:
            logger.error(f"Error in trending keyword analysis: {e}")
            return {
                "success": False,
                "error": str(e),
                "data": None
            }