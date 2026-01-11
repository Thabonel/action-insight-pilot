from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import uuid
from datetime import datetime
import logging

from backend.models import APIResponse
from backend.auth import verify_token, get_current_user
from backend.config import agent_manager
from backend.database import get_supabase
from backend.services.campaign_executor import CampaignExecutor

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

async def get_campaigns_from_database(user_id: str):
    """Get campaigns from Supabase database filtered by user"""
    try:
        supabase = get_supabase()
        # CRITICAL FIX: Filter by user_id
        result = supabase.table('active_campaigns').select('*').eq('created_by', user_id).limit(50).execute()
        
        campaigns = []
        for row in result.data:
            campaigns.append({
                "id": row['id'],
                "name": row['name'],
                "type": row['type'],
                "status": row['status'],
                "description": row.get('description', ''),
                "budget_allocated": row.get('budget_allocated', 0),
                "target_audience": row.get('target_audience', {}),
                "content": row.get('content', {}),
                "metrics": row.get('metrics', {}),
                "created_at": row.get('created_at'),
                "updated_at": row.get('updated_at'),
                "created_by": row.get('created_by')
            })
        
        logger.info(f"✅ Retrieved {len(campaigns)} campaigns from ..database for user {user_id}")
        return campaigns
        
    except Exception as e:
        logger.error(f"❌ Database error: {e}")
        return None

