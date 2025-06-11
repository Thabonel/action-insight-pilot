
from typing import Dict, Any, List, Optional
import logging
from datetime import datetime
from .template_versioning_service import TemplateVersioningService
from .personalization_service import PersonalizationService
from .metrics_service import RealTimeMetricsService
from .webhook_service import WebhookService

logger = logging.getLogger(__name__)

class EnhancedEmailService:
    """Enhanced email service with versioning, personalization, metrics, and webhooks"""
    
    def __init__(self, database_service=None):
        self.database_service = database_service
        self.logger = logger
        
        # Initialize services
        self.template_service = TemplateVersioningService(database_service)
        self.personalization_service = PersonalizationService()
        self.metrics_service = RealTimeMetricsService(database_service)
        self.webhook_service = WebhookService(database_service)
        
        # ESP providers for fallback
        self.esp_providers = ["sendgrid", "mailchimp", "amazonses"]
        self.current_provider = 0
    
    async def send_personalized_email(self, 
                                    template_id: str, 
                                    recipient_data: Dict[str, Any],
                                    campaign_id: str = None) -> Dict[str, Any]:
        """Send personalized email with metrics tracking and webhook notifications"""
        try:
            # Get template
            template = await self.template_service.get_template(template_id)
            if not template:
                raise Exception(f"Template {template_id} not found")
            
            # Personalize content
            personalized_subject = self.personalization_service.personalize_content(
                template["subject_line"], 
                recipient_data
            )
            personalized_html = self.personalization_service.personalize_content(
                template["html_content"], 
                recipient_data
            )
            personalized_text = self.personalization_service.personalize_content(
                template["text_content"], 
                recipient_data
            )
            
            # Send email with fallback
            email_result = await self.send_with_fallback({
                "to": recipient_data["email"],
                "subject": personalized_subject,
                "html_content": personalized_html,
                "text_content": personalized_text,
                "campaign_id": campaign_id
            })
            
            if email_result["success"]:
                # Track sent event
                await self.metrics_service.track_email_event(
                    email_result["email_id"], 
                    "sent",
                    {"recipient": recipient_data["email"], "campaign_id": campaign_id}
                )
                
                # Send webhook notification
                await self.webhook_service.send_webhook("sent", {
                    "email_id": email_result["email_id"],
                    "recipient": recipient_data["email"],
                    "campaign_id": campaign_id,
                    "template_id": template_id
                })
            
            return email_result
            
        except Exception as e:
            self.logger.error(f"Failed to send personalized email: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def send_with_fallback(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        """Send email with ESP provider fallback"""
        for attempt, provider in enumerate(self.esp_providers):
            try:
                result = await self.send_via_provider(email_data, provider)
                if result["success"]:
                    return result
                    
            except Exception as e:
                self.logger.warning(f"Provider {provider} failed: {str(e)}")
                
                if attempt < len(self.esp_providers) - 1:
                    self.logger.info(f"Falling back to next provider...")
                    continue
        
        # All providers failed
        return {
            "success": False,
            "error": "All email providers failed",
            "attempted_providers": self.esp_providers
        }
    
    async def send_via_provider(self, email_data: Dict[str, Any], provider: str) -> Dict[str, Any]:
        """Send email via specific ESP provider"""
        # Mock implementation - replace with actual ESP integration
        import uuid
        
        if provider == "sendgrid":
            # SendGrid implementation
            email_id = f"sg_{uuid.uuid4()}"
        elif provider == "mailchimp":
            # Mailchimp implementation
            email_id = f"mc_{uuid.uuid4()}"
        elif provider == "amazonses":
            # Amazon SES implementation
            email_id = f"ses_{uuid.uuid4()}"
        else:
            raise Exception(f"Unknown provider: {provider}")
        
        # Simulate success/failure
        import random
        success = random.random() > 0.1  # 90% success rate
        
        if success:
            return {
                "success": True,
                "email_id": email_id,
                "provider": provider,
                "sent_at": datetime.utcnow().isoformat()
            }
        else:
            raise Exception(f"Provider {provider} delivery failed")
    
    async def get_campaign_analytics(self, campaign_id: str, time_range: str = "24h") -> Dict[str, Any]:
        """Get enhanced campaign analytics"""
        try:
            # Get real-time metrics
            metrics = await self.metrics_service.get_real_time_metrics(campaign_id, time_range)
            
            # Add performance insights
            metrics["insights"] = await self.generate_performance_insights(metrics)
            
            # Add comparison with previous campaigns
            metrics["comparison"] = await self.get_campaign_comparison(campaign_id)
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to get campaign analytics: {str(e)}")
            return self.metrics_service.get_default_metrics()
    
    async def generate_performance_insights(self, metrics: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate AI-powered performance insights"""
        insights = []
        
        # Open rate insights
        open_rate = metrics.get("open_rate", 0)
        if open_rate < 15:
            insights.append({
                "type": "warning",
                "metric": "open_rate",
                "message": "Low open rate detected. Consider A/B testing subject lines.",
                "recommendation": "Try shorter, more personalized subject lines"
            })
        elif open_rate > 25:
            insights.append({
                "type": "success",
                "metric": "open_rate",
                "message": "Excellent open rate! This subject line is performing well.",
                "recommendation": "Save this template for future campaigns"
            })
        
        # Click rate insights
        click_rate = metrics.get("click_rate", 0)
        if click_rate < 2:
            insights.append({
                "type": "warning",
                "metric": "click_rate",
                "message": "Low click-through rate. Review your email content and CTAs.",
                "recommendation": "Use more compelling calls-to-action and better email design"
            })
        
        # Engagement score insights
        engagement_score = metrics.get("engagement_score", 0)
        if engagement_score > 15:
            insights.append({
                "type": "success",
                "metric": "engagement",
                "message": "High engagement detected! Your audience is responding well.",
                "recommendation": "Consider increasing send frequency to this segment"
            })
        
        return insights
    
    async def get_campaign_comparison(self, campaign_id: str) -> Dict[str, Any]:
        """Compare current campaign with historical averages"""
        # Mock comparison data
        return {
            "vs_last_campaign": {
                "open_rate": 5.2,  # +5.2% improvement
                "click_rate": -1.3,  # -1.3% decrease
                "engagement_score": 2.8  # +2.8% improvement
            },
            "vs_average": {
                "open_rate": 3.1,
                "click_rate": 0.8,
                "engagement_score": 1.9
            }
        }
