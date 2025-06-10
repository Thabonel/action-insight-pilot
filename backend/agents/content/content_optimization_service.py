
from datetime import datetime
from typing import Dict, Any
import json
from .base_content_service import BaseContentService

class ContentOptimizationService(BaseContentService):
    """Service for optimizing existing content"""
    
    async def optimize_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing content using AI"""
        self.validate_input_data(["content_id"], input_data)
        
        content_id = input_data["content_id"]
        
        try:
            # Get existing content
            result = self.supabase.table("content_pieces")\
                .select("*")\
                .eq("id", content_id)\
                .execute()
            
            if not result.data:
                raise Exception(f"Content {content_id} not found")
            
            content = result.data[0]
            campaign_data = {
                "type": content["content_type"],
                "content": json.loads(content["content"]) if content["content"] else {},
                "target_audience": {"industry": "general"}
            }
            
            # Use AI to optimize
            optimization = await self.ai_service.optimize_campaign_copy(campaign_data)
            
            # Update content with optimizations
            optimized_content = json.loads(content["content"])
            optimized_content["ai_optimizations"] = optimization
            
            self.supabase.table("content_pieces")\
                .update({
                    "content": json.dumps(optimized_content),
                    "seo_score": min(100, content.get("seo_score", 0) + 10),
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq("id", content_id)\
                .execute()
            
            return {
                "content_id": content_id,
                "optimizations": optimization,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to optimize content: {str(e)}")
            raise Exception(f"Content optimization failed: {str(e)}")
