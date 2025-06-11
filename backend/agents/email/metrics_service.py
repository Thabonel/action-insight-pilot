
import uuid
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
import asyncio
import logging

logger = logging.getLogger(__name__)

class RealTimeMetricsService:
    """Service for real-time email campaign metrics and analytics"""
    
    def __init__(self, database_service=None):
        self.database_service = database_service
        self.logger = logger
        self.metrics_cache = {}
    
    async def track_email_event(self, email_id: str, event_type: str, metadata: Dict[str, Any] = None) -> bool:
        """Track individual email events (sent, opened, clicked, etc.)"""
        try:
            event_data = {
                "id": str(uuid.uuid4()),
                "email_id": email_id,
                "event_type": event_type,  # sent, delivered, opened, clicked, bounced, unsubscribed
                "timestamp": datetime.utcnow().isoformat(),
                "metadata": metadata or {},
                "user_agent": metadata.get("user_agent", "") if metadata else "",
                "ip_address": metadata.get("ip_address", "") if metadata else "",
                "location": metadata.get("location", "") if metadata else ""
            }
            
            if self.database_service:
                await self.database_service.save("email_events", event_data)
            
            # Update real-time metrics
            await self.update_campaign_metrics(email_id, event_type)
            
            self.logger.info(f"Tracked {event_type} event for email {email_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to track email event: {str(e)}")
            return False
    
    async def get_real_time_metrics(self, campaign_id: str, time_range: str = "24h") -> Dict[str, Any]:
        """Get real-time metrics for a campaign"""
        try:
            # Calculate time range
            if time_range == "1h":
                start_time = datetime.utcnow() - timedelta(hours=1)
            elif time_range == "24h":
                start_time = datetime.utcnow() - timedelta(hours=24)
            elif time_range == "7d":
                start_time = datetime.utcnow() - timedelta(days=7)
            else:
                start_time = datetime.utcnow() - timedelta(hours=24)
            
            if self.database_service:
                events = await self.database_service.query(
                    "email_events",
                    {
                        "campaign_id": campaign_id,
                        "timestamp": {"$gte": start_time.isoformat()}
                    }
                )
            else:
                # Mock real-time data
                events = self.generate_mock_events(campaign_id)
            
            # Calculate metrics
            metrics = self.calculate_metrics(events)
            
            # Add engagement trends
            metrics["trends"] = await self.calculate_engagement_trends(campaign_id, time_range)
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"Failed to get real-time metrics: {str(e)}")
            return self.get_default_metrics()
    
    def calculate_metrics(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate metrics from events"""
        event_counts = {}
        for event in events:
            event_type = event["event_type"]
            event_counts[event_type] = event_counts.get(event_type, 0) + 1
        
        sent = event_counts.get("sent", 0)
        delivered = event_counts.get("delivered", 0)
        opened = event_counts.get("opened", 0)
        clicked = event_counts.get("clicked", 0)
        bounced = event_counts.get("bounced", 0)
        unsubscribed = event_counts.get("unsubscribed", 0)
        
        return {
            "total_sent": sent,
            "total_delivered": delivered,
            "total_opened": opened,
            "total_clicked": clicked,
            "total_bounced": bounced,
            "total_unsubscribed": unsubscribed,
            "delivery_rate": (delivered / sent * 100) if sent > 0 else 0,
            "open_rate": (opened / delivered * 100) if delivered > 0 else 0,
            "click_rate": (clicked / delivered * 100) if delivered > 0 else 0,
            "bounce_rate": (bounced / sent * 100) if sent > 0 else 0,
            "unsubscribe_rate": (unsubscribed / delivered * 100) if delivered > 0 else 0,
            "engagement_score": self.calculate_engagement_score(opened, clicked, delivered),
            "last_updated": datetime.utcnow().isoformat()
        }
    
    def calculate_engagement_score(self, opened: int, clicked: int, delivered: int) -> float:
        """Calculate overall engagement score"""
        if delivered == 0:
            return 0.0
        
        open_weight = 0.3
        click_weight = 0.7
        
        open_rate = opened / delivered
        click_rate = clicked / delivered
        
        engagement_score = (open_rate * open_weight + click_rate * click_weight) * 100
        return round(engagement_score, 2)
    
    async def calculate_engagement_trends(self, campaign_id: str, time_range: str) -> List[Dict[str, Any]]:
        """Calculate engagement trends over time"""
        # Mock trend data
        trends = []
        hours = 24 if time_range == "24h" else 7 * 24 if time_range == "7d" else 1
        
        for i in range(min(hours, 12)):  # Show last 12 data points
            timestamp = datetime.utcnow() - timedelta(hours=i)
            trends.append({
                "timestamp": timestamp.isoformat(),
                "opens": max(0, 50 - i * 2 + (i % 3)),
                "clicks": max(0, 15 - i + (i % 2)),
                "hour": timestamp.hour
            })
        
        return list(reversed(trends))
    
    def generate_mock_events(self, campaign_id: str) -> List[Dict[str, Any]]:
        """Generate mock events for development"""
        events = []
        base_time = datetime.utcnow()
        
        # Generate mock events
        for i in range(100):
            events.append({
                "email_id": f"email_{i}",
                "event_type": "sent",
                "timestamp": (base_time - timedelta(hours=i//10)).isoformat()
            })
        
        for i in range(85):
            events.append({
                "email_id": f"email_{i}",
                "event_type": "delivered",
                "timestamp": (base_time - timedelta(hours=i//10)).isoformat()
            })
        
        for i in range(42):
            events.append({
                "email_id": f"email_{i}",
                "event_type": "opened",
                "timestamp": (base_time - timedelta(hours=i//8)).isoformat()
            })
        
        for i in range(18):
            events.append({
                "email_id": f"email_{i}",
                "event_type": "clicked",
                "timestamp": (base_time - timedelta(hours=i//6)).isoformat()
            })
        
        return events
    
    def get_default_metrics(self) -> Dict[str, Any]:
        """Return default metrics structure"""
        return {
            "total_sent": 0,
            "total_delivered": 0,
            "total_opened": 0,
            "total_clicked": 0,
            "total_bounced": 0,
            "total_unsubscribed": 0,
            "delivery_rate": 0,
            "open_rate": 0,
            "click_rate": 0,
            "bounce_rate": 0,
            "unsubscribe_rate": 0,
            "engagement_score": 0,
            "trends": [],
            "last_updated": datetime.utcnow().isoformat()
        }
