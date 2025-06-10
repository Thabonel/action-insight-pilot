
import json
import logging
from typing import Dict, Any
from .base_ai_service import BaseAIService

logger = logging.getLogger(__name__)

class LeadAIService(BaseAIService):
    """AI service specialized for lead enrichment and analysis"""
    
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

Focus on actionable intelligence for B2B outreach."""

        messages = [
            {"role": "system", "content": "You are a sales intelligence expert. Provide actionable insights for B2B outreach. Always respond with valid JSON."},
            {"role": "user", "content": prompt}
        ]
        
        data = self._create_chat_completion_data(messages, temperature=0.6, max_tokens=600)
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
