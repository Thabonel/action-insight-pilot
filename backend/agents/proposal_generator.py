
from datetime import datetime
from typing import Dict, Any, List, Optional
import logging
import uuid
import json

logger = logging.getLogger(__name__)

class ProposalGenerator:
    """AI agent for generating professional sales proposals"""
    
    def __init__(self, openai_api_key: str, integrations: Dict[str, Any]):
        self.openai_api_key = openai_api_key
        self.integrations = integrations
        self.logger = logger
        
        # Proposal templates
        self.templates = {
            "marketing_services": {
                "name": "Marketing Services Proposal",
                "sections": ["executive_summary", "client_overview", "proposed_services", "timeline", "pricing", "terms"],
                "default_services": ["SEO", "Content Marketing", "Social Media Management", "PPC Advertising"]
            },
            "web_development": {
                "name": "Web Development Proposal",
                "sections": ["project_overview", "technical_requirements", "development_phases", "timeline", "pricing", "terms"],
                "default_services": ["UI/UX Design", "Frontend Development", "Backend Development", "Testing & QA"]
            },
            "consulting": {
                "name": "Consulting Services Proposal",
                "sections": ["executive_summary", "problem_analysis", "proposed_solution", "methodology", "timeline", "pricing", "terms"],
                "default_services": ["Strategy Consulting", "Process Optimization", "Training & Development"]
            },
            "roofing": {
                "name": "Roofing Services Proposal",
                "sections": ["property_assessment", "proposed_work", "materials", "timeline", "pricing", "warranty_terms"],
                "default_services": ["Roof Inspection", "Repair Services", "Full Replacement", "Maintenance"]
            },
            "custom": {
                "name": "Custom Service Proposal",
                "sections": ["overview", "services", "timeline", "pricing", "terms"],
                "default_services": []
            }
        }

    async def generate_proposal(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a complete proposal based on input data"""
        try:
            template_type = proposal_data.get("template_type", "custom")
            template = self.templates.get(template_type, self.templates["custom"])
            
            # Extract key information
            client_info = proposal_data.get("client_info", {})
            project_details = proposal_data.get("project_details", {})
            call_transcript = proposal_data.get("call_transcript", "")
            budget_range = proposal_data.get("budget_range", {})
            
            # Generate proposal content
            proposal_content = await self._generate_proposal_content(
                template, client_info, project_details, call_transcript, budget_range
            )
            
            # Create proposal document
            proposal = {
                "id": str(uuid.uuid4()),
                "template_type": template_type,
                "client_info": client_info,
                "content": proposal_content,
                "pricing": await self._generate_pricing_table(budget_range, project_details),
                "timeline": await self._generate_timeline(project_details),
                "terms": await self._generate_terms_conditions(template_type),
                "created_at": datetime.now().isoformat(),
                "status": "draft"
            }
            
            return {"success": True, "data": proposal}
            
        except Exception as e:
            self.logger.error(f"Error generating proposal: {e}")
            return {"success": False, "error": str(e)}

    async def _generate_proposal_content(self, template: Dict, client_info: Dict, 
                                       project_details: Dict, call_transcript: str, 
                                       budget_range: Dict) -> Dict[str, str]:
        """Generate the main content sections of the proposal"""
        
        content = {}
        
        # Executive Summary
        content["executive_summary"] = f"""
        We are pleased to present this proposal for {client_info.get('company_name', 'your organization')}. 
        Based on our conversation and analysis of your requirements, we have developed a comprehensive 
        solution that addresses your specific needs and objectives.
        
        Our proposed approach will deliver measurable results while staying within your budget parameters 
        of {budget_range.get('min', 'TBD')} - {budget_range.get('max', 'TBD')}.
        """
        
        # Client Overview
        if client_info:
            content["client_overview"] = f"""
            Company: {client_info.get('company_name', 'N/A')}
            Industry: {client_info.get('industry', 'N/A')}
            Contact: {client_info.get('contact_name', 'N/A')}
            Email: {client_info.get('email', 'N/A')}
            Phone: {client_info.get('phone', 'N/A')}
            
            Project Requirements: {project_details.get('description', 'As discussed')}
            """
        
        # Proposed Services/Solution
        services = project_details.get('services', template['default_services'])
        content["proposed_services"] = "Our comprehensive solution includes:\n\n"
        for i, service in enumerate(services, 1):
            content["proposed_services"] += f"{i}. {service}\n"
        
        # Project Overview (for web development)
        if template.get('name') == 'Web Development Proposal':
            content["project_overview"] = f"""
            Project Scope: {project_details.get('scope', 'Full website development')}
            Target Audience: {project_details.get('target_audience', 'General public')}
            Key Features: {', '.join(project_details.get('features', ['Responsive Design', 'CMS Integration']))}
            Technology Stack: {project_details.get('technology', 'Modern web technologies')}
            """
        
        return content

    async def _generate_pricing_table(self, budget_range: Dict, project_details: Dict) -> List[Dict]:
        """Generate pricing breakdown"""
        
        min_budget = budget_range.get('min', 5000)
        max_budget = budget_range.get('max', 10000)
        
        # Basic pricing structure
        pricing_items = [
            {
                "item": "Initial Setup & Strategy",
                "description": "Project planning, strategy development, and initial setup",
                "price": min_budget * 0.2,
                "quantity": 1
            },
            {
                "item": "Core Implementation",
                "description": "Main project deliverables and implementation",
                "price": min_budget * 0.6,
                "quantity": 1
            },
            {
                "item": "Testing & Optimization",
                "description": "Quality assurance, testing, and performance optimization",
                "price": min_budget * 0.15,
                "quantity": 1
            },
            {
                "item": "Training & Support",
                "description": "Team training and initial support period",
                "price": min_budget * 0.05,
                "quantity": 1
            }
        ]
        
        return pricing_items

    async def _generate_timeline(self, project_details: Dict) -> List[Dict]:
        """Generate project timeline"""
        
        duration = project_details.get('duration', 8)  # weeks
        
        timeline = [
            {
                "phase": "Discovery & Planning",
                "duration": "1 week",
                "deliverables": ["Project plan", "Requirements document", "Timeline confirmation"]
            },
            {
                "phase": "Design & Development",
                "duration": f"{duration - 3} weeks",
                "deliverables": ["Initial designs", "Core functionality", "Regular progress updates"]
            },
            {
                "phase": "Testing & Refinement",
                "duration": "1 week",
                "deliverables": ["Quality assurance", "Bug fixes", "Performance optimization"]
            },
            {
                "phase": "Launch & Support",
                "duration": "1 week",
                "deliverables": ["Final delivery", "Training sessions", "Support documentation"]
            }
        ]
        
        return timeline

    async def _generate_terms_conditions(self, template_type: str) -> Dict[str, str]:
        """Generate terms and conditions based on template type"""
        
        base_terms = {
            "payment_terms": "50% upfront, 50% upon completion",
            "revision_policy": "Up to 3 rounds of revisions included",
            "intellectual_property": "All rights transfer to client upon final payment",
            "cancellation_policy": "30-day notice required for cancellation",
            "warranty": "90-day warranty on all work completed"
        }
        
        if template_type == "roofing":
            base_terms.update({
                "warranty": "10-year warranty on materials, 5-year warranty on workmanship",
                "weather_policy": "Work may be delayed due to weather conditions",
                "permits": "All necessary permits will be obtained by contractor"
            })
        elif template_type == "web_development":
            base_terms.update({
                "hosting": "Client responsible for hosting and domain costs",
                "maintenance": "Optional maintenance packages available",
                "source_code": "Full source code provided upon completion"
            })
        
        return base_terms

    async def get_proposal_templates(self) -> Dict[str, Any]:
        """Get available proposal templates"""
        try:
            return {"success": True, "data": self.templates}
        except Exception as e:
            return {"success": False, "error": str(e)}

    async def save_proposal(self, proposal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Save proposal to database"""
        try:
            # In a real implementation, save to database
            proposal_id = proposal_data.get("id", str(uuid.uuid4()))
            
            # Mock database save
            saved_proposal = {
                **proposal_data,
                "id": proposal_id,
                "saved_at": datetime.now().isoformat()
            }
            
            return {"success": True, "data": saved_proposal}
            
        except Exception as e:
            self.logger.error(f"Error saving proposal: {e}")
            return {"success": False, "error": str(e)}

    async def get_proposals(self, filters: Dict[str, Any] = None) -> Dict[str, Any]:
        """Get saved proposals with optional filters"""
        try:
            # Mock data for demonstration
            mock_proposals = [
                {
                    "id": str(uuid.uuid4()),
                    "client_name": "Acme Corp",
                    "template_type": "marketing_services",
                    "status": "sent",
                    "created_at": "2024-01-15T10:00:00Z",
                    "value": 15000
                },
                {
                    "id": str(uuid.uuid4()),
                    "client_name": "TechStart Inc",
                    "template_type": "web_development",
                    "status": "draft",
                    "created_at": "2024-01-14T14:30:00Z",
                    "value": 25000
                }
            ]
            
            return {"success": True, "data": mock_proposals}
            
        except Exception as e:
            self.logger.error(f"Error getting proposals: {e}")
            return {"success": False, "error": str(e)}

    async def export_proposal(self, proposal_id: str, format_type: str = "pdf") -> Dict[str, Any]:
        """Export proposal to PDF or Word format"""
        try:
            # In a real implementation, generate actual file
            export_data = {
                "proposal_id": proposal_id,
                "format": format_type,
                "download_url": f"/api/proposals/{proposal_id}/download/{format_type}",
                "generated_at": datetime.now().isoformat()
            }
            
            return {"success": True, "data": export_data}
            
        except Exception as e:
            self.logger.error(f"Error exporting proposal: {e}")
            return {"success": False, "error": str(e)}
