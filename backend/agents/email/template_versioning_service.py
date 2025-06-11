
import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
import json
import logging

logger = logging.getLogger(__name__)

class TemplateVersioningService:
    """Service for managing email template versions and reusable content structures"""
    
    def __init__(self, database_service=None):
        self.database_service = database_service
        self.logger = logger
    
    async def create_template_version(self, template_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new version of an existing template"""
        try:
            # Get current template
            current_template = await self.get_template(template_id)
            if not current_template:
                raise Exception(f"Template {template_id} not found")
            
            # Create new version
            version_data = {
                "id": str(uuid.uuid4()),
                "template_id": template_id,
                "version": current_template.get("version", 0) + 1,
                "subject_line": updates.get("subject_line", current_template["subject_line"]),
                "html_content": updates.get("html_content", current_template["html_content"]),
                "text_content": updates.get("text_content", current_template["text_content"]),
                "merge_tags": updates.get("merge_tags", current_template.get("merge_tags", [])),
                "performance_score": 0,  # Will be calculated after usage
                "created_at": datetime.utcnow().isoformat(),
                "status": "draft",
                "changelog": updates.get("changelog", ""),
                "parent_version": current_template.get("version", 0)
            }
            
            # Save to database
            if self.database_service:
                await self.database_service.save("email_template_versions", version_data)
            
            self.logger.info(f"Created template version {version_data['version']} for template {template_id}")
            return version_data
            
        except Exception as e:
            self.logger.error(f"Failed to create template version: {str(e)}")
            raise Exception(f"Template versioning failed: {str(e)}")
    
    async def get_template_versions(self, template_id: str) -> List[Dict[str, Any]]:
        """Get all versions of a template"""
        try:
            if self.database_service:
                versions = await self.database_service.query(
                    "email_template_versions",
                    {"template_id": template_id}
                )
                return sorted(versions, key=lambda x: x["version"], reverse=True)
            
            # Mock data for development
            return [
                {
                    "id": str(uuid.uuid4()),
                    "template_id": template_id,
                    "version": 2,
                    "subject_line": "Updated: Your exclusive offer awaits!",
                    "performance_score": 8.5,
                    "created_at": datetime.utcnow().isoformat(),
                    "status": "active"
                },
                {
                    "id": str(uuid.uuid4()),
                    "template_id": template_id,
                    "version": 1,
                    "subject_line": "Your exclusive offer awaits!",
                    "performance_score": 7.2,
                    "created_at": datetime.utcnow().isoformat(),
                    "status": "archived"
                }
            ]
        except Exception as e:
            self.logger.error(f"Failed to get template versions: {str(e)}")
            return []
    
    async def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Get current active template"""
        try:
            if self.database_service:
                template = await self.database_service.get("email_templates", template_id)
                return template
            
            # Mock template
            return {
                "id": template_id,
                "name": "Welcome Series Email",
                "subject_line": "Welcome to our platform!",
                "html_content": "<h1>Welcome {{first_name}}!</h1><p>Thank you for joining {{company}}.</p>",
                "text_content": "Welcome {{first_name}}! Thank you for joining {{company}}.",
                "merge_tags": ["first_name", "company", "email"],
                "version": 1,
                "performance_score": 7.5
            }
        except Exception as e:
            self.logger.error(f"Failed to get template: {str(e)}")
            return None
