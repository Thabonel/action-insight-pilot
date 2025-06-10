
from datetime import datetime
from typing import Dict, Any
import json
from .base_content_service import BaseContentService

class EmailContentService(BaseContentService):
    """Service for creating email marketing content"""
    
    async def create_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create email marketing content using AI"""
        self.validate_input_data(["campaign_type", "target_audience"], input_data)
        
        campaign_type = input_data["campaign_type"]
        target_audience = input_data["target_audience"]
        
        self.logger.info(f"Generating email content for {campaign_type} campaign")
        
        try:
            # Generate AI content
            ai_result = await self.ai_service.generate_email_content(campaign_type, target_audience)
            
            # Structure the content
            content = {
                "subject_line": ai_result.get("subject_line", f"Transform Your {campaign_type} Strategy"),
                "preview_text": ai_result.get("preview_text", "Discover new opportunities"),
                "html_content": ai_result.get("html_content", "<p>Professional email content</p>"),
                "text_content": ai_result.get("text_content", "Professional email content"),
                "key_points": ai_result.get("key_points", ["AI-generated", "Personalized", "Engaging"])
            }
            
            # Save to database
            content_data = {
                "title": content["subject_line"],
                "content_type": "email",
                "content": json.dumps(content),
                "keywords": [campaign_type, target_audience.get("industry", "business")],
                "generated_by_agent": self.agent_id,
                "status": "draft",
                "seo_score": 85  # AI-generated content typically scores well
            }
            
            saved_content = await self.save_content_to_database("content_pieces", content_data)
            if saved_content:
                content["content_id"] = saved_content["id"]
            
            return {
                "content": content,
                "ai_insights": ai_result.get("key_points", []),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create email content: {str(e)}")
            raise Exception(f"Email content creation failed: {str(e)}")
