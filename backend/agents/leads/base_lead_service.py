
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
import json
from supabase import Client

logger = logging.getLogger(__name__)

class BaseLeadService(ABC):
    """Base class for lead service operations"""
    
    def __init__(self, supabase_client: Client, agent_id: int, ai_service):
        self.supabase = supabase_client
        self.agent_id = agent_id
        self.ai_service = ai_service
        self.logger = logging.getLogger(f"{self.__class__.__name__}")
    
    async def get_lead_data(self, lead_id: str = None, filters: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """Get lead data with optional filters"""
        try:
            query = self.supabase.table("leads").select("*")
            
            if lead_id:
                query = query.eq("id", lead_id)
            
            if filters:
                for key, value in filters.items():
                    query = query.eq(key, value)
            
            result = query.execute()
            return result.data
            
        except Exception as e:
            self.logger.error(f"Failed to get lead data: {str(e)}")
            return []
    
    def validate_input_data(self, required_fields: List[str], input_data: Dict[str, Any]) -> bool:
        """Validate that required fields are present in input data"""
        missing_fields = [field for field in required_fields if field not in input_data]
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        return True
    
    async def save_lead_to_database(self, table_name: str, lead_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save lead data to specified table"""
        try:
            result = self.supabase.table(table_name).insert(lead_data).execute()
            if result.data:
                self.logger.info(f"Saved lead to {table_name}: {result.data[0]['id']}")
                return result.data[0]
            return None
        except Exception as e:
            self.logger.error(f"Failed to save to {table_name}: {str(e)}")
            return None
