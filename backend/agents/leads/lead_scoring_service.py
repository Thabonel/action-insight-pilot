
from datetime import datetime
from typing import Dict, Any
from .base_lead_service import BaseLeadService

class LeadScoringService(BaseLeadService):
    """Service for scoring leads using AI analysis"""
    
    async def score_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Score leads using AI analysis"""
        lead_ids = input_data.get("lead_ids", [])
        scored_count = 0
        
        scoring_criteria = input_data.get("criteria", {
            "company_size": 30,
            "industry_fit": 25,
            "job_title_relevance": 25,
            "engagement_potential": 20
        })
        
        for lead_id in lead_ids:
            try:
                lead_data = await self.get_lead_data(lead_id=lead_id)
                if not lead_data:
                    continue
                
                lead = lead_data[0]
                
                # Calculate AI-enhanced score
                score = await self._calculate_ai_lead_score(lead, scoring_criteria)
                
                # Update lead score
                self.supabase.table("leads")\
                    .update({
                        "lead_score": score,
                        "updated_at": datetime.utcnow().isoformat()
                    })\
                    .eq("id", lead_id)\
                    .execute()
                
                scored_count += 1
                
            except Exception as e:
                self.logger.error(f"Failed to score lead {lead_id}: {str(e)}")
        
        return {
            "scored_count": scored_count,
            "total_processed": len(lead_ids),
            "criteria_used": scoring_criteria,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success"
        }
    
    async def _calculate_ai_lead_score(self, lead: Dict[str, Any], criteria: Dict[str, Any]) -> int:
        """Calculate lead score using AI insights"""
        base_score = lead.get("lead_score", 0)
        
        # Company size scoring
        company_size = lead.get("company_size", "unknown")
        size_score = {
            "enterprise": 30,
            "large": 25, 
            "medium": 20,
            "small": 15,
            "startup": 10
        }.get(company_size, 10)
        
        # Industry relevance (could be enhanced with AI)
        industry = lead.get("industry", "").lower()
        high_value_industries = ["technology", "healthcare", "finance", "manufacturing"]
        industry_score = 25 if any(ind in industry for ind in high_value_industries) else 15
        
        # Job title relevance
        job_title = lead.get("job_title", "").lower()
        decision_maker_titles = ["ceo", "cto", "director", "manager", "head", "vp"]
        title_score = 25 if any(title in job_title for title in decision_maker_titles) else 10
        
        # Engagement potential (based on enrichment data)
        enriched_data = lead.get("enriched_data", {})
        engagement_score = 20 if enriched_data.get("ai_insights") else 10
        
        total_score = min(100, size_score + industry_score + title_score + engagement_score)
        return total_score
