
import os
import logging
from dotenv import load_dotenv
from typing import Dict, Any

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentManager:
    def __init__(self):
        self.agents_available = False
        self.openai_api_key = os.getenv("OPENAI_API_KEY", "")
        self.integrations = {}
        
        # Agent instances
        self.campaign_agent = None
        self.social_media_agent = None
        self.lead_generation_agent = None
        self.content_agent = None
        self.email_agent = None  # Changed from email_automation_agent to email_agent
        self.analytics_agent = None
        self.proposal_generator = None
        self.mcp_agent = None
        self.internal_publisher_agent = None  # ✅ Keep as None for now
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Initialize all AI agents with proper error handling"""
        try:
            from agents.campaign_agent import CampaignAgent
            from agents.social_media_agent import SocialMediaAgent, SocialPlatform, PostStatus  
            from agents.lead_generation_agent import LeadGenerationAgent
            from agents.content_agent import ContentAgent
            from agents.email_automation_agent import EmailAutomationAgent
            from agents.analytics_agent import AnalyticsAgent
            from agents.proposal_generator import ProposalGenerator
            from agents.mcp_agent import MCPAgent
            # from agents.internal_publishing_agent import InternalPublisherAgent  # ✅ COMMENTED OUT - FIX LATER
            
            self.mcp_agent = MCPAgent()
            self.campaign_agent = CampaignAgent(self.openai_api_key, self.integrations)
            self.social_media_agent = SocialMediaAgent(self.openai_api_key, self.integrations)
            self.lead_generation_agent = LeadGenerationAgent(self.openai_api_key, self.integrations)
            self.content_agent = ContentAgent(self.openai_api_key, self.integrations)
            self.email_agent = EmailAutomationAgent(self.openai_api_key, self.integrations)  # Changed property name
            self.analytics_agent = AnalyticsAgent(self.openai_api_key, self.integrations)
            self.proposal_generator = ProposalGenerator(self.openai_api_key, self.integrations)
            # self.internal_publisher_agent = InternalPublisherAgent()  # ✅ COMMENTED OUT - FIX LATER
            
            self.agents_available = True
            logger.info("✅ All AI agents loaded successfully!")
        
        except ImportError as e:
            logger.warning(f"⚠️ Could not import agents: {e}. Using mock data.")
            self.agents_available = False
    
    async def initialize_mcp(self):
        """Initialize MCP connections"""
        if self.mcp_agent:
            await self.mcp_agent.connect_all_servers()
            logger.info("MCP universal tool connector initialized")

# Global agent manager instance
agent_manager = AgentManager()

def get_environment_config():
    return {
        "openai_key": os.getenv("OPENAI_API_KEY"),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_key": os.getenv("SUPABASE_KEY"),
        "port": int(os.getenv("PORT", 8000)),
        "host": os.getenv("HOST", "0.0.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production")
    }
