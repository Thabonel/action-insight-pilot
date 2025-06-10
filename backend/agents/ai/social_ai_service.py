
import json
import logging
from typing import Dict, Any
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class SocialAIService(BaseAIService):
    """AI service specialized for social media content generation"""
    
    def __init__(self, api_key: str):
        super().__init__(api_key)
        self.platform_guidelines = {
            "linkedin": "Professional tone, industry insights, 1-3 hashtags",
            "twitter": "Concise (280 chars), punchy, 2-4 hashtags", 
            "facebook": "Friendly, engaging, storytelling approach",
            "instagram": "Visual-focused, lifestyle-oriented, 5-10 hashtags"
        }
    
    async def generate_social_post(self, platform: str, content_theme: str, brand_voice: str = "professional") -> Dict[str, Any]:
        """Generate social media content using GPT"""
        guidelines = self.platform_guidelines.get(platform.lower(), "Engaging and appropriate for the platform")
        
        prompt = f"""Create a social media post for {platform} about '{content_theme}' with a {brand_voice} brand voice.

Guidelines: {guidelines}

Provide response in JSON format:
{{
  "content": "The main post content",
  "hashtags": ["#relevant", "#hashtags"],
  "suggested_image": "Description of ideal accompanying image",
  "engagement_hooks": ["Question or hook to increase engagement"]
}}"""

        messages = [
            {"role": "system", "content": "You are a social media marketing expert. Always respond with valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        data = self._create_chat_completion_data(messages, temperature=0.8, max_tokens=400)
        response = await self._make_request("chat/completions", data)
        content = response["choices"][0]["message"]["content"]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "content": content,
                "hashtags": [f"#{content_theme.replace(' ', '')}", "#Marketing", "#Business"],
                "suggested_image": f"Professional image related to {content_theme}",
                "engagement_hooks": ["What are your thoughts on this?"]
            }
