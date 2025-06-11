
import asyncio
import json
import logging
from typing import Dict, Any, List, Optional, Callable
from datetime import datetime, timedelta
import websockets
from dataclasses import dataclass, asdict

logger = logging.getLogger(__name__)

@dataclass
class MetricsUpdate:
    post_id: str
    platform: str
    timestamp: datetime
    likes: int
    comments: int
    shares: int
    views: int
    engagement_rate: float
    reach: int

class RealTimeMetricsService:
    """Service for streaming real-time social media metrics"""
    
    def __init__(self):
        self.logger = logger
        self.connected_clients = set()
        self.metrics_cache = {}
        self.update_callbacks = []
        
    async def start_metrics_streaming(self, post_ids: List[str]) -> None:
        """Start streaming metrics for specified posts"""
        for post_id in post_ids:
            asyncio.create_task(self._monitor_post_metrics(post_id))
    
    async def _monitor_post_metrics(self, post_id: str) -> None:
        """Monitor metrics for a specific post"""
        while True:
            try:
                # Simulate fetching real metrics from platform APIs
                # In production, this would call actual platform APIs
                metrics = await self._fetch_post_metrics(post_id)
                
                if metrics:
                    await self._broadcast_metrics_update(metrics)
                    self.metrics_cache[post_id] = metrics
                
                await asyncio.sleep(30)  # Update every 30 seconds
                
            except Exception as e:
                self.logger.error(f"Error monitoring metrics for post {post_id}: {str(e)}")
                await asyncio.sleep(60)  # Wait longer on error
    
    async def _fetch_post_metrics(self, post_id: str) -> Optional[MetricsUpdate]:
        """Fetch current metrics for a post"""
        try:
            # Mock implementation - replace with actual API calls
            base_metrics = self.metrics_cache.get(post_id)
            
            if not base_metrics:
                # Initial metrics
                return MetricsUpdate(
                    post_id=post_id,
                    platform="facebook",  # Would be determined from post
                    timestamp=datetime.now(),
                    likes=10,
                    comments=2,
                    shares=1,
                    views=100,
                    engagement_rate=13.0,
                    reach=80
                )
            else:
                # Simulate growth
                return MetricsUpdate(
                    post_id=post_id,
                    platform=base_metrics.platform,
                    timestamp=datetime.now(),
                    likes=base_metrics.likes + 1,
                    comments=base_metrics.comments,
                    shares=base_metrics.shares,
                    views=base_metrics.views + 5,
                    engagement_rate=((base_metrics.likes + 1 + base_metrics.comments + base_metrics.shares) / (base_metrics.views + 5)) * 100,
                    reach=base_metrics.reach + 2
                )
                
        except Exception as e:
            self.logger.error(f"Error fetching metrics for post {post_id}: {str(e)}")
            return None
    
    async def _broadcast_metrics_update(self, metrics: MetricsUpdate) -> None:
        """Broadcast metrics update to all connected clients"""
        message = {
            "type": "metrics_update",
            "data": asdict(metrics)
        }
        
        # Convert datetime to ISO string for JSON serialization
        message["data"]["timestamp"] = metrics.timestamp.isoformat()
        
        # Send to WebSocket clients
        if self.connected_clients:
            disconnected_clients = set()
            for client in self.connected_clients:
                try:
                    await client.send(json.dumps(message))
                except websockets.exceptions.ConnectionClosed:
                    disconnected_clients.add(client)
                except Exception as e:
                    self.logger.error(f"Error sending metrics to client: {str(e)}")
                    disconnected_clients.add(client)
            
            # Remove disconnected clients
            self.connected_clients -= disconnected_clients
        
        # Call registered callbacks
        for callback in self.update_callbacks:
            try:
                await callback(metrics)
            except Exception as e:
                self.logger.error(f"Error in metrics callback: {str(e)}")
    
    async def handle_websocket_connection(self, websocket, path):
        """Handle new WebSocket connection"""
        self.connected_clients.add(websocket)
        self.logger.info(f"New metrics client connected. Total: {len(self.connected_clients)}")
        
        try:
            # Send current cached metrics
            for post_id, metrics in self.metrics_cache.items():
                message = {
                    "type": "metrics_update",
                    "data": asdict(metrics)
                }
                message["data"]["timestamp"] = metrics.timestamp.isoformat()
                await websocket.send(json.dumps(message))
            
            # Keep connection alive
            await websocket.wait_closed()
        except websockets.exceptions.ConnectionClosed:
            pass
        finally:
            self.connected_clients.discard(websocket)
            self.logger.info(f"Metrics client disconnected. Total: {len(self.connected_clients)}")
    
    def register_update_callback(self, callback: Callable[[MetricsUpdate], None]) -> None:
        """Register callback for metrics updates"""
        self.update_callbacks.append(callback)
    
    async def get_historical_metrics(self, post_id: str, hours: int = 24) -> List[Dict[str, Any]]:
        """Get historical metrics for a post"""
        # Mock implementation - would query database in production
        end_time = datetime.now()
        start_time = end_time - timedelta(hours=hours)
        
        historical_data = []
        current_time = start_time
        
        while current_time <= end_time:
            historical_data.append({
                "timestamp": current_time.isoformat(),
                "likes": 10 + int((current_time - start_time).total_seconds() / 3600),
                "comments": 2,
                "shares": 1,
                "views": 100 + int((current_time - start_time).total_seconds() / 360),
                "engagement_rate": 12.0 + (current_time - start_time).total_seconds() / 86400,
                "reach": 80 + int((current_time - start_time).total_seconds() / 1800)
            })
            current_time += timedelta(hours=1)
        
        return historical_data
    
    async def generate_metrics_insights(self, post_id: str) -> Dict[str, Any]:
        """Generate insights from metrics data"""
        current_metrics = self.metrics_cache.get(post_id)
        if not current_metrics:
            return {"insights": [], "recommendations": []}
        
        insights = []
        recommendations = []
        
        # Analyze engagement rate
        if current_metrics.engagement_rate > 5.0:
            insights.append({
                "type": "positive",
                "message": f"High engagement rate of {current_metrics.engagement_rate:.1f}%",
                "metric": "engagement_rate"
            })
        elif current_metrics.engagement_rate < 2.0:
            insights.append({
                "type": "warning",
                "message": f"Low engagement rate of {current_metrics.engagement_rate:.1f}%",
                "metric": "engagement_rate"
            })
            recommendations.append("Consider posting at different times or improving content quality")
        
        # Analyze reach vs views
        if current_metrics.reach / current_metrics.views > 0.8:
            insights.append({
                "type": "positive",
                "message": "High reach efficiency - content is being shared well",
                "metric": "reach_efficiency"
            })
        
        return {
            "insights": insights,
            "recommendations": recommendations,
            "generated_at": datetime.now().isoformat()
        }
