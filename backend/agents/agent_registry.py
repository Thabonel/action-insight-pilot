
from typing import Dict, Any, List
from supabase import Client
from .base_agent_core import BaseAgentCore

class AgentRegistry:
    """Registry to manage different agent types"""
    
    def __init__(self):
        self.agents = {}
    
    def register_agent(self, agent_type: str, agent_class):
        """Register an agent class"""
        self.agents[agent_type] = agent_class
    
    def create_agent(self, agent_type: str, agent_id: int, supabase_client: Client, 
                    config: Dict[str, Any] = None) -> BaseAgentCore:
        """Create an agent instance"""
        if agent_type not in self.agents:
            raise ValueError(f"Unknown agent type: {agent_type}")
        
        return self.agents[agent_type](agent_id, supabase_client, config)
    
    def get_supported_types(self) -> List[str]:
        """Get list of supported agent types"""
        return list(self.agents.keys())

# Global agent registry
agent_registry = AgentRegistry()