@router.get("", response_model=APIResponse)
async def get_campaigns(token: str = Depends(verify_token)):
    """Get all campaigns for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]
        
        logger.info(f"🔍 Getting campaigns for user: {user_id}")
        
        # Try AI agents first (with proper error handling)
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'get_campaigns'):
                    result = await agent_manager.campaign_agent.get_campaigns()
                    if result.get("success"):
                        logger.info("✅ Retrieved campaigns from AI agent")
                        return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
                else:
                    logger.info("⚠️ AI agent available but missing get_campaigns method")
            except Exception as agent_error:
                logger.error(f"❌ AI agent failed: {agent_error}")
        
        # Try database second
        db_campaigns = await get_campaigns_from_database(user_id)
        if db_campaigns is not None:
            logger.info(f"✅ Using database campaigns for user {user_id}")
            return APIResponse(success=True, data=db_campaigns)
        
        # Fallback to empty array (no mock data for security)
        logger.info(f"📢 No campaigns found for user {user_id}")
        return APIResponse(success=True, data=[])
        
    except Exception as e:
        logger.error(f"❌ Error getting campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("", response_model=APIResponse)
async def create_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new campaign for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]
        
        logger.info(f"🆕 Creating campaign for user: {user_id}")
        
        # Try AI agents first (with proper error handling)
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'create_campaign'):
                    result = await agent_manager.campaign_agent.create_campaign(
                        name=campaign_data.get("name"),
                        objective=campaign_data.get("objective"),
                        target_audience=campaign_data.get("target_audience"),
                        budget=campaign_data.get("budget"),
                        channels=campaign_data.get("channels", [])
                    )
                    if result.get("success"):
                        logger.info("✅ Created campaign via AI agent")
                        return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
            except Exception as agent_error:
                logger.error(f"❌ AI agent create failed: {agent_error}")
        
        # Try database second
        try:
            supabase = get_supabase()
            campaign_id = str(uuid.uuid4())
            now = datetime.utcnow().isoformat()
            
            db_data = {
                'id': campaign_id,
                'name': campaign_data.get("name", "New Campaign"),
                'description': campaign_data.get("description", ""),
                'type': campaign_data.get("type", "email"),
                'status': campaign_data.get("status", "draft"),
                'budget_allocated': campaign_data.get("budget", 0),
                'target_audience': campaign_data.get("target_audience", {}),
                'content': campaign_data.get("content", {}),
                'created_at': now,
                'updated_at': now,
                'created_by': user_id  # CRITICAL FIX: Add user_id
            }
            
            result = supabase.table('active_campaigns').insert(db_data).execute()
            
            if result.data:
                logger.info(f"✅ Created campaign in database: {campaign_data.get('name')} for user {user_id}")
                return APIResponse(success=True, data=result.data[0])
                
        except Exception as db_error:
            logger.error(f"❌ Database create failed: {db_error}")
            return APIResponse(success=False, error=f"Database error: {str(db_error)}")
        
        # No fallback for create - must succeed or fail
        return APIResponse(success=False, error="Campaign creation failed")
        
    except Exception as e:
        logger.error(f"❌ Error creating campaign: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/bulk/create", response_model=APIResponse)
async def bulk_create_campaigns(campaigns_data: Dict[str, list], token: str = Depends(verify_token)):
    """Create multiple campaigns in bulk for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]
        
        campaigns = campaigns_data.get("campaigns", [])
        logger.info(f"🆕 Bulk creating {len(campaigns)} campaigns for user: {user_id}")
        
        # Try AI agents first (with proper error handling)
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'create_campaign'):
                    created_campaigns = []
                    for campaign_data in campaigns:
                        result = await agent_manager.campaign_agent.create_campaign(
                            name=campaign_data.get("name"),
                            objective=campaign_data.get("objective"),
                            target_audience=campaign_data.get("target_audience"),
                            budget=campaign_data.get("budget"),
                            channels=campaign_data.get("channels", [])
                        )
                        if result.get("success"):
                            created_campaigns.append(result["data"])
                    
                    if created_campaigns:
                        logger.info(f"✅ Bulk created {len(created_campaigns)} campaigns via AI agent")
                        return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
            except Exception as agent_error:
                logger.error(f"❌ AI agent bulk create failed: {agent_error}")
        
        # Try database second
        try:
            supabase = get_supabase()
            created_campaigns = []
            
            for campaign in campaigns:
                campaign_id = str(uuid.uuid4())
                now = datetime.utcnow().isoformat()
                
                db_data = {
                    'id': campaign_id,
                    'name': campaign.get("name", "New Campaign"),
                    'description': campaign.get("description", ""),
                    'type': campaign.get("type", "email"),
                    'status': campaign.get("status", "draft"),
                    'budget_allocated': campaign.get("budget", 0),
                    'target_audience': campaign.get("target_audience", {}),
                    'content': campaign.get("content", {}),
                    'created_at': now,
                    'updated_at': now,
                    'created_by': user_id  # CRITICAL FIX: Add user_id
                }
                
                result = supabase.table('active_campaigns').insert(db_data).execute()
                if result.data:
                    created_campaigns.append(result.data[0])
            
            if created_campaigns:
                logger.info(f"✅ Bulk created {len(created_campaigns)} campaigns in database for user {user_id}")
                return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
                
        except Exception as db_error:
            logger.error(f"❌ Database bulk create failed: {db_error}")
            return APIResponse(success=False, error=f"Database error: {str(db_error)}")
        
        # No fallback for create - must succeed or fail
        return APIResponse(success=False, error="Bulk campaign creation failed")
        
    except Exception as e:
        logger.error(f"❌ Error bulk creating campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/{campaign_id}", response_model=APIResponse)
