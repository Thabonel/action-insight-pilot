
import asyncio
import aiohttp
from typing import Dict, Any, List, Optional
import json
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class WebhookService:
    """Service for managing webhooks and external service notifications"""
    
    def __init__(self, database_service=None):
        self.database_service = database_service
        self.logger = logger
        self.retry_attempts = 3
        self.retry_delay = 5  # seconds
    
    async def register_webhook(self, webhook_data: Dict[str, Any]) -> str:
        """Register a new webhook endpoint"""
        try:
            webhook = {
                "id": webhook_data.get("id", f"webhook_{datetime.utcnow().timestamp()}"),
                "url": webhook_data["url"],
                "events": webhook_data.get("events", ["sent", "opened", "clicked"]),
                "secret": webhook_data.get("secret", ""),
                "active": webhook_data.get("active", True),
                "headers": webhook_data.get("headers", {}),
                "created_at": datetime.utcnow().isoformat(),
                "last_triggered": None,
                "total_calls": 0,
                "failed_calls": 0
            }
            
            if self.database_service:
                await self.database_service.save("webhooks", webhook)
            
            self.logger.info(f"Registered webhook {webhook['id']} for URL {webhook['url']}")
            return webhook["id"]
            
        except Exception as e:
            self.logger.error(f"Failed to register webhook: {str(e)}")
            raise Exception(f"Webhook registration failed: {str(e)}")
    
    async def send_webhook(self, event_type: str, payload: Dict[str, Any]) -> bool:
        """Send webhook notifications for an event"""
        try:
            # Get active webhooks for this event type
            webhooks = await self.get_active_webhooks(event_type)
            
            if not webhooks:
                return True
            
            # Send to all relevant webhooks
            tasks = []
            for webhook in webhooks:
                task = self.send_single_webhook(webhook, event_type, payload)
                tasks.append(task)
            
            # Execute all webhook calls concurrently
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Log results
            successful = sum(1 for result in results if result is True)
            total = len(results)
            
            self.logger.info(f"Sent webhooks: {successful}/{total} successful")
            return successful > 0
            
        except Exception as e:
            self.logger.error(f"Failed to send webhooks: {str(e)}")
            return False
    
    async def send_single_webhook(self, webhook: Dict[str, Any], event_type: str, payload: Dict[str, Any]) -> bool:
        """Send webhook to a single endpoint with retries"""
        for attempt in range(self.retry_attempts):
            try:
                webhook_payload = {
                    "event": event_type,
                    "timestamp": datetime.utcnow().isoformat(),
                    "data": payload,
                    "webhook_id": webhook["id"]
                }
                
                headers = {
                    "Content-Type": "application/json",
                    "User-Agent": "EmailAutomation-Webhook/1.0",
                    **webhook.get("headers", {})
                }
                
                # Add signature if secret is provided
                if webhook.get("secret"):
                    signature = self.generate_signature(webhook_payload, webhook["secret"])
                    headers["X-Webhook-Signature"] = signature
                
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        webhook["url"],
                        json=webhook_payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=30)
                    ) as response:
                        if 200 <= response.status < 300:
                            await self.update_webhook_stats(webhook["id"], success=True)
                            self.logger.info(f"Webhook {webhook['id']} sent successfully")
                            return True
                        else:
                            self.logger.warning(f"Webhook {webhook['id']} failed with status {response.status}")
                            
            except Exception as e:
                self.logger.warning(f"Webhook {webhook['id']} attempt {attempt + 1} failed: {str(e)}")
                
                if attempt < self.retry_attempts - 1:
                    await asyncio.sleep(self.retry_delay * (attempt + 1))
        
        # All attempts failed
        await self.update_webhook_stats(webhook["id"], success=False)
        return False
    
    async def get_active_webhooks(self, event_type: str) -> List[Dict[str, Any]]:
        """Get all active webhooks that listen for the given event type"""
        try:
            if self.database_service:
                webhooks = await self.database_service.query(
                    "webhooks",
                    {"active": True, "events": {"$in": [event_type]}}
                )
                return webhooks
            
            # Mock webhooks for development
            return [
                {
                    "id": "webhook_1",
                    "url": "https://api.example.com/webhooks/email",
                    "events": ["sent", "opened", "clicked"],
                    "secret": "webhook_secret_123",
                    "active": True,
                    "headers": {"Authorization": "Bearer token123"}
                }
            ]
            
        except Exception as e:
            self.logger.error(f"Failed to get active webhooks: {str(e)}")
            return []
    
    def generate_signature(self, payload: Dict[str, Any], secret: str) -> str:
        """Generate webhook signature for security"""
        import hmac
        import hashlib
        
        payload_str = json.dumps(payload, sort_keys=True)
        signature = hmac.new(
            secret.encode('utf-8'),
            payload_str.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()
        
        return f"sha256={signature}"
    
    async def update_webhook_stats(self, webhook_id: str, success: bool) -> bool:
        """Update webhook statistics"""
        try:
            if self.database_service:
                update_data = {
                    "last_triggered": datetime.utcnow().isoformat(),
                    "total_calls": {"$inc": 1}
                }
                
                if not success:
                    update_data["failed_calls"] = {"$inc": 1}
                
                await self.database_service.update("webhooks", webhook_id, update_data)
            
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to update webhook stats: {str(e)}")
            return False
