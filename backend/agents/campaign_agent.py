from datetime import datetime, timedelta
from typing import Dict, Any, List
import json
import logging
from .base_agent import BaseAgent
from .ai_service import AIService

logger = logging.getLogger(__name__)

class CampaignAgent(BaseAgent):
    """AI-powered campaign management and optimization agent"""
    
    def __init__(self, agent_id: int, supabase_client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
    
    async def _initialize_ai_service(self):
        """Initialize AI service with OpenAI API key from secrets"""
        if self.ai_service is None:
            try:
                # Get OpenAI API key from user secrets
                result = await self.supabase.functions.invoke("manage-user-secrets", {
                    "body": json.dumps({"serviceName": "openai_api_key"}),
                    "headers": {"Content-Type": "application/json"}
                })
                
                if result.get('data') and result['data'].get('value'):
                    api_key = result['data']['value']
                    self.ai_service = AIService(api_key)
                    self.logger.info("AI service initialized for campaign management")
                else:
                    raise Exception("OpenAI API key not found in user secrets")
                    
            except Exception as e:
                self.logger.error(f"Failed to initialize AI service: {str(e)}")
                raise Exception(f"AI service initialization failed: {str(e)}")
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            "optimize_campaign",
            "analyze_performance", 
            "generate_ab_tests",
            "schedule_campaigns",
            "create_campaign_copy",
            "monitor_campaigns"
        ]
    
    async def get_campaigns(self, filters=None, limit=50):
        """
        Retrieve active campaigns from the database
        
        Args:
            filters (dict): Optional filters for campaigns
            limit (int): Maximum number of campaigns to return
        
        Returns:
            list: List of campaign dictionaries
        """
        try:
            # Query the active_campaigns view that your backend expects
            query = self.supabase.table('active_campaigns').select('*').limit(limit)
            
            # Apply filters if provided
            if filters:
                if 'status' in filters:
                    query = query.eq('status', filters['status'])
                if 'type' in filters:
                    query = query.eq('type', filters['type'])
                if 'channel' in filters:
                    query = query.eq('channel', filters['channel'])
            
            # Execute the query
            result = query.execute()
            
            if result.data:
                self.logger.info(f"✅ Retrieved {len(result.data)} campaigns from database")
                return result.data
            else:
                self.logger.info("⚠️ No campaigns found in database")
                return []
            
        except Exception as e:
            self.logger.error(f"❌ Error retrieving campaigns: {str(e)}")
            return []
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute campaign management tasks using AI"""
        await self._initialize_ai_service()
        
        if task_type == "optimize_campaign":
            return await self._optimize_campaign(input_data)
        elif task_type == "analyze_performance":
            return await self._analyze_performance(input_data)
        elif task_type == "generate_ab_tests":
            return await self._generate_ab_tests(input_data)
        elif task_type == "schedule_campaigns":
            return await self._schedule_campaigns(input_data)
        elif task_type == "create_campaign_copy":
            return await self._create_campaign_copy(input_data)
        elif task_type == "monitor_campaigns":
            return await self._monitor_campaigns(input_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _optimize_campaign(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize campaign using AI recommendations"""
        self.validate_input_data(["campaign_id"], input_data)
        
        campaign_id = input_data["campaign_id"]
        
        try:
            # Get campaign data
            campaign_data = await self.get_campaign_data(campaign_id)
            if not campaign_data:
                raise Exception(f"Campaign {campaign_id} not found")
            
            # Get AI optimization recommendations
            optimization = await self.ai_service.optimize_campaign_copy(campaign_data)
            
            # Apply optimizations
            optimized_content = campaign_data.get("content", {})
            optimized_content.update({
                "ai_optimizations": optimization,
                "optimization_date": datetime.utcnow().isoformat(),
                "original_version": campaign_data.get("content", {})
            })
            
            # Update campaign
            self.supabase.table("campaigns")\
                .update({
                    "content": optimized_content,
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq("id", campaign_id)\
                .execute()
            
            # Log optimization metrics
            await self.update_campaign_metrics(campaign_id, {
                "optimization_applied": True,
                "optimization_type": "ai_enhanced",
                "predicted_improvement": optimization.get("performance_predictions", {}),
                "optimization_timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "campaign_id": campaign_id,
                "optimizations": optimization,
                "status": "optimized",
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Failed to optimize campaign {campaign_id}: {str(e)}")
            raise Exception(f"Campaign optimization failed: {str(e)}")
    
    async def _analyze_performance(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze campaign performance with AI insights"""
        campaign_ids = input_data.get("campaign_ids", [])
        time_period = input_data.get("time_period", "last_30_days")
        
        analysis_results = []
        
        for campaign_id in campaign_ids:
            try:
                campaign_data = await self.get_campaign_data(campaign_id)
                if not campaign_data:
                    continue
                
                # Get campaign metrics
                metrics_result = self.supabase.table("campaign_metrics")\
                    .select("*")\
                    .eq("campaign_id", campaign_id)\
                    .gte("metric_date", self._get_date_from_period(time_period))\
                    .execute()
                
                metrics = metrics_result.data if metrics_result.data else []
                
                # Calculate performance indicators
                performance_data = self._calculate_performance_metrics(metrics)
                
                # Generate AI insights about performance
                performance_analysis = {
                    "campaign_id": campaign_id,
                    "campaign_name": campaign_data.get("name", "Unknown"),
                    "performance_score": performance_data.get("overall_score", 0),
                    "key_metrics": performance_data,
                    "ai_recommendations": await self._generate_performance_recommendations(campaign_data, performance_data),
                    "trend_analysis": self._analyze_performance_trends(metrics),
                    "analysis_period": time_period
                }
                
                analysis_results.append(performance_analysis)
                
            except Exception as e:
                self.logger.error(f"Failed to analyze campaign {campaign_id}: {str(e)}")
        
        return {
            "analyses": analysis_results,
            "total_campaigns": len(campaign_ids),
            "successful_analyses": len(analysis_results),
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success"
        }
    
    async def _generate_ab_tests(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate A/B test variations using AI"""
        self.validate_input_data(["campaign_id", "test_element"], input_data)
        
        campaign_id = input_data["campaign_id"]
        test_element = input_data["test_element"]  # subject_line, content, cta, etc.
        
        try:
            campaign_data = await self.get_campaign_data(campaign_id)
            if not campaign_data:
                raise Exception(f"Campaign {campaign_id} not found")
            
            # Generate AI variations
            optimization = await self.ai_service.optimize_campaign_copy(campaign_data)
            
            # Create A/B test variations
            variants = optimization.get("a_b_test_variants", [])
            if not variants:
                variants = ["Original version", "AI-optimized version"]
            
            ab_test_data = {
                "campaign_id": campaign_id,
                "test_element": test_element,
                "variants": variants,
                "original_content": campaign_data.get("content", {}),
                "ai_predictions": optimization.get("performance_predictions", {}),
                "created_at": datetime.utcnow().isoformat(),
                "status": "ready"
            }
            
            return {
                "ab_test": ab_test_data,
                "variants_count": len(variants),
                "predicted_winner": variants[0] if variants else "Unknown",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate A/B tests: {str(e)}")
            raise Exception(f"A/B test generation failed: {str(e)}")
    
    async def _schedule_campaigns(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Schedule campaigns with AI-optimized timing"""
        campaign_ids = input_data.get("campaign_ids", [])
        scheduling_preferences = input_data.get("preferences", {})
        
        scheduled_campaigns = []
        
        for campaign_id in campaign_ids:
            try:
                campaign_data = await self.get_campaign_data(campaign_id)
                if not campaign_data:
                    continue
                
                # AI-optimized scheduling logic
                optimal_time = self._calculate_optimal_send_time(
                    campaign_data.get("target_audience", {}),
                    scheduling_preferences
                )
                
                # Update campaign with scheduled time
                self.supabase.table("campaigns")\
                    .update({
                        "start_date": optimal_time,
                        "status": "scheduled",
                        "updated_at": datetime.utcnow().isoformat()
                    })\
                    .eq("id", campaign_id)\
                    .execute()
                
                scheduled_campaigns.append({
                    "campaign_id": campaign_id,
                    "scheduled_time": optimal_time,
                    "reasoning": "AI-optimized timing based on audience analysis"
                })
                
            except Exception as e:
                self.logger.error(f"Failed to schedule campaign {campaign_id}: {str(e)}")
        
        return {
            "scheduled_campaigns": scheduled_campaigns,
            "total_scheduled": len(scheduled_campaigns),
            "timestamp": datetime.utcnow().isoformat(),
            "status": "success"
        }
    
    async def _create_campaign_copy(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create campaign copy using AI"""
        self.validate_input_data(["campaign_type", "target_audience"], input_data)
        
        campaign_type = input_data["campaign_type"]
        target_audience = input_data["target_audience"]
        brand_voice = input_data.get("brand_voice", "professional")
        
        try:
            if campaign_type == "email":
                content = await self.ai_service.generate_email_content(campaign_type, target_audience)
            else:
                content = await self.ai_service.generate_social_post(campaign_type, "campaign content", brand_voice)
            
            return {
                "campaign_copy": content,
                "campaign_type": campaign_type,
                "target_audience": target_audience,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create campaign copy: {str(e)}")
            raise Exception(f"Campaign copy creation failed: {str(e)}")
    
    async def _monitor_campaigns(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Monitor active campaigns and provide alerts"""
        try:
            # Get active campaigns
            active_campaigns = self.supabase.table("campaigns")\
                .select("*")\
                .eq("status", "active")\
                .execute()
            
            campaigns = active_campaigns.data if active_campaigns.data else []
            
            monitoring_results = []
            alerts = []
            
            for campaign in campaigns:
                campaign_id = campaign["id"]
                
                # Check campaign health
                health_status = await self._check_campaign_health(campaign)
                
                monitoring_results.append({
                    "campaign_id": campaign_id,
                    "campaign_name": campaign.get("name", "Unknown"),
                    "health_status": health_status["status"],
                    "metrics": health_status["metrics"],
                    "last_checked": datetime.utcnow().isoformat()
                })
                
                # Generate alerts if needed
                if health_status["status"] == "warning" or health_status["status"] == "critical":
                    alerts.append({
                        "campaign_id": campaign_id,
                        "alert_type": health_status["status"],
                        "message": health_status.get("message", "Campaign needs attention"),
                        "recommendations": health_status.get("recommendations", [])
                    })
            
            return {
                "monitoring_results": monitoring_results,
                "alerts": alerts,
                "total_campaigns_monitored": len(campaigns),
                "campaigns_with_issues": len(alerts),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to monitor campaigns: {str(e)}")
            raise Exception(f"Campaign monitoring failed: {str(e)}")
    
    def _get_date_from_period(self, period: str) -> str:
        """Convert period string to date"""
        now = datetime.utcnow()
        if period == "last_7_days":
            return (now - timedelta(days=7)).isoformat()
        elif period == "last_30_days":
            return (now - timedelta(days=30)).isoformat()
        elif period == "last_90_days":
            return (now - timedelta(days=90)).isoformat()
        else:
            return (now - timedelta(days=30)).isoformat()
    
    def _calculate_performance_metrics(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate performance metrics from raw data"""
        if not metrics:
            return {"overall_score": 0}
        
        # Simple aggregation - could be enhanced with more sophisticated analysis
        total_metrics = len(metrics)
        avg_value = sum(m.get("metric_value", 0) for m in metrics) / total_metrics if total_metrics > 0 else 0
        
        return {
            "overall_score": min(100, int(avg_value)),
            "total_data_points": total_metrics,
            "average_performance": avg_value,
            "performance_trend": "stable"  # Could be enhanced with trend analysis
        }
    
    async def _generate_performance_recommendations(self, campaign_data: Dict[str, Any], performance_data: Dict[str, Any]) -> List[str]:
        """Generate AI-powered performance recommendations"""
        recommendations = []
        
        score = performance_data.get("overall_score", 0)
        
        if score < 30:
            recommendations.extend([
                "Consider revising campaign messaging",
                "Review target audience segmentation", 
                "Test different send times"
            ])
        elif score < 60:
            recommendations.extend([
                "Optimize subject lines for better open rates",
                "A/B test call-to-action buttons",
                "Refine audience targeting"
            ])
        else:
            recommendations.extend([
                "Campaign performing well - consider scaling",
                "Test new content variations",
                "Expand to similar audience segments"
            ])
        
        return recommendations
    
    def _analyze_performance_trends(self, metrics: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Analyze performance trends over time"""
        if len(metrics) < 2:
            return {"trend": "insufficient_data"}
        
        # Simple trend analysis
        recent_metrics = sorted(metrics, key=lambda x: x.get("metric_date", ""))
        first_half = recent_metrics[:len(recent_metrics)//2]
        second_half = recent_metrics[len(recent_metrics)//2:]
        
        first_avg = sum(m.get("metric_value", 0) for m in first_half) / len(first_half) if first_half else 0
        second_avg = sum(m.get("metric_value", 0) for m in second_half) / len(second_half) if second_half else 0
        
        if second_avg > first_avg * 1.1:
            trend = "improving"
        elif second_avg < first_avg * 0.9:
            trend = "declining"
        else:
            trend = "stable"
        
        return {
            "trend": trend,
            "change_percentage": ((second_avg - first_avg) / first_avg * 100) if first_avg > 0 else 0
        }
    
    def _calculate_optimal_send_time(self, target_audience: Dict[str, Any], preferences: Dict[str, Any]) -> str:
        """Calculate optimal send time using AI insights"""
        # Default to business hours, could be enhanced with ML
        now = datetime.utcnow()
        
        # Optimize for business audience
        if target_audience.get("job_title", "").lower() in ["ceo", "manager", "director"]:
            # Send Tuesday-Thursday, 10 AM
            days_ahead = (1 - now.weekday()) % 7  # Next Tuesday
            if days_ahead == 0 and now.hour >= 10:
                days_ahead = 7
            
            optimal_date = now + timedelta(days=days_ahead)
            optimal_time = optimal_date.replace(hour=10, minute=0, second=0, microsecond=0)
        else:
            # General audience - Wednesday 2 PM
            days_ahead = (2 - now.weekday()) % 7  # Next Wednesday  
            if days_ahead == 0 and now.hour >= 14:
                days_ahead = 7
                
            optimal_date = now + timedelta(days=days_ahead)
            optimal_time = optimal_date.replace(hour=14, minute=0, second=0, microsecond=0)
        
        return optimal_time.isoformat()
    
    async def _check_campaign_health(self, campaign: Dict[str, Any]) -> Dict[str, Any]:
        """Check campaign health and performance"""
        campaign_id = campaign["id"]
        
        # Get recent metrics
        metrics_result = self.supabase.table("campaign_metrics")\
            .select("*")\
            .eq("campaign_id", campaign_id)\
            .gte("metric_date", (datetime.utcnow() - timedelta(days=7)).date().isoformat())\
            .execute()
        
        metrics = metrics_result.data if metrics_result.data else []
        
        if not metrics:
            return {
                "status": "warning",
                "message": "No recent performance data",
                "metrics": {},
                "recommendations": ["Check data collection", "Verify campaign is active"]
            }
        
        avg_performance = sum(m.get("metric_value", 0) for m in metrics) / len(metrics)
        
        if avg_performance < 20:
            status = "critical"
            message = "Campaign performance below threshold"
            recommendations = ["Review targeting", "Update creative", "Consider pausing"]
        elif avg_performance < 50:
            status = "warning" 
            message = "Campaign performance needs improvement"
            recommendations = ["Optimize content", "Test new audiences", "Adjust timing"]
        else:
            status = "healthy"
            message = "Campaign performing well"
            recommendations = ["Continue monitoring", "Consider scaling", "Test variations"]
        
        return {
            "status": status,
            "message": message,
            "metrics": {"average_performance": avg_performance, "data_points": len(metrics)},
            "recommendations": recommendations
        }
