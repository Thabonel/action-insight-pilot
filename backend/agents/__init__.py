
# Agents package

from .base_agent import BaseAgent, agent_registry, AgentStatus, TaskStatus
from .content_agent import ContentAgent
from .lead_generation_agent import LeadGenerationAgent
from .campaign_agent import CampaignAgent
from .ai_service import AIService
from .seo.keyword_research_agent import KeywordResearchAgent
from .web_scraper_agent import WebScraperAgent

# Register the AI-powered agents
agent_registry.register_agent("content_creator", ContentAgent)
agent_registry.register_agent("lead_generator", LeadGenerationAgent)
agent_registry.register_agent("campaign_manager", CampaignAgent)
agent_registry.register_agent("keyword_research", KeywordResearchAgent)
agent_registry.register_agent("web_scraper", WebScraperAgent)

__all__ = [
    "BaseAgent",
    "ContentAgent",
    "LeadGenerationAgent",
    "CampaignAgent",
    "AIService",
    "KeywordResearchAgent",
    "WebScraperAgent",
    "agent_registry",
    "AgentStatus",
    "TaskStatus"
]
