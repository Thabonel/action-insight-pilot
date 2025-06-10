
from datetime import datetime
from typing import Dict, Any
from .base_lead_service import BaseLeadService

class LeadQualificationService(BaseLeadService):
    """Service for qualifying leads using AI-enhanced criteria"""
    
    async def qualify_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Qualify leads using AI-enhanced criteria"""
        lead_ids = input_data.get("lead_ids", [])
        qualification_criteria = input_data.get("criteria", {
            "min_company_size": "small",
            "target_industries": [],
            "min_lead_score": 50
        })
        
        qualified_leads = []
        disqualified_leads = []
        
        for lead_id in lead_ids:
            try:
                lead_data = await self.get_lead_data(lead_id=lead_id)
                if not lead_data:
                    continue
                
                lead = lead_data[0]
                
                # Check qualification criteria
                is_qualified = True
                reasons = []
                
                # Company size check
                min_size = qualification_criteria.get("min_company_size", "small")
                lead_size = lead.get("company_size", "unknown")
                size_hierarchy = ["startup", "small", "medium", "large", "enterprise"]
                
                if lead_size in size_hierarchy and min_size in size_hierarchy:
                    if size_hierarchy.index(lead_size) < size_hierarchy.index(min_size):
                        is_qualified = False
                        reasons.append(f"Company size {lead_size} below minimum {min_size}")
                
                # Industry check
                target_industries = qualification_criteria.get("target_industries", [])
                if target_industries and lead.get("industry", "").lower() not in [i.lower() for i in target_industries]:
                    is_qualified = False
                    reasons.append("Industry not in target list")
                
                # Lead score check
                min_score = qualification_criteria.get("min_lead_score", 0)
                if lead.get("lead_score", 0) < min_score:
                    is_qualified = False
                    reasons.append(f"Lead score {lead.get('lead_score', 0)} below minimum {min_score}")
                
                # Update lead status
                new_status = "qualified" if is_qualified else "disqualified"
                self.supabase.table("leads")\
                    .update({
                        "status": new_status,
                        "updated_at": datetime.utcnow().isoformat()
                    })\
                    .eq("id", lead_id)\
                    .execute()
                
                if is_qualified:
                    qualified_leads.append(lead_id)
                else:
                    disqualified_leads.append({"lead_id": lead_id, "reasons": reasons})
                
            except Exception as e:
                self.logger.error(f"Failed to qualify lead {lead_id}: {str(e)}")
        
        return {
            "qualified_count": len(qualified_leads),
            "disqualified_count": len(disqualified_leads),
            "qualified_leads": qualified_leads,
            "disqualified_details": disqualified_leads,
            "criteria_used": qualification_criteria,
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success"
        }
