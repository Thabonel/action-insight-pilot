"""
Lead Capture Routes

Handles form submissions, webhook receivers, and form configuration
for capturing leads from embedded forms on landing pages.
"""

from fastapi import APIRouter, Depends, Request, HTTPException
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token, get_current_user
from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/lead-capture", tags=["lead-capture"])

# ==================== Webhook Receiver (Public - No Auth) ====================

@router.post("/webhook/{form_id}")
async def receive_form_submission(form_id: str, request: Request):
    """
    Public webhook endpoint for form submissions

    This endpoint receives form submissions from embedded forms.
    No authentication required since it's called from external websites.

    Args:
        form_id: Unique form identifier
        request: Raw request containing form data

    Returns:
        Success message with lead ID
    """
    try:
        # Get form data from request body
        form_data = await request.json()

        logger.info(f"📥 Received form submission for form {form_id}")
        logger.debug(f"Form data: {form_data}")

        # Get form configuration to validate and get campaign info
        supabase = get_supabase()
        form_result = supabase.table('lead_capture_forms') \
            .select('*') \
            .eq('id', form_id) \
            .eq('active', True) \
            .single() \
            .execute()

        if not form_result.data:
            logger.error(f"❌ Form {form_id} not found or inactive")
            raise HTTPException(status_code=404, detail="Form not found or inactive")

        form_config = form_result.data

        # Extract lead data from submission
        lead_data = {
            'id': str(uuid.uuid4()),
            'form_id': form_id,
            'campaign_id': form_config.get('campaign_id'),
            'user_id': form_config.get('created_by'),
            'email': form_data.get('email'),
            'name': form_data.get('name'),
            'phone': form_data.get('phone'),
            'company': form_data.get('company'),
            'custom_fields': form_data.get('custom_fields', {}),
            'source': 'embedded_form',
            'status': 'new',
            'score': 0,
            'tags': [form_config.get('name', 'Form Lead')],
            'created_at': datetime.now().isoformat(),
            'metadata': {
                'form_name': form_config.get('name'),
                'campaign_name': form_config.get('campaign_name'),
                'referrer': form_data.get('referrer'),
                'utm_source': form_data.get('utm_source'),
                'utm_medium': form_data.get('utm_medium'),
                'utm_campaign': form_data.get('utm_campaign')
            }
        }

        # Validate required fields
        if not lead_data['email']:
            raise HTTPException(status_code=400, detail="Email is required")

        # Insert lead into database
        lead_result = supabase.table('leads').insert(lead_data).execute()

        if lead_result.data:
            lead_id = lead_result.data[0]['id']
            logger.info(f"✅ Lead captured: {lead_id} from form {form_id}")

            # Update form submission count
            supabase.table('lead_capture_forms').update({
                'submissions_count': form_config.get('submissions_count', 0) + 1,
                'last_submission_at': datetime.now().isoformat()
            }).eq('id', form_id).execute()

            return {
                "success": True,
                "lead_id": lead_id,
                "message": "Thank you! We'll be in touch soon."
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to save lead")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error processing form submission: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing submission: {str(e)}")

# ==================== Form Configuration (Authenticated) ====================

@router.get("/forms", response_model=APIResponse)
async def get_forms(token: str = Depends(verify_token)):
    """Get all lead capture forms for the authenticated user"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"📋 Getting forms for user: {user_id}")

        supabase = get_supabase()
        result = supabase.table('lead_capture_forms') \
            .select('*') \
            .eq('created_by', user_id) \
            .order('created_at', desc=True) \
            .execute()

        return APIResponse(success=True, data=result.data)

    except Exception as e:
        logger.error(f"❌ Error fetching forms: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/forms/{form_id}", response_model=APIResponse)
async def get_form(form_id: str, token: str = Depends(verify_token)):
    """Get specific lead capture form"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        supabase = get_supabase()
        result = supabase.table('lead_capture_forms') \
            .select('*') \
            .eq('id', form_id) \
            .eq('created_by', user_id) \
            .single() \
            .execute()

        if not result.data:
            return APIResponse(success=False, error="Form not found")

        return APIResponse(success=True, data=result.data)

    except Exception as e:
        logger.error(f"❌ Error fetching form: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/forms", response_model=APIResponse)
