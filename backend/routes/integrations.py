
from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
import logging

from models import APIResponse
from auth import verify_token
from config import agent_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# Webhook Management Endpoints
@router.get("/webhooks", response_model=APIResponse)
async def get_webhooks(token: str = Depends(verify_token)):
    """Get all webhooks for the authenticated user"""
    try:
        # Mock webhook data for now - will be replaced with Supabase queries
        mock_webhooks = [
            {
                "id": str(uuid.uuid4()),
                "name": "Campaign Completed",
                "url": "https://api.company.com/webhooks/campaign-complete",
                "events": ["campaign.completed", "campaign.paused"],
                "is_active": True,
                "last_triggered_at": datetime.now().isoformat(),
                "last_response_code": 200,
                "created_at": datetime.now().isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Lead Generated",
                "url": "https://api.company.com/webhooks/new-lead",
                "events": ["lead.created", "lead.qualified"],
                "is_active": True,
                "last_triggered_at": datetime.now().isoformat(),
                "last_response_code": 200,
                "created_at": datetime.now().isoformat()
            }
        ]
        return APIResponse(success=True, data=mock_webhooks)
    except Exception as e:
        logger.error(f"Error fetching webhooks: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/webhooks", response_model=APIResponse)
async def create_webhook(webhook_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Create a new webhook"""
    try:
        new_webhook = {
            "id": str(uuid.uuid4()),
            "name": webhook_data.get("name"),
            "url": webhook_data.get("url"),
            "events": webhook_data.get("events", []),
            "is_active": webhook_data.get("is_active", True),
            "secret_token": webhook_data.get("secret_token"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        return APIResponse(success=True, data=new_webhook)
    except Exception as e:
        logger.error(f"Error creating webhook: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/webhooks/{webhook_id}", response_model=APIResponse)
async def delete_webhook(webhook_id: str, token: str = Depends(verify_token)):
    """Delete a webhook"""
    try:
        return APIResponse(success=True, data={"id": webhook_id, "deleted": True})
    except Exception as e:
        logger.error(f"Error deleting webhook: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/webhooks/{webhook_id}/test", response_model=APIResponse)
async def test_webhook(webhook_id: str, token: str = Depends(verify_token)):
    """Test webhook delivery"""
    try:
        test_result = {
            "webhook_id": webhook_id,
            "status": "success",
            "response_code": 200,
            "response_time_ms": 150,
            "tested_at": datetime.now().isoformat()
        }
        return APIResponse(success=True, data=test_result)
    except Exception as e:
        logger.error(f"Error testing webhook: {e}")
        return APIResponse(success=False, error=str(e))

# Social Media Platform Connectors
@router.post("/buffer/connect", response_model=APIResponse)
async def connect_buffer(connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to Buffer"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        # Mock connection validation
        connection_result = {
            "service": "buffer",
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "account_info": {
                "username": "example_user",
                "plan": "pro"
            }
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to Buffer: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/hootsuite/connect", response_model=APIResponse)
async def connect_hootsuite(connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to Hootsuite"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        connection_result = {
            "service": "hootsuite",
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "account_info": {
                "organization": "Example Corp",
                "plan": "enterprise"
            }
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to Hootsuite: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/later/connect", response_model=APIResponse)
async def connect_later(connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to Later"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        connection_result = {
            "service": "later",
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "account_info": {
                "username": "example_later",
                "plan": "premium"
            }
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to Later: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/sprout-social/connect", response_model=APIResponse)
async def connect_sprout_social(connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to Sprout Social"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        connection_result = {
            "service": "sprout_social",
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "account_info": {
                "organization": "Example Enterprise",
                "plan": "enterprise"
            }
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to Sprout Social: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/video-publisher/connect", response_model=APIResponse)
async def connect_video_publisher(connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to AI Video Publisher"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        connection_result = {
            "service": "video_publisher",
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "account_info": {
                "credits_remaining": 500,
                "plan": "professional"
            }
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to Video Publisher: {e}")
        return APIResponse(success=False, error=str(e))

# Third-Party Integration Endpoints
@router.get("/connections", response_model=APIResponse)
async def get_connections(token: str = Depends(verify_token)):
    """Get all integration connections"""
    try:
        mock_connections = [
            {
                "service_name": "google_analytics",
                "connection_status": "connected",
                "last_sync_at": datetime.now().isoformat(),
                "sync_status": "success"
            },
            {
                "service_name": "mailchimp",
                "connection_status": "connected",
                "last_sync_at": datetime.now().isoformat(),
                "sync_status": "success"
            },
            {
                "service_name": "slack",
                "connection_status": "disconnected",
                "last_sync_at": None,
                "sync_status": "idle"
            },
            {
                "service_name": "shopify",
                "connection_status": "connected",
                "last_sync_at": datetime.now().isoformat(),
                "sync_status": "success"
            },
            {
                "service_name": "stripe",
                "connection_status": "connected",
                "last_sync_at": datetime.now().isoformat(),
                "sync_status": "success"
            },
            {
                "service_name": "hubspot",
                "connection_status": "disconnected",
                "last_sync_at": None,
                "sync_status": "idle"
            }
        ]
        return APIResponse(success=True, data=mock_connections)
    except Exception as e:
        logger.error(f"Error fetching connections: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{service}/connect", response_model=APIResponse)
async def connect_service(service: str, connection_data: Dict[str, Any], token: str = Depends(verify_token)):
    """Connect to a third-party service"""
    try:
        api_key = connection_data.get("api_key")
        if not api_key:
            return APIResponse(success=False, error="API key is required")
        
        connection_result = {
            "service": service,
            "status": "connected",
            "connected_at": datetime.now().isoformat(),
            "message": f"Successfully connected to {service}"
        }
        return APIResponse(success=True, data=connection_result)
    except Exception as e:
        logger.error(f"Error connecting to {service}: {e}")
        return APIResponse(success=False, error=str(e))

@router.post("/{service}/sync", response_model=APIResponse)
async def sync_service(service: str, token: str = Depends(verify_token)):
    """Trigger data sync for a service"""
    try:
        sync_result = {
            "service": service,
            "sync_status": "success",
            "synced_at": datetime.now().isoformat(),
            "records_synced": 125
        }
        return APIResponse(success=True, data=sync_result)
    except Exception as e:
        logger.error(f"Error syncing {service}: {e}")
        return APIResponse(success=False, error=str(e))

@router.delete("/{service}/disconnect", response_model=APIResponse)
async def disconnect_service(service: str, token: str = Depends(verify_token)):
    """Disconnect from a service"""
    try:
        disconnect_result = {
            "service": service,
            "status": "disconnected",
            "disconnected_at": datetime.now().isoformat()
        }
        return APIResponse(success=True, data=disconnect_result)
    except Exception as e:
        logger.error(f"Error disconnecting from {service}: {e}")
        return APIResponse(success=False, error=str(e))
