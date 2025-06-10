
from datetime import datetime
from typing import Dict, Any
from .base_lead_service import BaseLeadService

class LeadAnalyticsService(BaseLeadService):
    """Service for analyzing lead patterns and trends"""
    
    async def analyze_lead_patterns(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze patterns in lead data"""
        try:
            # Get recent leads for pattern analysis
            leads = await self.get_lead_data(filters={"status": "new"})
            
            if not leads:
                return {
                    "patterns": [],
                    "insights": ["No recent leads found for analysis"],
                    "timestamp": datetime.utcnow().isoformat(),
                    "status": "success"
                }
            
            # Simple pattern analysis
            industries = {}
            company_sizes = {}
            sources = {}
            
            for lead in leads:
                industry = lead.get("industry", "unknown")
                industries[industry] = industries.get(industry, 0) + 1
                
                size = lead.get("company_size", "unknown") 
                company_sizes[size] = company_sizes.get(size, 0) + 1
                
                source = lead.get("source", "unknown")
                sources[source] = sources.get(source, 0) + 1
            
            patterns = {
                "top_industries": sorted(industries.items(), key=lambda x: x[1], reverse=True)[:5],
                "company_size_distribution": company_sizes,
                "lead_sources": sources,
                "total_analyzed": len(leads)
            }
            
            insights = [
                f"Most common industry: {patterns['top_industries'][0][0] if patterns['top_industries'] else 'N/A'}",
                f"Primary lead source: {max(sources.items(), key=lambda x: x[1])[0] if sources else 'N/A'}",
                f"Total leads analyzed: {len(leads)}"
            ]
            
            return {
                "patterns": patterns,
                "insights": insights,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to analyze lead patterns: {str(e)}")
            raise Exception(f"Lead pattern analysis failed: {str(e)}")
