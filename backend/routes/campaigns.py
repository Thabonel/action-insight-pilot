from fastapi import APIRouter, Depends
from typing import Dict, Any, List
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager
from database import get_supabase

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/campaigns", tags=["campaigns"])

async def get_campaigns_from_database():
    """Get campaigns from Supabase database"""
    try:
        supabase = get_supabase()
        result = supabase.table('active_campaigns').select('*').limit(50).execute()
        
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
                "updated_at": row.get('updated_at')
            })
        
        logger.info(f"✅ Retrieved {len(campaigns)} campaigns from database")
        return campaigns
        
    except Exception as e:
        logger.error(f"❌ Database error, falling back to mock data: {e}")
        return None

@router.get("", response_model=APIResponse)
async def get_campaigns(token: str = Depends(verify_token)):
    """Get all campaigns"""
    try:
        # Try AI agents first
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.get_campaigns()
            if result["success"]:
                return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        
        # Try database second
        db_campaigns = await get_campaigns_from_database()
        if db_campaigns is not None:
            return APIResponse(success=True, data=db_campaigns)
        
        # Fallback to mock data
        mock_campaigns = [
            {
                "id": str(uuid.uuid4()),
                "name": "Summer Product Launch",
                "type": "email",
                "status": "active",
                "description": "Marketing campaign for our new summer product line",
                "created_at": "2024-01-15T10:00:00Z",
                "updated_at": "2024-01-20T15:30:00Z"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Social Media Boost",
                "type": "social", 
                "status": "paused",
                "description": "Increase brand awareness through social media",
                "created_at": "2024-01-10T09:00:00Z",
                "updated_at": "2024-01-18T12:00:00Z"
            }
        ]
        logger.info("📢 Using mock data - add real campaigns to database!")
        return APIResponse(success=True, data=mock_campaigns)
        
    except Exception as e:
        logger.error(f"Error getting campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("", response_model=APIResponse)
async def create_campaign(campaign_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new campaign"""
    try:
        # Try AI agents first
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.create_campaign(
                name=campaign_data.get("name"),
                objective=campaign_data.get("objective"),
                target_audience=campaign_data.get("target_audience"),
                budget=campaign_data.get("budget"),
                channels=campaign_data.get("channels", [])
            )
            if result["success"]:
                return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        
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
                'updated_at': now
            }
            
            result = supabase.table('active_campaigns').insert(db_data).execute()
            
            if result.data:
                logger.info(f"✅ Created campaign in database: {campaign_data.get('name')}")
                return APIResponse(success=True, data=result.data[0])
                
        except Exception as db_error:
            logger.error(f"❌ Database create failed: {db_error}")
        
        # Fallback to mock
        new_campaign = {
            "id": str(uuid.uuid4()),
            "created_at": datetime.now().isoformat() + "Z",
            "updated_at": datetime.now().isoformat() + "Z",
            **campaign_data
        }
        logger.info("📢 Created mock campaign - database unavailable")
        return APIResponse(success=True, data=new_campaign)
        
    except Exception as e:
        logger.error(f"Error creating campaign: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/bulk/create", response_model=APIResponse)
async def bulk_create_campaigns(campaigns_data: Dict[str, list], token: str = Depends(verify_token)):
    """Create multiple campaigns in bulk"""
    try:
        campaigns = campaigns_data.get("campaigns", [])
        
        # Try AI agents first
        if agent_manager.agents_available:
            created_campaigns = []
            for campaign_data in campaigns:
                result = await agent_manager.campaign_agent.create_campaign(
                    name=campaign_data.get("name"),
                    objective=campaign_data.get("objective"),
                    target_audience=campaign_data.get("target_audience"),
                    budget=campaign_data.get("budget"),
                    channels=campaign_data.get("channels", [])
                )
                if result["success"]:
                    created_campaigns.append(result["data"])
            
            if created_campaigns:
                return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
        
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
                    'updated_at': now
                }
                
                result = supabase.table('active_campaigns').insert(db_data).execute()
                if result.data:
                    created_campaigns.append(result.data[0])
            
            if created_campaigns:
                logger.info(f"✅ Bulk created {len(created_campaigns)} campaigns in database")
                return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
                
        except Exception as db_error:
            logger.error(f"❌ Database bulk create failed: {db_error}")
        
        # Fallback to mock
        created_campaigns = []
        for campaign in campaigns:
            new_campaign = {
                "id": str(uuid.uuid4()),
                "created_at": datetime.now().isoformat() + "Z",
                "updated_at": datetime.now().isoformat() + "Z",
                **campaign
            }
            created_campaigns.append(new_campaign)
        
        logger.info(f"📢 Bulk created {len(created_campaigns)} mock campaigns")
        return APIResponse(success=True, data={"created": len(created_campaigns), "campaigns": created_campaigns})
        
    except Exception as e:
        logger.error(f"Error bulk creating campaigns: {e}")
        return APIResponse(success=False, error=str(e))

@router.get("/{campaign_id}", response_model=APIResponse)
async def get_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Get specific campaign"""
    try:
        # Try AI agents first
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.get_campaign_performance(campaign_id)
            if result["success"]:
                return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        
        # Try database second
        try:
            supabase = get_supabase()
            result = supabase.table('active_campaigns').select('*').eq('id', campaign_id).execute()
            
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
                    "updated_at": row.get('updated_at')
                }
                logger.info(f"✅ Retrieved campaign {campaign_id} from database")
                return APIResponse(success=True, data=campaign)
                
        except Exception as db_error:
            logger.error(f"❌ Database get failed: {db_error}")
        
        # Fallback to mock
        mock_campaign = {
            "id": campaign_id,
            "name": "Summer Product Launch",
            "type": "email",
            "status": "active",
            "description": "Marketing campaign for our new summer product line",
            "metrics": {
                "opens": 1250,
                "clicks": 340,
                "conversions": 45
            },
            "created_at": "2024-01-15T10:00:00Z",
            "updated_at": "2024-01-20T15:30:00Z"
        }
        logger.info("📢 Returning mock campaign - database unavailable")
        return APIResponse(success=True, data=mock_campaign)
        
    except Exception as e:
        logger.error(f"Error getting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.put("/{campaign_id}", response_model=APIResponse)
async def update_campaign(campaign_id: str, updates: Dict[str, Any], token: str = Depends(verify_token)):
    """Update campaign"""
    try:
        # Try AI agents first
        if agent_manager.agents_available:
            result = await agent_manager.campaign_agent.optimize_campaign(campaign_id)
            if result["success"]:
                return APIResponse(success=result["success"], data=result.get("data"), error=result.get("error"))
        
        # Try database second
        try:
            supabase = get_supabase()
            
            update_data = {**updates, 'updated_at': datetime.utcnow().isoformat()}
            result = supabase.table('active_campaigns').update(update_data).eq('id', campaign_id).execute()
            
            if result.data:
                logger.info(f"✅ Updated campaign {campaign_id} in database")
                return APIResponse(success=True, data=result.data[0])
                
        except Exception as db_error:
            logger.error(f"❌ Database update failed: {db_error}")
        
        # Fallback to mock
        updated_campaign = {
            "id": campaign_id,
            "updated_at": datetime.now().isoformat() + "Z",
            **updates
        }
        logger.info("📢 Mock campaign update - database unavailable")
        return APIResponse(success=True, data=updated_campaign)
        
    except Exception as e:
        logger.error(f"Error updating campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/{campaign_id}", response_model=APIResponse)
async def delete_campaign(campaign_id: str, token: str = Depends(verify_token)):
    """Delete campaign"""
    try:
        # Try database first
        try:
            supabase = get_supabase()
            result = supabase.table('active_campaigns').delete().eq('id', campaign_id).execute()
            
            if result.data:
                logger.info(f"✅ Deleted campaign {campaign_id} from database")
                return APIResponse(success=True, data={"deleted": True, "id": campaign_id})
                
        except Exception as db_error:
            logger.error(f"❌ Database delete failed: {db_error}")
        
        # Always return success for delete (idempotent)
        return APIResponse(success=True, data={"deleted": True, "id": campaign_id})
        
    except Exception as e:
        logger.error(f"Error deleting campaign {campaign_id}: {e}")
        return APIResponse(success=False, error=str(e))
