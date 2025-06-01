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

    async def create_automation_sequence(self,
                                       name: str,
                                       trigger_type: TriggerType,
                                       trigger_conditions: Dict[str, Any],
                                       sequence_brief: str) -> AutomationSequence:
        """Create automated email sequence"""
        
        sequence_id = f"sequence_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Generate sequence structure using AI
        sequence_emails = await self._generate_sequence_structure(
            trigger_type, trigger_conditions, sequence_brief
        )
        
        sequence = AutomationSequence(
            id=sequence_id,
            name=name,
            trigger_type=trigger_type,
            trigger_conditions=trigger_conditions,
            emails=sequence_emails,
            active=True,
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        self.sequences_store[sequence_id] = sequence
        
        # Create templates for each email in sequence
        for i, email_config in enumerate(sequence_emails):
            template_name = f"{name} - Email {i+1}"
            template = await self.create_email_template(
                template_name,
                EmailType(email_config["type"]),
                email_config["content_brief"],
                email_config.get("target_audience", "general")
            )
            email_config["template_id"] = template.id
        
        # Save to database
        if self.supabase:
            await self._save_sequence_to_db(sequence)
        
        logger.info(f"Created automation sequence: {sequence_id}")
        return sequence

    async def _generate_sequence_structure(self,
                                         trigger_type: TriggerType,
                                         trigger_conditions: Dict[str, Any],
                                         sequence_brief: str) -> List[Dict[str, Any]]:
        """Generate automated sequence structure using AI"""
        
        structure_prompt = f"""
        Design an email automation sequence:
        
        Trigger: {trigger_type.value}
        Trigger Conditions: {json.dumps(trigger_conditions, indent=2)}
        Sequence Brief: {sequence_brief}
        
        Create a sequence of 3-7 emails with:
        1. Logical flow and timing
        2. Varied content types and purposes
        3. Progressive value delivery
        4. Clear conversion path
        
        For each email specify:
        - Delay from previous email (in days)
        - Email type (welcome, nurture, promotional, etc.)
        - Content brief (what the email should accomplish)
        - Target audience description
        
        Format as JSON array:
        [
            {{
                "delay_days": 0,
                "type": "welcome",
                "content_brief": "Welcome new subscriber and set expectations",
                "target_audience": "new subscribers"
            }},
            {{
                "delay_days": 3,
                "type": "nurture",
                "content_brief": "Provide valuable educational content",
                "target_audience": "engaged subscribers"
            }}
        ]
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an email marketing automation expert. Always respond with valid JSON."},
                    {"role": "user", "content": structure_prompt}
                ],
                temperature=0.6,
                max_tokens=1500
            )
            
            sequence_structure = json.loads(response.choices[0].message.content)
            return sequence_structure
            
        except Exception as e:
            logger.error(f"Error generating sequence structure: {str(e)}")
            # Fallback sequence
            return [
                {
                    "delay_days": 0,
                    "type": "welcome",
                    "content_brief": "Welcome and introduction",
                    "target_audience": "new subscribers"
                },
                {
                    "delay_days": 3,
                    "type": "nurture",
                    "content_brief": "Educational content and value",
                    "target_audience": "engaged subscribers"
                },
                {
                    "delay_days": 7,
                    "type": "promotional",
                    "content_brief": "Special offer or call to action",
                    "target_audience": "warm prospects"
                }
            ]

    async def add_contact(self, 
                         email: str,
                         first_name: str = "",
                         last_name: str = "",
                         company: str = "",
                         tags: List[str] = None,
                         custom_fields: Dict[str, Any] = None) -> Contact:
        """Add new contact to email list"""
        
        contact_id = f"contact_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(email) % 10000}"
        
        contact = Contact(
            id=contact_id,
            email=email,
            first_name=first_name,
            last_name=last_name,
            company=company,
            tags=tags or [],
            custom_fields=custom_fields or {},
            subscribed=True,
            created_at=datetime.now(),
            last_activity=datetime.now()
        )
        
        self.contacts_store[contact_id] = contact
        
        # Add to email service
        await self._add_contact_to_service(contact)
        
        # Trigger automation sequences
        await self._trigger_automation_sequences(contact, "contact_added")
        
        # Save to database
        if self.supabase:
            await self._save_contact_to_db(contact)
        
        logger.info(f"Added contact: {email}")
        return contact

    async def _add_contact_to_service(self, contact: Contact):
        """Add contact to email service provider"""
        
        service = self.credentials.get("email_service", "sendgrid")
        
        if service == "sendgrid":
            await self._add_to_sendgrid(contact)
        elif service == "mailchimp":
            await self._add_to_mailchimp(contact)
        else:
            logger.warning(f"Email service {service} not implemented")

    async def _add_to_sendgrid(self, contact: Contact):
        """Add contact to SendGrid"""
        try:
            headers = {
                "Authorization": f"Bearer {self.credentials.get('sendgrid_api_key')}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "contacts": [
                    {
                        "email": contact.email,
                        "first_name": contact.first_name,
                        "last_name": contact.last_name,
                        "custom_fields": contact.custom_fields
                    }
                ]
            }
            
            response = await self.http_client.put(
                f"{self.email_apis['sendgrid']}/marketing/contacts",
                headers=headers,
                json=payload
            )
            
            if response.status_code not in [200, 202]:
                logger.error(f"SendGrid add contact failed: {response.text}")
                
        except Exception as e:
            logger.error(f"Error adding contact to SendGrid: {str(e)}")

    async def _add_to_mailchimp(self, contact: Contact):
        """Add contact to Mailchimp"""
        try:
            api_key = self.credentials.get("mailchimp_api_key")
            list_id = self.credentials.get("mailchimp_list_id")
            
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "email_address": contact.email,
                "status": "subscribed",
                "merge_fields": {
                    "FNAME": contact.first_name,
                    "LNAME": contact.last_name,
                    "COMPANY": contact.company
                }
            }
            
            response = await self.http_client.post(
                f"{self.email_apis['mailchimp']}/lists/{list_id}/members",
                headers=headers,
                json=payload
            )
            
            if response.status_code not in [200, 201]:
                logger.error(f"Mailchimp add contact failed: {response.text}")
                
        except Exception as e:
            logger.error(f"Error adding contact to Mailchimp: {str(e)}")

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

    async def _trigger_automation_sequences(self, contact: Contact, trigger_event: str):
        """Trigger relevant automation sequences for contact"""
        
        for sequence in self.sequences_store.values():
            if not sequence.active:
                continue
            
            # Check trigger conditions
            if self._check_trigger_conditions(sequence, contact, trigger_event):
                await self._start_sequence_for_contact(sequence, contact)

    def _check_trigger_conditions(self, 
                                 sequence: AutomationSequence, 
                                 contact: Contact, 
                                 trigger_event: str) -> bool:
        """Check if sequence should trigger for contact"""
        
        conditions = sequence.trigger_conditions
        
        # Event-based triggers
        if sequence.trigger_type == TriggerType.EVENT_BASED:
            return conditions.get("event") == trigger_event
        
        # Behavior-based triggers
        elif sequence.trigger_type == TriggerType.BEHAVIOR_BASED:
            # Check contact behavior (simplified)
            if "tags" in conditions:
                return any(tag in contact.tags for tag in conditions["tags"])
        
        # Time-based triggers
        elif sequence.trigger_type == TriggerType.TIME_BASED:
            # Check timing conditions (simplified)
            return True
        
        return False

    async def _start_sequence_for_contact(self, sequence: AutomationSequence, contact: Contact):
        """Start automation sequence for specific contact"""
        
        logger.info(f"Starting sequence {sequence.id} for contact {contact.email}")
        
        # Schedule each email in the sequence
        for i, email_config in enumerate(sequence.emails):
            delay_days = email_config.get("delay_days", 0)
            send_time = datetime.now() + timedelta(days=delay_days)
            
            template_id = email_config.get("template_id")
            if template_id and template_id in self.templates_store:
                # Create and schedule message
                message = EmailMessage(
                    id=f"seq_{sequence.id}_{contact.id}_{i}",
                    campaign_id=f"auto_{sequence.id}",
                    contact_id=contact.id,
                    template_id=template_id,
                    subject_line="",  # Will be set during personalization
                    content="",
                    scheduled_at=send_time,
                    sent_at=None,
                    status=EmailStatus.SCHEDULED,
                    tracking_data={}
                )
                
                self.messages_store[message.id] = message
                
                # Schedule the email
                asyncio.create_task(self._schedule_sequence_email(message, send_time))

    async def _schedule_sequence_email(self, message: EmailMessage, send_time: datetime):
        """Schedule individual sequence email"""
        delay = (send_time - datetime.now()).total_seconds()
        
        if delay > 0:
            await asyncio.sleep(delay)
        
        # Get template and contact
        template = self.templates_store.get(message.template_id)
        contact = self.contacts_store.get(message.contact_id)
        
        if template and contact:
            # Personalize and send
            personalized = await self._personalize_email(template, contact)
            message.subject_line = personalized["subject"]
            message.content = personalized["html"]
            
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

    async def segment_audience(self, segmentation_criteria: Dict[str, Any]) -> Dict[str, List[Contact]]:
        """Segment audience based on criteria"""
        
        segments = {}
        all_contacts = list(self.contacts_store.values())
        
        # Behavior-based segmentation
        if "engagement_level" in segmentation_criteria:
            segments.update(await self._segment_by_engagement(all_contacts))
        
        # Demographic segmentation
        if "demographics" in segmentation_criteria:
            segments.update(self._segment_by_demographics(all_contacts, segmentation_criteria["demographics"]))
        
        # Custom field segmentation
        if "custom_fields" in segmentation_criteria:
            segments.update(self._segment_by_custom_fields(all_contacts, segmentation_criteria["custom_fields"]))
        
        # AI-powered segmentation
        if "ai_segmentation" in segmentation_criteria:
            ai_segments = await self._ai_powered_segmentation(all_contacts, segmentation_criteria["ai_segmentation"])
            segments.update(ai_segments)
        
        return segments

    async def _segment_by_engagement(self, contacts: List[Contact]) -> Dict[str, List[Contact]]:
        """Segment contacts by engagement level"""
        
        high_engagement = []
        medium_engagement = []
        low_engagement = []
        
        for contact in contacts:
            # Calculate engagement score based on email interactions
            contact_messages = [m for m in self.messages_store.values() if m.contact_id == contact.id]
            
            if not contact_messages:
                low_engagement.append(contact)
                continue
            
            # Calculate engagement metrics
            total_sent = len(contact_messages)
            opened = len([m for m in contact_messages if m.status in [EmailStatus.OPENED, EmailStatus.CLICKED]])
            clicked = len([m for m in contact_messages if m.status == EmailStatus.CLICKED])
            
            open_rate = opened / total_sent if total_sent > 0 else 0
            click_rate = clicked / total_sent if total_sent > 0 else 0
            
            engagement_score = (open_rate * 0.7) + (click_rate * 0.3)
            
            if engagement_score >= 0.4:
                high_engagement.append(contact)
            elif engagement_score >= 0.2:
                medium_engagement.append(contact)
            else:
                low_engagement.append(contact)
        
        return {
            "high_engagement": high_engagement,
            "medium_engagement": medium_engagement,
            "low_engagement": low_engagement
        }

    def _segment_by_demographics(self, contacts: List[Contact], criteria: Dict[str, Any]) -> Dict[str, List[Contact]]:
        """Segment contacts by demographic criteria"""
        
        segments = {}
        
        if "company_size" in criteria:
            # Example: segment by company domain (proxy for size)
            enterprise = []
            small_business = []
            
            for contact in contacts:
                domain = contact.email.split('@')[1] if '@' in contact.email else ""
                # Simple heuristic - could be enhanced with company data
                if any(indicator in domain.lower() for indicator in ['corp', 'inc', 'ltd', 'llc']):
                    enterprise.append(contact)
                else:
                    small_business.append(contact)
            
            segments.update({
                "enterprise": enterprise,
                "small_business": small_business
            })
        
        return segments

    def _segment_by_custom_fields(self, contacts: List[Contact], field_criteria: Dict[str, Any]) -> Dict[str, List[Contact]]:
        """Segment contacts by custom fields"""
        
        segments = {}
        
        for field_name, field_values in field_criteria.items():
            for value in field_values:
                segment_name = f"{field_name}_{value}"
                segments[segment_name] = [
                    c for c in contacts 
                    if c.custom_fields and c.custom_fields.get(field_name) == value
                ]
        
        return segments

    async def _ai_powered_segmentation(self, contacts: List[Contact], criteria: str) -> Dict[str, List[Contact]]:
        """Use AI to create intelligent segments"""
        
        # Prepare contact data for AI analysis
        contact_data = []
        for contact in contacts[:50]:  # Limit for API efficiency
            messages = [m for m in self.messages_store.values() if m.contact_id == contact.id]
            
            contact_summary = {
                "email": contact.email,
                "company": contact.company,
                "tags": contact.tags,
                "email_count": len(messages),
                "last_activity": contact.last_activity.isoformat() if contact.last_activity else None,
                "custom_fields": contact.custom_fields or {}
            }
            contact_data.append(contact_summary)
        
        segmentation_prompt = f"""
        Analyze these contacts and create intelligent segments based on: {criteria}
        
        Contact Data:
        {json.dumps(contact_data[:10], indent=2)}  # Sample for prompt
        
        Create 3-5 meaningful segments that would be useful for targeted marketing.
        For each segment, provide:
        1. Segment name
        2. Description of the segment
        3. Email addresses that belong to this segment
        
        Format as JSON:
        {{
            "segment_name": {{
                "description": "segment description",
                "emails": ["email1@example.com", "email2@example.com"]
            }}
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert in customer segmentation and marketing analytics."},
                    {"role": "user", "content": segmentation_prompt}
                ],
                temperature=0.4,
                max_tokens=1500
            )
            
            ai_segments_data = json.loads(response.choices[0].message.content)
            
            # Convert email lists back to Contact objects
            email_to_contact = {c.email: c for c in contacts}
            ai_segments = {}
            
            for segment_name, segment_info in ai_segments_data.items():
                segment_contacts = []
                for email in segment_info.get("emails", []):
                    if email in email_to_contact:
                        segment_contacts.append(email_to_contact[email])
                
                if segment_contacts:
                    ai_segments[segment_name] = segment_contacts
            
            return ai_segments
            
        except Exception as e:
            logger.error(f"Error in AI segmentation: {str(e)}")
            return {}

    async def create_drip_campaign(self,
                                 name: str,
                                 audience_segment: str,
                                 campaign_goal: str,
                                 duration_days: int = 30) -> AutomationSequence:
        """Create AI-optimized drip campaign"""
        
        drip_prompt = f"""
        Design a {duration_days}-day drip email campaign:
        
        Campaign Name: {name}
        Target Audience: {audience_segment}
        Goal: {campaign_goal}
        Duration: {duration_days} days
        
        Create an email sequence that:
        1. Progressively nurtures leads toward the goal
        2. Provides value at each touchpoint
        3. Maintains optimal sending frequency
        4. Includes varied content types
        
        Suggest 5-12 emails with:
        - Day to send (spacing for optimal engagement)
        - Email purpose and type
        - Subject line suggestion
        - Content outline
        - Call-to-action
        
        Format as JSON array:
        [
            {{
                "day": 1,
                "type": "welcome",
                "subject": "Welcome to [Campaign Name]",
                "purpose": "Introduction and expectation setting",
                "content_outline": "Brief content description",
                "cta": "Main call-to-action"
            }}
        ]
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert email marketing strategist specializing in drip campaigns."},
                    {"role": "user", "content": drip_prompt}
                ],
                temperature=0.6,
                max_tokens=2000
            )
            
            drip_structure = json.loads(response.choices[0].message.content)
            
            # Convert to automation sequence format
            sequence_emails = []
            for email_config in drip_structure:
                sequence_emails.append({
                    "delay_days": email_config["day"] - 1,  # Convert to delay from start
                    "type": email_config["type"],
                    "content_brief": f"{email_config['purpose']} - {email_config['content_outline']}",
                    "target_audience": audience_segment,
                    "subject_suggestion": email_config["subject"],
                    "cta": email_config["cta"]
                })
            
            # Create automation sequence
            sequence = await self.create_automation_sequence(
                name=name,
                trigger_type=TriggerType.MANUAL,
                trigger_conditions={"segment": audience_segment},
                sequence_brief=f"Drip campaign for {campaign_goal}"
            )
            
            # Update with drip-specific structure
            sequence.emails = sequence_emails
            
            return sequence
            
        except Exception as e:
            logger.error(f"Error creating drip campaign: {str(e)}")
            raise

    async def a_b_test_subject_lines(self,
                                   template_id: str,
                                   test_variants: List[str],
                                   test_percentage: float = 0.2) -> Dict[str, Any]:
        """A/B test different subject lines"""
        
        template = self.templates_store.get(template_id)
        if not template:
            raise ValueError(f"Template {template_id} not found")
        
        # Get contacts for testing
        all_contacts = [c for c in self.contacts_store.values() if c.subscribed]
        if len(all_contacts) < 100:
            return {"error": "Need at least 100 contacts for meaningful A/B test"}
        
        # Calculate test group sizes
        test_size = int(len(all_contacts) * test_percentage)
        variant_size = test_size // len(test_variants)
        
        test_results = {}
        test_id = f"abtest_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        for i, variant in enumerate(test_variants):
            start_idx = i * variant_size
            end_idx = start_idx + variant_size
            test_contacts = all_contacts[start_idx:end_idx]
            
            # Create test campaign
            test_campaign = EmailCampaign(
                id=f"{test_id}_variant_{i}",
                name=f"A/B Test Variant {i+1}: {variant[:30]}...",
                email_type=template.email_type,
                template_id=template_id,
                status=CampaignStatus.ACTIVE,
                trigger={"type": "ab_test"},
                target_audience={"test_variant": i},
                schedule={"send_time": datetime.now().isoformat()},
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metrics={"sent": 0, "opened": 0, "clicked": 0}
            )
            
            self.campaigns_store[test_campaign.id] = test_campaign
            
            # Send test emails with variant subject line
            for contact in test_contacts:
                personalized = await self._personalize_email(template, contact)
                
                message = EmailMessage(
                    id=f"abtest_{test_campaign.id}_{contact.id}",
                    campaign_id=test_campaign.id,
                    contact_id=contact.id,
                    template_id=template_id,
                    subject_line=variant,  # Use test variant
                    content=personalized["html"],
                    scheduled_at=datetime.now(),
                    sent_at=None,
                    status=EmailStatus.SCHEDULED,
                    tracking_data={"ab_test_variant": i}
                )
                
                self.messages_store[message.id] = message
                await self._send_email_message(message)
            
            test_results[f"variant_{i}"] = {
                "subject_line": variant,
                "contacts_tested": len(test_contacts),
                "campaign_id": test_campaign.id
            }
        
        return {
            "test_id": test_id,
            "variants": test_results,
            "test_percentage": test_percentage,
            "total_contacts_tested": test_size,
            "status": "running",
            "created_at": datetime.now().isoformat()
        }

    async def update_contact_engagement(self, 
                                      contact_id: str, 
                                      engagement_data: Dict[str, Any]) -> bool:
        """Update contact engagement data from email tracking"""
        
        contact = self.contacts_store.get(contact_id)
        if not contact:
            return False
        
        # Update last activity
        contact.last_activity = datetime.now()
        
        # Update engagement tags based on behavior
        engagement_tags = []
        
        if engagement_data.get("email_opened"):
            engagement_tags.append("email_opener")
        
        if engagement_data.get("email_clicked"):
            engagement_tags.append("email_clicker")
            
        if engagement_data.get("frequent_opener"):
            engagement_tags.append("highly_engaged")
        
        # Add engagement tags
        for tag in engagement_tags:
            if tag not in contact.tags:
                contact.tags.append(tag)
        
        # Save to database
        if self.supabase:
            await self._save_contact_to_db(contact)
        
        return True

    async def _save_template_to_db(self, template: EmailTemplate):
        """Save template to database"""
        if not self.supabase:
            return
        
        try:
            template_data = asdict(template)
            template_data["email_type"] = template.email_type.value
            template_data["created_at"] = template.created_at.isoformat()
            template_data["updated_at"] = template.updated_at.isoformat()
            
            self.supabase.table('email_templates').upsert(template_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving template to database: {str(e)}")

    async def _save_contact_to_db(self, contact: Contact):
        """Save contact to database"""
        if not self.supabase:
            return
        
        try:
            contact_data = asdict(contact)
            contact_data["created_at"] = contact.created_at.isoformat() if contact.created_at else None
            contact_data["last_activity"] = contact.last_activity.isoformat() if contact.last_activity else None
            
            self.supabase.table('email_contacts').upsert(contact_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving contact to database: {str(e)}")

    async def _save_campaign_to_db(self, campaign: EmailCampaign):
        """Save campaign to database"""
        if not self.supabase:
            return
        
        try:
            campaign_data = asdict(campaign)
            campaign_data["email_type"] = campaign.email_type.value
            campaign_data["status"] = campaign.status.value
            campaign_data["created_at"] = campaign.created_at.isoformat()
            campaign_data["updated_at"] = campaign.updated_at.isoformat()
            
            self.supabase.table('email_campaigns').upsert(campaign_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving campaign to database: {str(e)}")

    async def _save_sequence_to_db(self, sequence: AutomationSequence):
        """Save automation sequence to database"""
        if not self.supabase:
            return
        
        try:
            sequence_data = asdict(sequence)
            sequence_data["trigger_type"] = sequence.trigger_type.value
            sequence_data["created_at"] = sequence.created_at.isoformat()
            sequence_data["updated_at"] = sequence.updated_at.isoformat()
            
            self.supabase.table('automation_sequences').upsert(sequence_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving sequence to database: {str(e)}")

    # Getter methods
    def get_template(self, template_id: str) -> Optional[EmailTemplate]:
        """Get template by ID"""
        return self.templates_store.get(template_id)

    def list_templates(self, email_type: EmailType = None) -> List[EmailTemplate]:
        """List templates with optional filtering"""
        templates = list(self.templates_store.values())
        
        if email_type:
            templates = [t for t in templates if t.email_type == email_type]
        
        templates.sort(key=lambda x: x.created_at, reverse=True)
        return templates

    def get_contact(self, contact_id: str) -> Optional[Contact]:
        """Get contact by ID"""
        return self.contacts_store.get(contact_id)

    def list_contacts(self, subscribed_only: bool = True, limit: int = 100) -> List[Contact]:
        """List contacts with optional filtering"""
        contacts = list(self.contacts_store.values())
        
        if subscribed_only:
            contacts = [c for c in contacts if c.subscribed]
        
        contacts.sort(key=lambda x: x.created_at or datetime.min, reverse=True)
        return contacts[:limit]

    def get_campaign(self, campaign_id: str) -> Optional[EmailCampaign]:
        """Get campaign by ID"""
        return self.campaigns_store.get(campaign_id)

    def list_campaigns(self, status: CampaignStatus = None) -> List[EmailCampaign]:
        """List campaigns with optional filtering"""
        campaigns = list(self.campaigns_store.values())
        
        if status:
            campaigns = [c for c in campaigns if c.status == status]
        
        campaigns.sort(key=lambda x: x.created_at, reverse=True)
        return campaigns

    def get_sequence(self, sequence_id: str) -> Optional[AutomationSequence]:
        """Get automation sequence by ID"""
        return self.sequences_store.get(sequence_id)

    def list_sequences(self, active_only: bool = True) -> List[AutomationSequence]:
        """List automation sequences"""
        sequences = list(self.sequences_store.values())
        
        if active_only:
            sequences = [s for s in sequences if s.active]
        
        sequences.sort(key=lambda x: x.created_at, reverse=True)
        return sequences

    async def close(self):
        """Close HTTP client"""
        await self.http_client.aclose()
