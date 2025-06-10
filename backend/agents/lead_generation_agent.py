from datetime import datetime
from typing import Dict, Any, List
import json
import logging
from .base_agent import BaseAgent
from .ai_service import AIService

logger = logging.getLogger(__name__)

class LeadGenerationAgent(BaseAgent):
    """AI-powered lead generation and enrichment agent"""
    
    def __init__(self, agent_id: int, supabase_client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
    
    async def _initialize_ai_service(self):
        """Initialize AI service with OpenAI API key from secrets"""
        if self.ai_service is None:
            try:
                # Get OpenAI API key from user secrets
                result = await self.supabase.functions.invoke("manage-user-secrets", {
                    "body": json.dumps({"serviceName": "openai_api_key"}),
                    "headers": {"Content-Type": "application/json"}
                })
                
                if result.get('data') and result['data'].get('value'):
                    api_key = result['data']['value']
                    self.ai_service = AIService(api_key)
                    self.logger.info("AI service initialized for lead generation")
                else:
                    raise Exception("OpenAI API key not found in user secrets")
                    
            except Exception as e:
                self.logger.error(f"Failed to initialize AI service: {str(e)}")
                raise Exception(f"AI service initialization failed: {str(e)}")
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            "enrich_leads",
            "score_leads", 
            "generate_outreach_content",
            "analyze_lead_patterns",
            "qualify_leads"
        ]
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute lead generation tasks using AI"""
        await self._initialize_ai_service()
        
        if task_type == "enrich_leads":
            return await self._enrich_leads(input_data)
        elif task_type == "score_leads":
            return await self._score_leads(input_data)
        elif task_type == "generate_outreach_content":
            return await self._generate_outreach_content(input_data)
        elif task_type == "analyze_lead_patterns":
            return await self._analyze_lead_patterns(input_data)
        elif task_type == "qualify_leads":
            return await self._qualify_leads(input_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _enrich_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
    
    async def _score_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
    
    async def _generate_outreach_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
    
    async def _analyze_lead_patterns(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
    
    async def _qualify_leads(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
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
