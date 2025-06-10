
import json
import logging
from typing import Dict, Any
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class EmailAIService(BaseAIService):
    """AI service specialized for email content generation"""
    
    async def generate_email_content(self, campaign_type: str, target_audience: Dict[str, Any]) -> Dict[str, Any]:
        """Generate email marketing content using GPT"""
        industry = target_audience.get('industry', 'Business')
        job_title = target_audience.get('job_title', 'Decision Maker')
        company_size = target_audience.get('company_size', 'Medium')
        
        prompt = f"""Create a compelling email for a {campaign_type} marketing campaign targeting:
- Industry: {industry}
- Job Title: {job_title}  
- Company Size: {company_size}

Please provide your response in the following JSON format:
{{
  "subject_line": "Compelling subject line",
  "preview_text": "Email preview text",
  "html_content": "<html><body>Professional HTML email content</body></html>",
  "text_content": "Plain text version of the email",
  "key_points": ["Point 1", "Point 2", "Point 3"]
}}

Make the content professional, engaging, and include a clear call-to-action."""

        messages = [
            {"role": "system", "content": "You are an expert email marketing copywriter. Always respond with valid JSON format."},
            {"role": "user", "content": prompt}
        ]
        
        data = self._create_chat_completion_data(messages, temperature=0.7, max_tokens=800)
        response = await self._make_request("chat/completions", data)
        content = response["choices"][0]["message"]["content"]
        
        try:
            # Try to parse JSON response
            parsed_content = json.loads(content)
            return parsed_content
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            return {
                "subject_line": f"Transform Your {industry} Strategy",
                "preview_text": "Discover new opportunities for growth",
                "html_content": f"<p>{content}</p>",
                "text_content": content,
                "key_points": ["AI-generated content", "Personalized approach", "Clear value proposition"]
            }
