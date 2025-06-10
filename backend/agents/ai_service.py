
import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class AIService:
    """Service for handling AI API calls with OpenAI"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make async HTTP request to OpenAI API"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers=self.headers,
                    json=data
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"OpenAI API request failed: {str(e)}")
                raise Exception(f"AI service error: {str(e)}")
    
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

        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are an expert email marketing copywriter. Always respond with valid JSON format."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 800
        }
        
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
    
    async def generate_social_post(self, platform: str, content_theme: str, brand_voice: str = "professional") -> Dict[str, Any]:
        """Generate social media content using GPT"""
        platform_guidelines = {
            "linkedin": "Professional tone, industry insights, 1-3 hashtags",
            "twitter": "Concise (280 chars), punchy, 2-4 hashtags", 
            "facebook": "Friendly, engaging, storytelling approach",
            "instagram": "Visual-focused, lifestyle-oriented, 5-10 hashtags"
        }
        
        guidelines = platform_guidelines.get(platform.lower(), "Engaging and appropriate for the platform")
        
        prompt = f"""Create a social media post for {platform} about '{content_theme}' with a {brand_voice} brand voice.

Guidelines: {guidelines}

Provide response in JSON format:
{{
  "content": "The main post content",
  "hashtags": ["#relevant", "#hashtags"],
  "suggested_image": "Description of ideal accompanying image",
  "engagement_hooks": ["Question or hook to increase engagement"]
}}"""

        data = {
            "model": "gpt-4o-mini", 
            "messages": [
                {"role": "system", "content": "You are a social media marketing expert. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.8,
            "max_tokens": 400
        }
        
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
    
    async def generate_lead_enrichment_insights(self, lead_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized insights for lead enrichment"""
        first_name = lead_data.get('first_name', 'Contact')
        last_name = lead_data.get('last_name', '')
        company = lead_data.get('company', 'their company')
        job_title = lead_data.get('job_title', 'their role')
        industry = lead_data.get('industry', 'their industry')
        
        prompt = f"""Analyze this lead profile and provide actionable insights:

Name: {first_name} {last_name}
Company: {company}
Job Title: {job_title}
Industry: {industry}

Please provide response in JSON format:
{{
  "insights": ["Insight 1", "Insight 2", "Insight 3"],
  "talking_points": ["Point 1", "Point 2", "Point 3"],
  "recommended_approach": "Suggested outreach strategy",
  "pain_points": ["Likely challenge 1", "Likely challenge 2"],
  "value_propositions": ["How we can help 1", "How we can help 2"]
}}

Focus on actionable intelligence for sales outreach."""

        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a sales intelligence expert. Provide actionable insights for B2B outreach. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.6,
            "max_tokens": 600
        }
        
        response = await self._make_request("chat/completions", data)
        content = response["choices"][0]["message"]["content"]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "insights": [
                    f"Focus on {industry}-specific challenges",
                    f"Highlight solutions relevant to {job_title} role",
                    f"Reference {company} growth opportunities"
                ],
                "talking_points": [
                    f"Industry expertise in {industry}",
                    "Proven ROI for similar companies",
                    "Quick implementation timeline"
                ],
                "recommended_approach": f"Professional, consultative approach emphasizing {industry} expertise",
                "pain_points": ["Market competition", "Operational efficiency", "Growth scaling"],
                "value_propositions": ["Increased efficiency", "Competitive advantage", "Measurable ROI"]
            }
    
    async def optimize_campaign_copy(self, campaign_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize campaign copy and provide recommendations"""
        campaign_type = campaign_data.get('type', 'marketing')
        target_audience = campaign_data.get('target_audience', {})
        current_content = campaign_data.get('content', {})
        
        prompt = f"""Review and optimize this {campaign_type} campaign:

Target Audience: {target_audience}
Current Content: {current_content}

Provide optimization recommendations in JSON format:
{{
  "optimized_subject": "Improved subject line",
  "optimized_content": "Enhanced content suggestions",
  "a_b_test_variants": ["Variant 1", "Variant 2"],
  "performance_predictions": {{
    "open_rate_estimate": "percentage",
    "click_rate_estimate": "percentage"
  }},
  "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}}"""

        data = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are a campaign optimization expert. Provide data-driven recommendations. Always respond with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.5,
            "max_tokens": 700
        }
        
        response = await self._make_request("chat/completions", data)
        content = response["choices"][0]["message"]["content"]
        
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            return {
                "optimized_subject": "Optimized: Transform Your Strategy Today",
                "optimized_content": "Enhanced content with stronger call-to-action and value proposition",
                "a_b_test_variants": ["Version A: Direct approach", "Version B: Story-driven approach"],
                "performance_predictions": {
                    "open_rate_estimate": "18-25%",
                    "click_rate_estimate": "3-5%"
                },
                "recommendations": [
                    "Add urgency to subject line",
                    "Include social proof",
                    "Strengthen call-to-action"
                ]
            }
