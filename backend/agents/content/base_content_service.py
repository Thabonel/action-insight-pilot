
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional
import logging
import json
from supabase import Client

logger = logging.getLogger(__name__)

class BaseContentService(ABC):
    """Base class for content generation services"""
    
    def __init__(self, supabase_client: Client, agent_id: int, ai_service):
        self.supabase = supabase_client
        self.agent_id = agent_id
        self.ai_service = ai_service
        self.logger = logging.getLogger(f"{self.__class__.__name__}")
    
    async def save_content_to_database(self, table_name: str, content_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save content to specified table"""
        try:
            result = self.supabase.table(table_name).insert(content_data).execute()
            if result.data:
                self.logger.info(f"Saved content to {table_name}: {result.data[0]['id']}")
                return result.data[0]
            return None
        except Exception as e:
            self.logger.error(f"Failed to save to {table_name}: {str(e)}")
            return None
    
    def validate_input_data(self, required_fields: list, input_data: Dict[str, Any]) -> bool:
        """Validate that required fields are present in input data"""
        missing_fields = [field for field in required_fields if field not in input_data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        return True
    
    @abstractmethod
    async def create_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create content - must be implemented by subclasses"""
        pass