async def create_form(form_data: Dict[str, Any], token: str = Depends(verify_token)):
    """
    Create a new lead capture form

    Form data should include:
    - name: Form name
    - campaign_id: Associated campaign
    - fields: List of form fields
    - styling: Form styling configuration
    - settings: Form behavior settings
    """
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"🆕 Creating form for user: {user_id}")

        # Generate form ID
        form_id = str(uuid.uuid4())

        # Prepare form configuration
        form_config = {
            'id': form_id,
            'name': form_data.get('name', 'New Form'),
            'campaign_id': form_data.get('campaign_id'),
            'campaign_name': form_data.get('campaign_name', ''),
            'fields': form_data.get('fields', [
                {'name': 'name', 'type': 'text', 'label': 'Name', 'required': True},
                {'name': 'email', 'type': 'email', 'label': 'Email', 'required': True}
            ]),
            'styling': form_data.get('styling', {
                'button_color': '#3B82F6',
                'button_text': 'Submit',
                'success_message': 'Thank you! We\'ll be in touch soon.',
                'error_message': 'Something went wrong. Please try again.'
            }),
            'settings': form_data.get('settings', {
                'redirect_url': None,
                'send_email_notification': True,
                'double_opt_in': False
            }),
            'active': True,
            'submissions_count': 0,
            'created_by': user_id,
            'created_at': datetime.now().isoformat(),
            'updated_at': datetime.now().isoformat()
        }

        # Insert into database
        supabase = get_supabase()
        result = supabase.table('lead_capture_forms').insert(form_config).execute()

        if result.data:
            logger.info(f"✅ Form created: {form_id}")
            return APIResponse(success=True, data=result.data[0])
        else:
            return APIResponse(success=False, error="Failed to create form")

    except Exception as e:
        logger.error(f"❌ Error creating form: {e}")
        return APIResponse(success=False, error=str(e))

