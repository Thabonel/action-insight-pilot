
from datetime import datetime
from typing import Dict, Any, List
import logging
import json
import time
from supabase import Client
from .base_agent import BaseAgent
from .ai_service import AIService
from .content.email_content_service import EmailContentService
from .content.social_content_service import SocialContentService
from .content.blog_content_service import BlogContentService
from .content.content_optimization_service import ContentOptimizationService
from .content.headlines_service import HeadlinesService

logger = logging.getLogger(__name__)

class ContentAgent(BaseAgent):
    """AI-powered content creation agent using OpenAI"""
    
    def __init__(self, agent_id: int, supabase_client: Client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
        self._content_services = {}
        
    async def _initialize_ai_service(self):
        """Initialize AI service with OpenAI API key from secrets"""
        if self.ai_service is None:
            try:
                # Get OpenAI API key from user secrets
                result = await self.supabase.functions.invoke("manage-user-secrets", {
                    "body": json.dumps({"serviceName": "openai_api_key"}),
                    "headers": {"Content-Type": "application/json"}
                })
                
                if result.get('data') and result['data'].get('value'):
                    api_key = result['data']['value']
                    self.ai_service = AIService(api_key)
                    
                    # Initialize content services
                    self._content_services = {
                        "email": EmailContentService(self.supabase, self.agent_id, self.ai_service),
                        "social": SocialContentService(self.supabase, self.agent_id, self.ai_service),
                        "blog": BlogContentService(self.supabase, self.agent_id, self.ai_service),
                        "optimization": ContentOptimizationService(self.supabase, self.agent_id, self.ai_service),
                        "headlines": HeadlinesService(self.supabase, self.agent_id, self.ai_service)
                    }
                    
                    self.logger.info("AI service and content services initialized successfully")
                else:
                    raise Exception("OpenAI API key not found in user secrets")
                    
            except Exception as e:
                self.logger.error(f"Failed to initialize AI service: {str(e)}")
                raise Exception(f"AI service initialization failed: {str(e)}")
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            "create_email_content",
            "create_social_content", 
            "create_blog_content",
            "optimize_content",
            "generate_headlines"
        ]
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute content creation tasks using AI"""
        await self._initialize_ai_service()
        
        if task_type == "create_email_content":
            return await self._content_services["email"].create_content(input_data)
        elif task_type == "create_social_content":
            return await self._content_services["social"].create_content(input_data)
        elif task_type == "create_blog_content":
            return await self._content_services["blog"].create_content(input_data)
        elif task_type == "optimize_content":
            return await self._content_services["optimization"].optimize_content(input_data)
        elif task_type == "generate_headlines":
            return await self._content_services["headlines"].generate_headlines(input_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
