
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
from supabase import Client

logger = logging.getLogger(__name__)

class AgentUtils:
    """Utility methods for agent operations"""
    
    def __init__(self, supabase_client: Client, agent_id: int):
        self.supabase = supabase_client
        self.agent_id = agent_id
        self.logger = logging.getLogger(f"AgentUtils_{agent_id}")
    
    def validate_input_data(self, required_fields: List[str], input_data: Dict[str, Any]) -> bool:
        """Validate that required fields are present in input data"""
        missing_fields = [field for field in required_fields if field not in input_data]
        
        if missing_fields:
            raise ValueError(f"Missing required fields: {missing_fields}")
        
        return True
    
    async def save_result_to_database(self, table_name: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save result data to specified table"""
        try:
            result = self.supabase.table(table_name).insert(data).execute()
            if result.data:
                self.logger.info(f"Saved data to {table_name}: {result.data[0]['id']}")
                return result.data[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to save to {table_name}: {str(e)}")
            return None
    
    async def get_campaign_data(self, campaign_id: str) -> Optional[Dict[str, Any]]:
        """Get campaign data by ID"""
        try:
            result = self.supabase.table("campaigns")\
                .select("*")\
                .eq("id", campaign_id)\
                .execute()
            
            if result.data:
                return result.data[0]
            return None
            
        except Exception as e:
            self.logger.error(f"Failed to get campaign {campaign_id}: {str(e)}")
            return None
    
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
    
    async def update_campaign_metrics(self, campaign_id: str, metrics: Dict[str, Any]):
        """Update campaign metrics"""
        try:
            # Save to campaign_metrics table
            metric_data = {
                "campaign_id": campaign_id,
                "metric_type": "automated_update",
                "metric_value": 0,  # You can calculate aggregate value
                "metric_date": datetime.utcnow().date().isoformat(),
                "additional_data": metrics
            }
            
            await self.save_result_to_database("campaign_metrics", metric_data)
            
            # Update campaigns table metrics field
            self.supabase.table("campaigns")\
                .update({"metrics": metrics})\
                .eq("id", campaign_id)\
                .execute()
            
            self.logger.info(f"Updated metrics for campaign {campaign_id}")
            
        except Exception as e:
            self.logger.error(f"Failed to update campaign metrics: {str(e)}")