async def get_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Get specific campaign for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]
        
        logger.info(f"🔍 Getting campaign {campaign_id} for user: {user_id}")
        
        # Try AI agents first (with proper error handling)
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'get_campaign_performance'):
                    result = await agent_manager.campaign_agent.get_campaign_performance(campaign_id)
                    if result.get("success"):
                        logger.info(f"✅ Retrieved campaign {campaign_id} from AI agent")
                        return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
            except Exception as agent_error:
                logger.error(f"❌ AI agent get campaign failed: {agent_error}")
        
        # Try database second
        try:
            supabase = get_supabase()
            # CRITICAL FIX: Filter by both campaign_id AND user_id
            result = supabase.table('active_campaigns').select('*').eq('id', campaign_id).eq('created_by', user_id).execute()
            
            if result.data:
                row = result.data[0]
                campaign = {
                    "id": row['id'],
                    "name": row['name'],
                    "type": row['type'],
                    "status": row['status'],
                    "description": row.get('description', ''),
                    "budget_allocated": row.get('budget_allocated', 0),
                    "target_audience": row.get('target_audience', {}),
                    "content": row.get('content', {}),
                    "metrics": row.get('metrics', {}),
                    "created_at": row.get('created_at'),
                    "updated_at": row.get('updated_at'),
                    "created_by": row.get('created_by')
                }
                logger.info(f"✅ Retrieved campaign {campaign_id} from ..database for user {user_id}")
                return APIResponse(success=True, data=campaign)
            else:
                logger.info(f"❌ Campaign {campaign_id} not found for user {user_id}")
                return APIResponse(success=False, error="Campaign not found")
                
        except Exception as db_error:
            logger.error(f"❌ Database get failed: {db_error}")
            return APIResponse(success=False, error=f"Database error: {str(db_error)}")
        
        # No fallback for get - must find actual campaign
        return APIResponse(success=False, error="Campaign not found")
        
    except Exception as e:
        logger.error(f"❌ Error getting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.put("/{campaign_id}", response_model=APIResponse)
async def update_campaign(campaign_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update campaign for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]
        
        logger.info(f"📝 Updating campaign {campaign_id} for user: {user_id}")
        
        # Try AI agents first (with proper error handling)
        if agent_manager.agents_available:
            try:
                if hasattr(agent_manager.campaign_agent, 'optimize_campaign'):
                    result = await agent_manager.campaign_agent.optimize_campaign(campaign_id)
                    if result.get("success"):
                        logger.info(f"✅ Updated campaign {campaign_id} via AI agent")
                        return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
            except Exception as agent_error:
                logger.error(f"❌ AI agent update failed: {agent_error}")
        
        # Try database second
        try:
            supabase = get_supabase()
            
            update_data = {**updates, 'updated_at': datetime.utcnow().isoformat()}
            # CRITICAL FIX: Filter by both campaign_id AND user_id
            result = supabase.table('active_campaigns').update(update_data).eq('id', campaign_id).eq('created_by', user_id).execute()
            
            if result.data:
                logger.info(f"✅ Updated campaign {campaign_id} in database for user {user_id}")
                return APIResponse(success=True, data=result.data[0])
            else:
                logger.info(f"❌ Campaign {campaign_id} not found for user {user_id}")
                return APIResponse(success=False, error="Campaign not found or not authorized")
                
        except Exception as db_error:
            logger.error(f"❌ Database update failed: {db_error}")
            return APIResponse(success=False, error=f"Database error: {str(db_error)}")
        
        # No fallback for update - must succeed or fail
        return APIResponse(success=False, error="Campaign update failed")
        
    except Exception as e:
        logger.error(f"❌ Error updating campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/{campaign_id}", response_model=APIResponse)
async def delete_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Delete campaign for the authenticated user"""
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"🗑️ Deleting campaign {campaign_id} for user: {user_id}")

        # Try database first
        try:
            supabase = get_supabase()
            # CRITICAL FIX: Filter by both campaign_id AND user_id
            result = supabase.table('active_campaigns').delete().eq('id', campaign_id).eq('created_by', user_id).execute()

            if result.data:
                logger.info(f"✅ Deleted campaign {campaign_id} from ..database for user {user_id}")
                return APIResponse(success=True, data={"deleted": True, "id": campaign_id})
            else:
                logger.info(f"❌ Campaign {campaign_id} not found for user {user_id}")
                return APIResponse(success=False, error="Campaign not found or not authorized")

        except Exception as db_error:
            logger.error(f"❌ Database delete failed: {db_error}")
            return APIResponse(success=False, error=f"Database error: {str(db_error)}")

        # No fallback for delete - must succeed or fail
        return APIResponse(success=False, error="Campaign deletion failed")

    except Exception as e:
        logger.error(f"❌ Error deleting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{campaign_id}/launch", response_model=APIResponse)
async def launch_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """
    Launch a campaign - executes across all configured channels

    This endpoint orchestrates campaign execution by:
    - Validating the campaign is ready to launch
    - Coordinating email, social, and content agents
    - Scheduling campaign activities
    - Tracking execution status
    """
    try:
        # Extract user from token
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"🚀 Launching campaign {campaign_id} for user: {user_id}")

        # Get task scheduler
        from services.task_scheduler import get_task_scheduler
        task_scheduler = get_task_scheduler()

        # Initialize campaign executor with available agents and scheduler
        executor = CampaignExecutor(
            supabase_client=get_supabase(),
            email_agent=getattr(agent_manager, 'email_agent', None) if agent_manager.agents_available else None,
            social_agent=getattr(agent_manager, 'social_agent', None) if agent_manager.agents_available else None,
            content_agent=getattr(agent_manager, 'content_agent', None) if agent_manager.agents_available else None,
            task_scheduler=task_scheduler
        )

        # Execute campaign launch
        result = await executor.launch_campaign(campaign_id, user_id)

        if result.success:
            logger.info(f"✅ Campaign {campaign_id} launched successfully: {result.message}")
            return APIResponse(
                success=True,
                data=result.data,
                error=None
            )
        else:
            logger.error(f"❌ Campaign {campaign_id} launch failed: {result.message}")
            return APIResponse(
                success=False,
                data=None,
                error=result.message
            )

    except Exception as e:
        logger.error(f"❌ Error launching campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=f"Launch error: {str(e)}")

@router.post("/{campaign_id}/pause", response_model=APIResponse)
async def pause_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Pause an active campaign and its scheduled jobs"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"⏸️ Pausing campaign {campaign_id} for user: {user_id}")

        # Pause scheduled jobs if scheduler is available
        from services.task_scheduler import get_task_scheduler
        task_scheduler = get_task_scheduler()
        jobs_paused = 0

        if task_scheduler:
            jobs_paused = task_scheduler.pause_campaign_jobs(campaign_id)
            logger.info(f"⏸️ Paused {jobs_paused} scheduled jobs")

        executor = CampaignExecutor(supabase_client=get_supabase())
        result = await executor.pause_campaign(campaign_id, user_id)

        return APIResponse(
            success=result.success,
            data={
                **(result.data or {}),
                "jobs_paused": jobs_paused
            } if result.success else None,
            error=result.message if not result.success else None
        )

    except Exception as e:
        logger.error(f"❌ Error pausing campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{campaign_id}/resume", response_model=APIResponse)
async def resume_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Resume a paused campaign and its scheduled jobs"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"▶️ Resuming campaign {campaign_id} for user: {user_id}")

        # Resume scheduled jobs if scheduler is available
        from services.task_scheduler import get_task_scheduler
        task_scheduler = get_task_scheduler()
        jobs_resumed = 0

        if task_scheduler:
            jobs_resumed = task_scheduler.resume_campaign_jobs(campaign_id)
            logger.info(f"▶️ Resumed {jobs_resumed} scheduled jobs")

        executor = CampaignExecutor(supabase_client=get_supabase())
        result = await executor.resume_campaign(campaign_id, user_id)

        return APIResponse(
            success=result.success,
            data={
                **(result.data or {}),
                "jobs_resumed": jobs_resumed
            } if result.success else None,
            error=result.message if not result.success else None
        )

    except Exception as e:
        logger.error(f"❌ Error resuming campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{campaign_id}/stop", response_model=APIResponse)
async def stop_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Stop and complete a campaign, canceling all scheduled jobs"""
    try:
        user_data = get_current_user(token)
        user_id = user_data["id"]

        logger.info(f"⏹️ Stopping campaign {campaign_id} for user: {user_id}")

        # Cancel all scheduled jobs for this campaign
        from services.task_scheduler import get_task_scheduler
        task_scheduler = get_task_scheduler()
        jobs_cancelled = 0

        if task_scheduler:
            # Get all jobs for this campaign
            scheduled_jobs = task_scheduler.get_scheduled_jobs(campaign_id)

            for job in scheduled_jobs:
                if task_scheduler.cancel_job(job['id']):
                    jobs_cancelled += 1

            logger.info(f"🗑️ Cancelled {jobs_cancelled} scheduled jobs")

        executor = CampaignExecutor(supabase_client=get_supabase())
        result = await executor.stop_campaign(campaign_id, user_id)

        return APIResponse(
            success=result.success,
            data={
                **(result.data or {}),
                "jobs_cancelled": jobs_cancelled
            } if result.success else None,
            error=result.message if not result.success else None
        )

    except Exception as e:
        logger.error(f"❌ Error stopping campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))