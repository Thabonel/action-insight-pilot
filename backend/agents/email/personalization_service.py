
import re
from typing import Dict, Any, List
import logging

logger = logging.getLogger(__name__)

class PersonalizationService:
    """Service for dynamic email personalization with merge tags"""
    
    def __init__(self):
        self.logger = logger
        self.default_merge_tags = {
            "first_name": "Valued Customer",
            "last_name": "Friend",
            "company": "Your Company",
            "email": "customer@example.com",
            "phone": "",
            "industry": "Business",
            "city": "",
            "country": ""
        }
    
    def extract_merge_tags(self, content: str) -> List[str]:
        """Extract all merge tags from content"""
        pattern = r'\{\{(\w+)\}\}'
        tags = re.findall(pattern, content)
        return list(set(tags))
    
    def personalize_content(self, content: str, contact_data: Dict[str, Any]) -> str:
        """Replace merge tags with actual contact data"""
        try:
            # Find all merge tags in content
            merge_tags = self.extract_merge_tags(content)
            
            personalized_content = content
            for tag in merge_tags:
                placeholder = f"{{{{{tag}}}}}"
                
                # Get value from contact data or use default
                value = contact_data.get(tag, self.default_merge_tags.get(tag, f"[{tag}]"))
                
                # Replace placeholder with actual value
                personalized_content = personalized_content.replace(placeholder, str(value))
            
            return personalized_content
            
        except Exception as e:
            self.logger.error(f"Personalization failed: {str(e)}")
            return content
    
    def validate_merge_tags(self, content: str, available_fields: List[str]) -> Dict[str, Any]:
        """Validate that all merge tags have corresponding data fields"""
        merge_tags = self.extract_merge_tags(content)
        
        validation_result = {
            "valid": True,
            "missing_fields": [],
            "available_tags": merge_tags,
            "suggestions": []
        }
        
        for tag in merge_tags:
            if tag not in available_fields and tag not in self.default_merge_tags:
                validation_result["valid"] = False
                validation_result["missing_fields"].append(tag)
                
                # Suggest similar fields
                suggestions = [field for field in available_fields if tag.lower() in field.lower()]
                if suggestions:
                    validation_result["suggestions"].extend(suggestions)
        
        return validation_result
    
    def generate_preview(self, content: str, sample_data: Dict[str, Any] = None) -> str:
        """Generate a preview with sample data"""
        if not sample_data:
            sample_data = {
                "first_name": "John",
                "last_name": "Doe",
                "company": "Acme Corp",
                "email": "john.doe@acme.com",
                "industry": "Technology",
                "city": "San Francisco",
                "country": "USA"
            }
        
        return self.personalize_content(content, sample_data)
