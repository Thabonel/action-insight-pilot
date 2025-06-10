
from datetime import datetime
from typing import Dict, Any
import json
from .base_content_service import BaseContentService

class BlogContentService(BaseContentService):
    """Service for creating blog content"""
    
    async def create_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create blog content using AI"""
        self.validate_input_data(["topic", "target_keywords"], input_data)
        
        topic = input_data["topic"]
        keywords = input_data["target_keywords"]
        word_count = input_data.get("word_count", 800)
        
        self.logger.info(f"Generating blog content for topic: {topic}")
        
        try:
            # Use the social post generator as a base for blog content
            ai_result = await self.ai_service.generate_social_post("blog", topic, "informative")
            
            content = {
                "title": f"Complete Guide to {topic}",
                "content": ai_result.get("content", f"Comprehensive content about {topic}"),
                "meta_description": f"Learn everything about {topic} in this detailed guide",
                "keywords": keywords,
                "estimated_read_time": max(1, word_count // 200)  # Rough estimate
            }
            
            # Save to database
            content_data = {
                "title": content["title"],
                "content_type": "blog",
                "content": json.dumps(content),
                "keywords": keywords,
                "generated_by_agent": self.agent_id,
                "status": "draft",
                "seo_score": 80
            }
            
            saved_content = await self.save_content_to_database("content_pieces", content_data)
            if saved_content:
                content["content_id"] = saved_content["id"]
            
            return {
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create blog content: {str(e)}")
            raise Exception(f"Blog content creation failed: {str(e)}")
