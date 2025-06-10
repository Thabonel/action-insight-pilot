
from datetime import datetime
from typing import Dict, Any, List
import json
import logging
from .base_agent import BaseAgent
from .ai_service import AIService
from .leads import (
    LeadEnrichmentService,
    LeadScoringService, 
    LeadOutreachService,
    LeadAnalyticsService,
    LeadQualificationService
)

logger = logging.getLogger(__name__)

class LeadGenerationAgent(BaseAgent):
    """AI-powered lead generation and enrichment agent"""
    
    def __init__(self, agent_id: int, supabase_client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
        self._services = {}
    
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
                    self.logger.info("AI service initialized for lead generation")
                else:
                    raise Exception("OpenAI API key not found in user secrets")
                    
            except Exception as e:
                self.logger.error(f"Failed to initialize AI service: {str(e)}")
                raise Exception(f"AI service initialization failed: {str(e)}")
    
    async def _get_service(self, service_class):
        """Get or create service instance"""
        service_name = service_class.__name__
        if service_name not in self._services:
            await self._initialize_ai_service()
            self._services[service_name] = service_class(
                self.supabase, self.agent_id, self.ai_service
            )
        return self._services[service_name]
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            "enrich_leads",
            "score_leads", 
            "generate_outreach_content",
            "analyze_lead_patterns",
            "qualify_leads"
        ]
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute lead generation tasks using AI"""
        if task_type == "enrich_leads":
            service = await self._get_service(LeadEnrichmentService)
            return await service.enrich_leads(input_data)
        elif task_type == "score_leads":
            service = await self._get_service(LeadScoringService)
            return await service.score_leads(input_data)
        elif task_type == "generate_outreach_content":
            service = await self._get_service(LeadOutreachService)
            return await service.generate_outreach_content(input_data)
        elif task_type == "analyze_lead_patterns":
            service = await self._get_service(LeadAnalyticsService)
            return await service.analyze_lead_patterns(input_data)
        elif task_type == "qualify_leads":
            service = await self._get_service(LeadQualificationService)
            return await service.qualify_leads(input_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