@router.put("/forms/{form_id}", response_model=APIResponse)
async def update_form(form_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update lead capture form"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"📝 Updating form {form_id}")

        # Add updated timestamp
        updates['updated_at'] = datetime.now().isoformat()

        supabase = get_supabase()
        result = supabase.table('lead_capture_forms') \
            .update(updates) \
            .eq('id', form_id) \
            .eq('created_by', user_id) \
            .execute()

        if result.data:
            return APIResponse(success=True, data=result.data[0])
        else:
            return APIResponse(success=False, error="Form not found or update failed")

    except Exception as e:
        logger.error(f"❌ Error updating form: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/forms/{form_id}", response_model=APIResponse)
async def delete_form(form_id: str, token: str = Depends(verify_token)):
    """Delete lead capture form"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"🗑️ Deleting form {form_id}")

        supabase = get_supabase()
        result = supabase.table('lead_capture_forms') \
            .delete() \
            .eq('id', form_id) \
            .eq('created_by', user_id) \
            .execute()

        return APIResponse(success=True, data={"deleted": True})

    except Exception as e:
        logger.error(f"❌ Error deleting form: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/forms/{form_id}/embed-code", response_model=APIResponse)
async def get_embed_code(form_id: str, token: str = Depends(verify_token)):
    """
    Generate embeddable HTML/JS code for the form

    Returns HTML snippet that can be pasted into any website
    """
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        # Verify form ownership
        supabase = get_supabase()
        result = supabase.table('lead_capture_forms') \
            .select('id, name') \
            .eq('id', form_id) \
            .eq('created_by', user_id) \
            .single() \
            .execute()

        if not result.data:
            return APIResponse(success=False, error="Form not found")

        # Get backend URL from environment or use default
        import os
        backend_url = os.getenv('BACKEND_URL', 'https://wheels-wins-orchestrator.onrender.com')

        # Generate embed code
        embed_code = f'''<!-- AI Marketing Hub Lead Capture Form -->
<div id="lead-form-{form_id}"></div>
<script src="{backend_url}/static/form-widget.js"></script>
<script>
  LeadForm.render({{
    formId: '{form_id}',
    containerId: 'lead-form-{form_id}',
    apiUrl: '{backend_url}'
  }});
</script>'''

        # Also generate iframe option
        iframe_code = f'''<!-- AI Marketing Hub Lead Capture Form (iframe) -->
<iframe
  src="{backend_url}/form/{form_id}"
  width="100%"
  height="500"
  frameborder="0"
  style="border: none; max-width: 600px;"
></iframe>'''

        return APIResponse(
            success=True,
            data={
                "form_id": form_id,
                "embed_code": embed_code,
                "iframe_code": iframe_code,
                "direct_url": f"{backend_url}/form/{form_id}"
            }
        )

    except Exception as e:
        logger.error(f"❌ Error generating embed code: {e}")
        return APIResponse(success=False, error=str(e))

# ==================== Lead Management ====================

@router.get("/leads", response_model=APIResponse)
async def get_leads(
    campaign_id: Optional[str] = None,
    form_id: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    token: str = Depends(verify_token)
):
    """
    Get captured leads with optional filtering

    Query params:
    - campaign_id: Filter by campaign
    - form_id: Filter by form
    - status: Filter by lead status (new, contacted, qualified, etc.)
    - limit: Max results (default 50)
    """
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"📊 Getting leads for user: {user_id}")

        supabase = get_supabase()
        query = supabase.table('leads') \
            .select('*') \
            .eq('user_id', user_id) \
            .order('created_at', desc=True) \
            .limit(limit)

        # Apply filters
        if campaign_id:
            query = query.eq('campaign_id', campaign_id)
        if form_id:
            query = query.eq('form_id', form_id)
        if status:
            query = query.eq('status', status)

        result = query.execute()

        return APIResponse(success=True, data=result.data)

    except Exception as e:
        logger.error(f"❌ Error fetching leads: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/leads/{lead_id}", response_model=APIResponse)
async def get_lead(lead_id: str, token: str = Depends(verify_token)):
    """Get specific lead details"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        supabase = get_supabase()
        result = supabase.table('leads') \
            .select('*') \
            .eq('id', lead_id) \
            .eq('user_id', user_id) \
            .single() \
            .execute()

        if not result.data:
            return APIResponse(success=False, error="Lead not found")

        return APIResponse(success=True, data=result.data)

    except Exception as e:
        logger.error(f"❌ Error fetching lead: {e}")
        return APIResponse(success=False, error=str(e))

@router.put("/leads/{lead_id}", response_model=APIResponse)
async def update_lead(lead_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update lead information (status, score, tags, etc.)"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"📝 Updating lead {lead_id}")

        # Add updated timestamp
        updates['updated_at'] = datetime.now().isoformat()

        supabase = get_supabase()
        result = supabase.table('leads') \
            .update(updates) \
            .eq('id', lead_id) \
            .eq('user_id', user_id) \
            .execute()

        if result.data:
            return APIResponse(success=True, data=result.data[0])
        else:
            return APIResponse(success=False, error="Lead not found or update failed")

    except Exception as e:
        logger.error(f"❌ Error updating lead: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/stats", response_model=APIResponse)
async def get_lead_stats(
    campaign_id: Optional[str] = None,
    token: str = Depends(verify_token)
):
    """
    Get lead capture statistics

    Returns:
    - Total leads captured
    - Leads by campaign
    - Leads by form
    - Leads by status
    - Conversion rates
    """
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        supabase = get_supabase()

        # Get all leads for user (or filtered by campaign)
        query = supabase.table('leads').select('*').eq('user_id', user_id)
        if campaign_id:
            query = query.eq('campaign_id', campaign_id)

        leads_result = query.execute()
        leads = leads_result.data or []

        # Calculate statistics
        total_leads = len(leads)

        # Group by status
        status_counts = {}
        for lead in leads:
            status = lead.get('status', 'new')
            status_counts[status] = status_counts.get(status, 0) + 1

        # Group by campaign
        campaign_counts = {}
        for lead in leads:
            cid = lead.get('campaign_id', 'unknown')
            campaign_counts[cid] = campaign_counts.get(cid, 0) + 1

        # Group by form
        form_counts = {}
        for lead in leads:
            fid = lead.get('form_id', 'unknown')
            form_counts[fid] = form_counts.get(fid, 0) + 1

        # Calculate average score
        scores = [lead.get('score', 0) for lead in leads if lead.get('score')]
        avg_score = sum(scores) / len(scores) if scores else 0

        stats = {
            "total_leads": total_leads,
            "by_status": status_counts,
            "by_campaign": campaign_counts,
            "by_form": form_counts,
            "average_score": round(avg_score, 2),
            "qualified_leads": status_counts.get('qualified', 0),
            "conversion_rate": round((status_counts.get('qualified', 0) / total_leads * 100), 2) if total_leads > 0 else 0
        }

        return APIResponse(success=True, data=stats)

    except Exception as e:
        logger.error(f"❌ Error calculating stats: {e}")
        return APIResponse(success=False, error=str(e))