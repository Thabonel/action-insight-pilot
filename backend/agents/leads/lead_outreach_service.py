
from datetime import datetime
from typing import Dict, Any
from .base_lead_service import BaseLeadService

class LeadOutreachService(BaseLeadService):
    """Service for generating personalized outreach content"""
    
    async def generate_outreach_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate personalized outreach content for leads"""
        self.validate_input_data(["lead_id", "outreach_type"], input_data)
        
        lead_id = input_data["lead_id"]
        outreach_type = input_data["outreach_type"]  # email, linkedin, phone_script
        
        try:
            lead_data = await self.get_lead_data(lead_id=lead_id)
            if not lead_data:
                raise Exception(f"Lead {lead_id} not found")
            
            lead = lead_data[0]
            
            # Get AI insights for personalization
            ai_insights = await self.ai_service.generate_lead_enrichment_insights(lead)
            
            # Generate outreach content based on type
            if outreach_type == "email":
                content = await self.ai_service.generate_email_content(
                    "outreach",
                    {
                        "industry": lead.get("industry", "business"),
                        "job_title": lead.get("job_title", "decision maker"),
                        "company": lead.get("company", "their company"),
                        "insights": ai_insights.get("talking_points", [])
                    }
                )
            else:
                # For other types, use social content generator with specific prompts
                content = await self.ai_service.generate_social_post(
                    outreach_type,
                    f"personalized outreach for {lead.get('first_name', 'prospect')}"
                )
            
            # Save outreach content
            outreach_data = {
                "lead_id": lead_id,
                "outreach_type": outreach_type,
                "content": content,
                "ai_insights": ai_insights,
                "created_at": datetime.utcnow().isoformat()
            }
            
            return {
                "outreach_content": outreach_data,
                "personalization_points": ai_insights.get("talking_points", []),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate outreach content: {str(e)}")
            raise Exception(f"Outreach content generation failed: {str(e)}")
