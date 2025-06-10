
from datetime import datetime
from typing import Dict, Any
from .base_content_service import BaseContentService

class SocialContentService(BaseContentService):
    """Service for creating social media content"""
    
    async def create_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create social media content using AI"""
        self.validate_input_data(["platform", "content_theme"], input_data)
        
        platform = input_data["platform"]
        content_theme = input_data["content_theme"]
        brand_voice = input_data.get("brand_voice", "professional")
        
        self.logger.info(f"Generating {platform} content for theme: {content_theme}")
        
        try:
            # Generate AI content
            ai_result = await self.ai_service.generate_social_post(platform, content_theme, brand_voice)
            
            # Structure the post data
            post_data = {
                "platform": platform,
                "content": ai_result.get("content", f"Engaging content about {content_theme}"),
                "hashtags": ai_result.get("hashtags", [f"#{content_theme.replace(' ', '')}"]),
                "suggested_image": ai_result.get("suggested_image", "Professional branded image"),
                "engagement_hooks": ai_result.get("engagement_hooks", []),
                "scheduled_time": None,
                "status": "draft",
                "engagement_metrics": {}
            }
            
            # Save to database
            saved_post = await self.save_content_to_database("social_posts", post_data)
            if saved_post:
                post_data["post_id"] = saved_post["id"]
            
            return {
                "post": post_data,
                "ai_suggestions": ai_result,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create social content: {str(e)}")
            raise Exception(f"Social content creation failed: {str(e)}")
