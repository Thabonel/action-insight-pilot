
from datetime import datetime
from typing import Dict, Any
from .base_content_service import BaseContentService

class HeadlinesService(BaseContentService):
    """Service for generating headlines"""
    
    async def generate_headlines(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate multiple headline variations"""
        self.validate_input_data(["topic"], input_data)
        
        topic = input_data["topic"]
        count = input_data.get("count", 5)
        
        try:
            headlines = []
            for i in range(count):
                result = await self.ai_service.generate_social_post("headline", f"{topic} variation {i+1}")
                headlines.append(result.get("content", f"Compelling headline about {topic}"))
            
            return {
                "headlines": headlines,
                "topic": topic,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate headlines: {str(e)}")
            raise Exception(f"Headlines generation failed: {str(e)}")
