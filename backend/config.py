import os
import logging
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import importlib
import sys

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgentManager:
    """
    Centralized agent manager with graceful error handling and clear API key validation.
    """
    
    def __init__(self):
        self.agents_available = False
        self.missing_dependencies = []
        self.missing_api_keys = []
        self.initialized_agents = {}
        
        # Validate API keys first
        self._validate_api_keys()
        
        # Initialize agents
        self._initialize_agents()
    
    def _validate_api_keys(self):
        """Validate required API keys and provide clear error messages"""
        required_keys = {
            'OPENAI_API_KEY': 'OpenAI API key for AI-powered content generation',
            'SUPABASE_URL': 'Supabase project URL for database operations',
            'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key for backend operations'
        }
        
        for key, description in required_keys.items():
            value = os.getenv(key)
            if not value:
                self.missing_api_keys.append({
                    'key': key,
                    'description': description,
                    'required': True
                })
                logger.warning(f"❌ Missing required API key: {key} ({description})")
        
        # Optional API keys with warnings
        optional_keys = {
            'ANTHROPIC_API_KEY': 'Anthropic API key for Claude AI (optional fallback)',
            'FACEBOOK_CLIENT_ID': 'Facebook OAuth integration',
            'TWITTER_CLIENT_ID': 'Twitter OAuth integration',
            'LINKEDIN_CLIENT_ID': 'LinkedIn OAuth integration'
        }
        
        for key, description in optional_keys.items():
            value = os.getenv(key)
            if not value:
                logger.info(f"ℹ️ Optional API key not configured: {key} ({description})")
    
    def _initialize_agents(self):
        """Initialize all AI agents with comprehensive error handling"""
        agent_configs = [
            {
                'name': 'campaign_agent',
                'module': 'agents.campaign_agent',
                'class': 'CampaignAgent',
                'description': 'Campaign planning and optimization'
            },
            {
                'name': 'social_media_agent',
                'module': 'agents.social_media_agent',
                'class': 'SocialMediaAgent',
                'description': 'Social media content creation and management'
            },
            {
                'name': 'lead_generation_agent',
                'module': 'agents.lead_generation_agent',
                'class': 'LeadGenerationAgent',
                'description': 'Lead scoring and qualification'
            },
            {
                'name': 'content_agent',
                'module': 'agents.content_agent',
                'class': 'ContentAgent',
                'description': 'AI-powered content creation'
            },
            {
                'name': 'email_agent',
                'module': 'agents.email_automation_agent',
                'class': 'EmailAutomationAgent',
                'description': 'Email campaign automation'
            },
            {
                'name': 'analytics_agent',
                'module': 'agents.analytics_agent',
                'class': 'AnalyticsAgent',
                'description': 'Performance analytics and insights'
            },
            {
                'name': 'proposal_generator',
                'module': 'agents.proposal_generator',
                'class': 'ProposalGenerator',
                'description': 'Automated proposal generation'
            },
            {
                'name': 'mcp_agent',
                'module': 'agents.mcp_agent',
                'class': 'MCPAgent',
                'description': 'Multi-channel publishing coordination'
            },
            {
                'name': 'keyword_research_agent',
                'module': 'agents.seo.keyword_research_agent',
                'class': 'KeywordResearchAgent',
                'description': 'SEO keyword research and analysis'
            }
        ]
        
        # Check for critical API keys before initializing
        openai_key = os.getenv("OPENAI_API_KEY", "")
        if not openai_key:
            logger.error("❌ Cannot initialize agents: OpenAI API key is required")
            self.agents_available = False
            return
        
        integrations = self._get_integrations_config()
        
        for config in agent_configs:
            try:
                # Try to import the module
                module = importlib.import_module(config['module'])
                agent_class = getattr(module, config['class'])
                
                # Initialize agent with proper parameters
                if config['name'] == 'mcp_agent':
                    # MCP agent doesn't need API keys
                    agent_instance = agent_class()
                else:
                    # Other agents need API key and integrations
                    agent_instance = agent_class(openai_key, integrations)
                
                # Store initialized agent
                self.initialized_agents[config['name']] = agent_instance
                setattr(self, config['name'], agent_instance)
                
                logger.info(f"✅ Initialized {config['name']}: {config['description']}")
                
            except ImportError as e:
                error_msg = f"Module {config['module']} not found: {str(e)}"
                self.missing_dependencies.append({
                    'agent': config['name'],
                    'module': config['module'],
                    'error': error_msg,
                    'description': config['description']
                })
                logger.warning(f"⚠️ Could not load {config['name']}: {error_msg}")
                # Set agent to None
                setattr(self, config['name'], None)
                
            except Exception as e:
                error_msg = f"Failed to initialize {config['name']}: {str(e)}"
                logger.error(f"❌ {error_msg}")
                # Set agent to None
                setattr(self, config['name'], None)
        
        # Update availability status
        self.agents_available = len(self.initialized_agents) > 0
        
        if self.agents_available:
            logger.info(f"✅ Agent system initialized with {len(self.initialized_agents)} available agents")
        else:
            logger.error("❌ No agents could be initialized")
    
    def _get_integrations_config(self) -> Dict[str, Any]:
        """Get integrations configuration with available API keys"""
        return {
            'openai_key': os.getenv("OPENAI_API_KEY", ""),
            'anthropic_key': os.getenv("ANTHROPIC_API_KEY", ""),
            'supabase_url': os.getenv("SUPABASE_URL", ""),
            'supabase_key': os.getenv("SUPABASE_SERVICE_ROLE_KEY", ""),
            'facebook_client_id': os.getenv("FACEBOOK_CLIENT_ID", ""),
            'twitter_client_id': os.getenv("TWITTER_CLIENT_ID", ""),
            'linkedin_client_id': os.getenv("LINKEDIN_CLIENT_ID", "")
        }
    
    async def initialize_mcp(self):
        """Initialize MCP connections if available"""
        if self.mcp_agent:
            try:
                await self.mcp_agent.connect_all_servers()
                logger.info("✅ MCP universal tool connector initialized")
            except Exception as e:
                logger.error(f"❌ Failed to initialize MCP: {e}")
        else:
            logger.warning("⚠️ MCP agent not available")
    
    def get_agent(self, agent_name: str):
        """Get an agent by name with proper error handling"""
        agent = self.initialized_agents.get(agent_name)
        if not agent:
            available_agents = list(self.initialized_agents.keys())
            raise ValueError(f"Agent '{agent_name}' not available. Available agents: {available_agents}")
        return agent
    
    def is_agent_available(self, agent_name: str) -> bool:
        """Check if a specific agent is available"""
        return agent_name in self.initialized_agents
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status for debugging"""
        return {
            'agents_available': self.agents_available,
            'initialized_agents': list(self.initialized_agents.keys()),
            'missing_dependencies': self.missing_dependencies,
            'missing_api_keys': self.missing_api_keys,
            'total_agents_loaded': len(self.initialized_agents)
        }

# Global agent manager instance
agent_manager = AgentManager()

def get_environment_config() -> Dict[str, Any]:
    """Get environment configuration with validation"""
    config = {
        "openai_key": os.getenv("OPENAI_API_KEY"),
        "supabase_url": os.getenv("SUPABASE_URL"),
        "supabase_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "port": int(os.getenv("PORT", 8000)),
        "host": os.getenv("HOST", "0.0.0.0"),
        "environment": os.getenv("ENVIRONMENT", "production")
    }
    
    # Log missing critical configuration
    critical_keys = ["openai_key", "supabase_url", "supabase_key"]
    missing_critical = [key for key in critical_keys if not config[key]]
    
    if missing_critical:
        logger.error(f"❌ Missing critical configuration: {missing_critical}")
    
    return config

def get_system_health() -> Dict[str, Any]:
    """Get system health status"""
    return {
        'status': 'healthy' if agent_manager.agents_available else 'degraded',
        'agents': agent_manager.get_system_status(),
        'environment': get_environment_config()
    }