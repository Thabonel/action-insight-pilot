
from datetime import datetime
from typing import Dict, Any
import json
from .base_lead_service import BaseLeadService

class LeadEnrichmentService(BaseLeadService):
    """Service for enriching leads with AI-generated insights"""
    
    async def enrich_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Enrich leads with AI-generated insights"""
        lead_ids = input_data.get("lead_ids", [])
        enriched_count = 0
        failed_count = 0
        
        self.logger.info(f"Starting AI enrichment for {len(lead_ids)} leads")
        
        for lead_id in lead_ids:
            try:
                lead_data = await self.get_lead_data(lead_id=lead_id)
                if not lead_data:
                    failed_count += 1
                    continue
                
                lead = lead_data[0]
                
                # Generate AI insights
                ai_insights = await self.ai_service.generate_lead_enrichment_insights(lead)
                
                # Structure enrichment data
                enrichment_data = {
                    "enriched_at": datetime.utcnow().isoformat(),
                    "ai_insights": ai_insights.get("insights", []),
                    "talking_points": ai_insights.get("talking_points", []),
                    "recommended_approach": ai_insights.get("recommended_approach", ""),
                    "pain_points": ai_insights.get("pain_points", []),
                    "value_propositions": ai_insights.get("value_propositions", []),
                    "enrichment_source": "ai_analysis"
                }
                
                # Merge with existing enriched data
                existing_data = lead.get("enriched_data", {})
                if isinstance(existing_data, str):
                    try:
                        existing_data = json.loads(existing_data)
                    except:
                        existing_data = {}
                
                merged_data = {**existing_data, **enrichment_data}
                
                # Update lead in database
                self.supabase.table("leads")\
                    .update({
                        "enriched_data": merged_data,
                        "updated_at": datetime.utcnow().isoformat()
                    })\
                    .eq("id", lead_id)\
                    .execute()
                
                enriched_count += 1
                self.logger.info(f"Successfully enriched lead {lead_id}")
                
            except Exception as e:
                self.logger.error(f"Failed to enrich lead {lead_id}: {str(e)}")
                failed_count += 1
        
        return {
            "enriched_count": enriched_count,
            "failed_count": failed_count,
            "total_processed": len(lead_ids),
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success"
        }
