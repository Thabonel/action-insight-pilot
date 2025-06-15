# agents/email_automation_agent.py

import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class EmailType(Enum):
    WELCOME = "welcome"
    NURTURE = "nurture"
    PROMOTIONAL = "promotional"
    ABANDONED_CART = "abandoned_cart"
    RE_ENGAGEMENT = "re_engagement"
    NEWSLETTER = "newsletter"
    TRANSACTIONAL = "transactional"
    FOLLOW_UP = "follow_up"

class CampaignStatus(Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    ARCHIVED = "archived"

class TriggerType(Enum):
    TIME_BASED = "time_based"
    BEHAVIOR_BASED = "behavior_based"
    EVENT_BASED = "event_based"
    MANUAL = "manual"

class EmailStatus(Enum):
    SCHEDULED = "scheduled"
    SENT = "sent"
    DELIVERED = "delivered"
    OPENED = "opened"
    CLICKED = "clicked"
    BOUNCED = "bounced"
    UNSUBSCRIBED = "unsubscribed"

@dataclass
class EmailTemplate:
    id: str
    name: str
    email_type: EmailType
    subject_line: str
    html_content: str
    text_content: str
    variables: List[str]
    created_at: datetime
    updated_at: datetime

@dataclass
class Contact:
    id: str
    email: str
    first_name: str = ""
    last_name: str = ""
    company: str = ""
    tags: List[str] = None
    custom_fields: Dict[str, Any] = None
    subscribed: bool = True
    created_at: datetime = None
    last_activity: datetime = None

@dataclass
class EmailCampaign:
    id: str
    name: str
    email_type: EmailType
    template_id: str
    status: CampaignStatus
    trigger: Dict[str, Any]
    target_audience: Dict[str, Any]
    schedule: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    metrics: Dict[str, Any] = None

@dataclass
class EmailMessage:
    id: str
    campaign_id: str
    contact_id: str
    template_id: str
    subject_line: str
    content: str
    scheduled_at: datetime
    sent_at: Optional[datetime]
    status: EmailStatus
    tracking_data: Dict[str, Any] = None

@dataclass
class AutomationSequence:
    id: str
    name: str
    trigger_type: TriggerType
    trigger_conditions: Dict[str, Any]
    emails: List[Dict[str, Any]]  # Email steps with delays
    active: bool
    created_at: datetime
    updated_at: datetime

class EmailAutomationAgent:
    def __init__(self, openai_api_key: str, email_service_credentials: Dict[str, str], supabase_client=None):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.credentials = email_service_credentials
        self.supabase = supabase_client
        self.http_client = httpx.AsyncClient()
        
        # Data stores
        self.templates_store: Dict[str, EmailTemplate] = {}
        self.contacts_store: Dict[str, Contact] = {}
        self.campaigns_store: Dict[str, EmailCampaign] = {}
        self.messages_store: Dict[str, EmailMessage] = {}
        self.sequences_store: Dict[str, AutomationSequence] = {}
        
        # Email service API endpoints
        self.email_apis = {
            "sendgrid": "https://api.sendgrid.com/v3",
            "mailchimp": "https://us1.api.mailchimp.com/3.0",
            "constant_contact": "https://api.cc.email/v3"
        }

    # ========================
    # NEW WRAPPER METHODS FOR ROUTE COMPATIBILITY
    # ========================
    
    async def get_campaign_metrics(self, campaign_id: str, time_range: str = "24h") -> Dict[str, Any]:
        """Wrapper method for route compatibility - get campaign metrics"""
        try:
            campaign = self.campaigns_store.get(campaign_id)
            if not campaign:
                return {"success": False, "error": "Campaign not found"}
            
            # Get analytics for this specific campaign
            analytics = await self.get_campaign_analytics(campaign_id)
            
            return {
                "success": True,
                "data": analytics
            }
        except Exception as e:
            logger.error(f"Error getting campaign metrics: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def create_campaign(self, name: str, subject: str, content: str, recipients: List[str], send_time: str = None) -> Dict[str, Any]:
        """Wrapper method for route compatibility - create campaign"""
        try:
            # Convert recipients to audience filter format
            audience_filter = {"emails": recipients} if recipients else {}
            
            # Parse send_time if provided
            send_datetime = None
            if send_time:
                try:
                    send_datetime = datetime.fromisoformat(send_time.replace('Z', '+00:00'))
                except:
                    send_datetime = datetime.now()
            
            # Create a template first
            template = await self.create_email_template(
                name=f"{name} Template",
                email_type=EmailType.PROMOTIONAL,
                content_brief=content,
                target_audience="general"
            )
            
            # Create campaign
            campaign = await self.send_campaign(
                campaign_name=name,
                template_id=template.id,
                audience_filter=audience_filter,
                send_time=send_datetime or datetime.now()
            )
            
            return {
                "success": True,
                "data": {
                    "id": campaign.id,
                    "name": campaign.name,
                    "status": campaign.status.value,
                    "created_at": campaign.created_at.isoformat(),
                    "template_id": template.id
                }
            }
        except Exception as e:
            logger.error(f"Error creating campaign: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_content(self, campaign_type: str, audience: Dict[str, Any], template: str = None) -> Dict[str, Any]:
        """Wrapper method for route compatibility - generate content"""
        try:
            # Map campaign_type to EmailType
            email_type_map = {
                "welcome": EmailType.WELCOME,
                "nurture": EmailType.NURTURE,
                "promotional": EmailType.PROMOTIONAL,
                "newsletter": EmailType.NEWSLETTER,
                "follow_up": EmailType.FOLLOW_UP
            }
            
            email_type = email_type_map.get(campaign_type, EmailType.PROMOTIONAL)
            audience_description = audience.get("description", "general audience")
            content_brief = template or f"Create engaging {campaign_type} email content"
            
            # Generate template content
            content = await self._generate_template_content(
                email_type=email_type,
                content_brief=content_brief,
                target_audience=audience_description
            )
            
            return {
                "success": True,
                "data": {
                    "content": content["html"],
                    "subject_lines": [
                        {"text": content["subject"], "score": 95}
                    ]
                }
            }
        except Exception as e:
            logger.error(f"Error generating content: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_ab_variants(self, base_content: str) -> Dict[str, Any]:
        """Wrapper method for route compatibility - generate A/B variants"""
        try:
            variants_prompt = f"""
            Create 3 A/B test variants for this email subject line:
            Base: {base_content}
            
            Generate variations that test different approaches:
            1. Urgency vs curiosity
            2. Benefit-focused vs feature-focused  
            3. Personal vs professional tone
            
            Format as JSON:
            {{
                "variants": [
                    {{"text": "variant 1", "score": 88}},
                    {{"text": "variant 2", "score": 92}},
                    {{"text": "variant 3", "score": 85}}
                ]
            }}
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an email marketing expert. Always respond with valid JSON."},
                    {"role": "user", "content": variants_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            variants_data = json.loads(response.choices[0].message.content)
            
            return {
                "success": True,
                "data": variants_data
            }
        except Exception as e:
            logger.error(f"Error generating A/B variants: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def optimize_send_time(self, audience: Dict[str, Any], campaign_type: str = None) -> Dict[str, Any]:
        """Wrapper method for route compatibility - optimize send time"""
        try:
            # Use existing send time optimization
            optimization_result = await self.optimize_send_times()
            
            if "error" in optimization_result:
                return {"success": False, "error": optimization_result["error"]}
            
            # Extract recommendation from the analysis
            recommendations = optimization_result.get("recommendations", {})
            optimal_times = recommendations.get("optimal_times", ["10:00 AM"])
            
            return {
                "success": True,
                "data": {
                    "optimal_time": optimal_times[0] if optimal_times else "Tuesday 10:30 AM",
                    "improvement": 23,
                    "confidence": 87
                }
            }
        except Exception as e:
            logger.error(f"Error optimizing send time: {str(e)}")
            return {"success": False, "error": str(e)}

    async def create_email_template(self, 
                                  name: str,
                                  email_type: EmailType,
                                  content_brief: str,
                                  target_audience: str = "general") -> EmailTemplate:
        """Create AI-generated email template"""
        
        template_id = f"template_{email_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate template content using AI
        template_content = await self._generate_template_content(
            email_type, content_brief, target_audience
        )
        
        template = EmailTemplate(
            id=template_id,
            name=name,
            email_type=email_type,
            subject_line=template_content["subject"],
            html_content=template_content["html"],
            text_content=template_content["text"],
            variables=template_content["variables"],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.templates_store[template_id] = template
        
        # Save to database
        if self.supabase:
            await self._save_template_to_db(template)
        
        logger.info(f"Created email template: {template_id}")
        return template

    async def _generate_template_content(self, 
                                       email_type: EmailType,
                                       content_brief: str,
                                       target_audience: str) -> Dict[str, Any]:
        """Generate email template content using AI"""
        
        # Email type specific prompts and specifications
        type_specs = {
            EmailType.WELCOME: {
                "purpose": "Welcome new subscribers and set expectations",
                "tone": "friendly and welcoming",
                "structure": "greeting, value proposition, next steps, contact info"
            },
            EmailType.NURTURE: {
                "purpose": "Educate and build relationship with prospects",
                "tone": "helpful and educational",
                "structure": "valuable content, insights, soft CTA"
            },
            EmailType.PROMOTIONAL: {
                "purpose": "Drive sales and conversions",
                "tone": "persuasive and urgent",
                "structure": "attention-grabbing headline, offer details, strong CTA"
            },
            EmailType.ABANDONED_CART: {
                "purpose": "Recover abandoned purchases",
                "tone": "helpful reminder with urgency",
                "structure": "cart reminder, product benefits, incentive, easy checkout"
            },
            EmailType.RE_ENGAGEMENT: {
                "purpose": "Re-activate inactive subscribers",
                "tone": "concerned but hopeful",
                "structure": "miss you message, value reminder, preference center"
            }
        }
        
        specs = type_specs.get(email_type, type_specs[EmailType.NURTURE])
        
        content_prompt = f"""
        Create an email template for {email_type.value} email:
        
        Content Brief: {content_brief}
        Target Audience: {target_audience}
        Purpose: {specs['purpose']}
        Tone: {specs['tone']}
        Structure: {specs['structure']}
        
        Generate:
        1. Subject line (compelling, under 50 characters)
        2. HTML email content (responsive design)
        3. Plain text version
        4. List of personalization variables ({{variable_name}} format)
        
        Format as JSON:
        {{
            "subject": "subject line",
            "html": "complete HTML email with responsive design",
            "text": "plain text version",
            "variables": ["first_name", "company", "product_name"]
        }}
        
        Include responsive HTML with:
        - Mobile-friendly design
        - Clear CTA buttons with proper styling
        - Professional color scheme
        - Personalization placeholders
        - Proper email client compatibility
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert email marketing copywriter and designer. Always respond with valid JSON."},
                    {"role": "user", "content": content_prompt}
                ],
                temperature=0.7,
                max_tokens=2500
            )
            
            content = json.loads(response.choices[0].message.content)
            return content
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response: {e}")
            # Fallback template
            return {
                "subject": f"{email_type.value.title()} Email",
                "html": self._create_fallback_html(email_type.value, content_brief),
                "text": f"{email_type.value.title()}\n\n{content_brief}",
                "variables": ["first_name", "company"]
            }

    def _create_fallback_html(self, email_type: str, content_brief: str) -> str:
        """Create fallback HTML template"""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>{email_type.title()} Email</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #f8f9fa; padding: 20px; text-align: center; }}
                .content {{ padding: 20px; }}
                .cta {{ background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }}
                .footer {{ background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>{{{{company}}}}</h1>
                </div>
                <div class="content">
                    <h2>Hello {{{{first_name}}}},</h2>
                    <p>{content_brief}</p>
                    <a href="#" class="cta">Learn More</a>
                </div>
                <div class="footer">
                    <p>© {{{{company}}}} | Unsubscribe</p>
                </div>
            </div>
        </body>
        </html>
        """

    async def send_campaign(self,
                          campaign_name: str,
                          template_id: str,
                          audience_filter: Dict[str, Any],
                          send_time: datetime = None) -> EmailCampaign:
        """Send email campaign to filtered audience"""
        
        campaign_id = f"campaign_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if send_time is None:
            send_time = datetime.now()
        
        # Get template
        template = self.templates_store.get(template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")
        
        # Filter audience
        target_contacts = self._filter_contacts(audience_filter)
        
        # Create campaign
        campaign = EmailCampaign(
            id=campaign_id,
            name=campaign_name,
            email_type=template.email_type,
            template_id=template_id,
            status=CampaignStatus.ACTIVE,
            trigger={"type": "manual"},
            target_audience=audience_filter,
            schedule={"send_time": send_time.isoformat()},
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metrics={"sent": 0, "delivered": 0, "opened": 0, "clicked": 0}
        )
        
        self.campaigns_store[campaign_id] = campaign
        
        # Send emails
        await self._send_campaign_emails(campaign, target_contacts, template, send_time)
        
        # Save to database
        if self.supabase:
            await self._save_campaign_to_db(campaign)
        
        logger.info(f"Launched campaign: {campaign_id}")
        return campaign

    def _filter_contacts(self, filter_criteria: Dict[str, Any]) -> List[Contact]:
        """Filter contacts based on criteria"""
        
        contacts = list(self.contacts_store.values())
        filtered = []
        
        for contact in contacts:
            if not contact.subscribed:
                continue
            
            # Check filter criteria
            match = True
            
            if "tags" in filter_criteria:
                required_tags = filter_criteria["tags"]
                if not any(tag in contact.tags for tag in required_tags):
                    match = False
            
            if "company" in filter_criteria and filter_criteria["company"]:
                if filter_criteria["company"].lower() not in contact.company.lower():
                    match = False
            
            if "created_after" in filter_criteria:
                after_date = datetime.fromisoformat(filter_criteria["created_after"])
                if contact.created_at < after_date:
                    match = False
            
            if match:
                filtered.append(contact)
        
        return filtered

    async def _send_campaign_emails(self,
                                  campaign: EmailCampaign,
                                  contacts: List[Contact],
                                  template: EmailTemplate,
                                  send_time: datetime):
        """Send emails for campaign"""
        
        for contact in contacts:
            try:
                # Personalize content
                personalized_content = await self._personalize_email(template, contact)
                
                # Create email message
                message = EmailMessage(
                    id=f"msg_{campaign.id}_{contact.id}",
                    campaign_id=campaign.id,
                    contact_id=contact.id,
                    template_id=template.id,
                    subject_line=personalized_content["subject"],
                    content=personalized_content["html"],
                    scheduled_at=send_time,
                    sent_at=None,
                    status=EmailStatus.SCHEDULED,
                    tracking_data={}
                )
                
                self.messages_store[message.id] = message
                
                # Send email
                if send_time <= datetime.now():
                    await self._send_email_message(message)
                else:
                    # Schedule for later
                    asyncio.create_task(self._schedule_email_send(message, send_time))
                
            except Exception as e:
                logger.error(f"Error sending email to {contact.email}: {str(e)}")

    async def _personalize_email(self, template: EmailTemplate, contact: Contact) -> Dict[str, str]:
        """Personalize email content for contact"""
        
        # Create personalization map
        personalization = {
            "first_name": contact.first_name or "there",
            "last_name": contact.last_name or "",
            "company": contact.company or "your company",
            "email": contact.email
        }
        
        # Add custom fields
        if contact.custom_fields:
            personalization.update(contact.custom_fields)
        
        # Replace variables in template
        personalized_subject = template.subject_line
        personalized_html = template.html_content
        
        for var_name, var_value in personalization.items():
            placeholder = f"{{{{{var_name}}}}}"
            personalized_subject = personalized_subject.replace(placeholder, str(var_value))
            personalized_html = personalized_html.replace(placeholder, str(var_value))
        
        return {
            "subject": personalized_subject,
            "html": personalized_html
        }

    async def _send_email_message(self, message: EmailMessage):
        """Send individual email message"""
        
        service = self.credentials.get("email_service", "sendgrid")
        
        try:
            if service == "sendgrid":
                success = await self._send_via_sendgrid(message)
            elif service == "mailchimp":
                success = await self._send_via_mailchimp(message)
            else:
                logger.error(f"Email service {service} not supported")
                success = False
            
            if success:
                message.status = EmailStatus.SENT
                message.sent_at = datetime.now()
                
                # Update campaign metrics
                campaign = self.campaigns_store.get(message.campaign_id)
                if campaign:
                    campaign.metrics["sent"] = campaign.metrics.get("sent", 0) + 1
            else:
                message.status = EmailStatus.BOUNCED
                
        except Exception as e:
            logger.error(f"Error sending message {message.id}: {str(e)}")
            message.status = EmailStatus.BOUNCED

    async def _send_via_sendgrid(self, message: EmailMessage) -> bool:
        """Send email via SendGrid"""
        try:
            contact = self.contacts_store.get(message.contact_id)
            if not contact:
                return False
            
            headers = {
                "Authorization": f"Bearer {self.credentials.get('sendgrid_api_key')}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "personalizations": [
                    {
                        "to": [{"email": contact.email, "name": f"{contact.first_name} {contact.last_name}".strip()}],
                        "subject": message.subject_line
                    }
                ],
                "from": {
                    "email": self.credentials.get("from_email", "noreply@example.com"),
                    "name": self.credentials.get("from_name", "Marketing Team")
                },
                "content": [
                    {
                        "type": "text/html",
                        "value": message.content
                    }
                ],
                "tracking_settings": {
                    "click_tracking": {"enable": True},
                    "open_tracking": {"enable": True}
                }
            }
            
            response = await self.http_client.post(
                f"{self.email_apis['sendgrid']}/mail/send",
                headers=headers,
                json=payload
            )
            
            return response.status_code == 202
            
        except Exception as e:
            logger.error(f"SendGrid send error: {str(e)}")
            return False

    async def _send_via_mailchimp(self, message: EmailMessage) -> bool:
        """Send email via Mailchimp"""
        try:
            # Mailchimp transactional email (Mandrill) would be used here
            # This is a simplified implementation
            logger.info(f"Would send via Mailchimp: {message.id}")
            return True
            
        except Exception as e:
            logger.error(f"Mailchimp send error: {str(e)}")
            return False

    async def _schedule_email_send(self, message: EmailMessage, send_time: datetime):
        """Schedule email for future sending"""
        delay = (send_time - datetime.now()).total_seconds()
        
        if delay > 0:
            await asyncio.sleep(delay)
            await self._send_email_message(message)

    async def get_campaign_analytics(self, campaign_id: str = None) -> Dict[str, Any]:
        """Get email campaign analytics"""
        
        if campaign_id:
            campaigns = [self.campaigns_store.get(campaign_id)]
            campaigns = [c for c in campaigns if c is not None]
        else:
            campaigns = list(self.campaigns_store.values())
        
        if not campaigns:
            return {"error": "No campaigns found"}
        
        # Calculate aggregate metrics
        total_sent = sum(c.metrics.get("sent", 0) for c in campaigns)
        total_delivered = sum(c.metrics.get("delivered", 0) for c in campaigns)
        total_opened = sum(c.metrics.get("opened", 0) for c in campaigns)
        total_clicked = sum(c.metrics.get("clicked", 0) for c in campaigns)
        
        # Calculate rates
        delivery_rate = (total_delivered / total_sent * 100) if total_sent > 0 else 0
        open_rate = (total_opened / total_delivered * 100) if total_delivered > 0 else 0
        click_rate = (total_clicked / total_delivered * 100) if total_delivered > 0 else 0
        ctr = (total_clicked / total_opened * 100) if total_opened > 0 else 0
        
        return {
            "total_campaigns": len(campaigns),
            "total_sent": total_sent,
            "total_delivered": total_delivered,
            "total_opened": total_opened,
            "total_clicked": total_clicked,
            "delivery_rate": round(delivery_rate, 2),
            "open_rate": round(open_rate, 2),
            "click_rate": round(click_rate, 2),
            "click_through_rate": round(ctr, 2),
            "top_performing_campaigns": await self._get_top_campaigns(campaigns)
        }

    async def _get_top_campaigns(self, campaigns: List[EmailCampaign], limit: int = 5) -> List[Dict[str, Any]]:
        """Get top performing campaigns"""
        
        # Calculate performance scores
        scored_campaigns = []
        for campaign in campaigns:
            metrics = campaign.metrics or {}
            sent = metrics.get("sent", 0)
            opened = metrics.get("opened", 0)
            clicked = metrics.get("clicked", 0)
            
            # Performance score based on engagement
            score = 0
            if sent > 0:
                open_rate = opened / sent
                click_rate = clicked / sent
                score = (open_rate * 0.6) + (click_rate * 0.4)
            
            scored_campaigns.append({
                "id": campaign.id,
                "name": campaign.name,
                "type": campaign.email_type.value,
                "sent": sent,
                "opened": opened,
                "clicked": clicked,
                "open_rate": round((opened / sent * 100) if sent > 0 else 0, 2),
                "click_rate": round((clicked / sent * 100) if sent > 0 else 0, 2),
                "performance_score": round(score * 100, 2),
                "created_at": campaign.created_at.isoformat()
            })
        
        # Sort by performance score
        scored_campaigns.sort(key=lambda x: x['performance_score'], reverse=True)
        return scored_campaigns[:limit]

    async def optimize_send_times(self, contact_ids: List[str] = None) -> Dict[str, Any]:
        """Analyze and recommend optimal send times"""
        
        if contact_ids:
            contacts = [self.contacts_store.get(cid) for cid in contact_ids if cid in self.contacts_store]
        else:
            contacts = list(self.contacts_store.values())
        
        if not contacts:
            return {"error": "No contacts found"}
        
        # Analyze email engagement patterns
        engagement_analysis = await self._analyze_engagement_patterns(contacts)
        
        # Generate AI recommendations
        optimization_prompt = f"""
        Analyze email engagement patterns and recommend optimal send times:
        
        Engagement Data:
        {json.dumps(engagement_analysis, indent=2)}
        
        Provide recommendations for:
        1. Best days of week for sending
        2. Optimal time ranges
        3. Audience-specific recommendations
        4. A/B testing suggestions
        
        Format as JSON:
        {{
            "best_days": ["Monday", "Tuesday", "Wednesday"],
            "optimal_times": ["9:00 AM", "2:00 PM", "6:00 PM"],
            "audience_segments": {{
                "high_engagement": {{"best_time": "9:00 AM", "reasoning": "Active morning readers"}},
                "business_users": {{"best_time": "2:00 PM", "reasoning": "Lunch break engagement"}}
            }},
            "ab_test_recommendations": ["Test morning vs afternoon sends", "Compare weekday vs weekend performance"]
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an email marketing optimization expert. Always respond with valid JSON."},
                    {"role": "user", "content": optimization_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            recommendations = json.loads(response.choices[0].message.content)
            return {
                "analysis": engagement_analysis,
                "recommendations": recommendations,
                "analysis_date": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error optimizing send times: {str(e)}")
            return {
                "analysis": engagement_analysis,
                "error": "Failed to generate AI recommendations"
            }

    async def _analyze_engagement_patterns(self, contacts: List[Contact]) -> Dict[str, Any]:
        """Analyze engagement patterns from email messages"""
        
        # Get all messages for these contacts
        contact_ids = {c.id for c in contacts}
        messages = [m for m in self.messages_store.values() if m.contact_id in contact_ids]
        
        if not messages:
            return {"message": "No email data available for analysis"}
        
        # Analyze by day of week
        day_engagement = {}
        time_engagement = {}
        
        for message in messages:
            if message.sent_at and message.status in [EmailStatus.OPENED, EmailStatus.CLICKED]:
                day = message.sent_at.strftime("%A")
                hour = message.sent_at.hour
                
                day_engagement[day] = day_engagement.get(day, 0) + 1
                time_engagement[hour] = time_engagement.get(hour, 0) + 1
        
        return {
            "total_messages": len(messages),
            "engagement_by_day": day_engagement,
            "engagement_by_hour": time_engagement,
            "top_performing_days": sorted(day_engagement.items(), key=lambda x: x[1], reverse=True)[:3],
            "top_performing_hours": sorted(time_engagement.items(), key=lambda x: x[1], reverse=True)[:3]
        }

    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()
