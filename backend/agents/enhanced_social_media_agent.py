
import asyncio
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict

from .social.image_generation_service import ImageGenerationService
from .social.real_time_metrics_service import RealTimeMetricsService
from .social.platform_extensions_service import PlatformExtensionsService, ExtendedPlatform
from .social.ab_testing_service import ABTestingService
from .social.trend_monitoring_service import TrendMonitoringService
from .social.multi_model_service import MultiModelService, LLMProvider

logger = logging.getLogger(__name__)

@dataclass
class EnhancedSocialPost:
    id: str
    platform: ExtendedPlatform
    content: str
    media_urls: List[str]
    hashtags: List[str]
    scheduled_time: Optional[datetime]
    published_time: Optional[datetime]
    status: str
    campaign_id: Optional[str]
    ab_test_id: Optional[str]
    generated_by_ai: bool
    ai_provider: Optional[str]
    trend_keywords: List[str]
    performance_prediction: Dict[str, float]
    created_at: datetime
    updated_at: datetime

class EnhancedSocialMediaAgent:
    """Enhanced social media agent with advanced AI capabilities"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.logger = logger
        self.config = config or {}
        
        # Initialize services
        self.image_service = ImageGenerationService(
            openai_api_key=self.config.get("openai_api_key"),
            replicate_api_key=self.config.get("replicate_api_key")
        )
        
        self.metrics_service = RealTimeMetricsService()
        self.platform_service = PlatformExtensionsService()
        self.ab_testing_service = ABTestingService()
        self.trend_service = TrendMonitoringService(
            twitter_bearer_token=self.config.get("twitter_bearer_token"),
            google_trends_api_key=self.config.get("google_trends_api_key")
        )
        self.multi_model_service = MultiModelService()
        
        # Initialize multi-model service with API keys
        if self.config.get("openai_api_key"):
            self.multi_model_service.set_llm_provider("openai", self.config["openai_api_key"])
        if self.config.get("anthropic_api_key"):
            self.multi_model_service.set_llm_provider("anthropic", self.config["anthropic_api_key"])
        if self.config.get("mistral_api_key"):
            self.multi_model_service.set_llm_provider("mistral", self.config["mistral_api_key"])
        
        # Storage
        self.posts_store = {}
        self.campaigns_store = {}
        
        # Start background services
        asyncio.create_task(self._start_background_services())
    
    async def _start_background_services(self):
        """Start background monitoring services"""
        try:
            # Start trend monitoring
            asyncio.create_task(self.trend_service.start_trend_monitoring(interval_minutes=60))
            
            # Register trend callback
            self.trend_service.register_trend_callback(self._handle_trend_update)
            
            self.logger.info("Background services started successfully")
        except Exception as e:
            self.logger.error(f"Error starting background services: {str(e)}")
    
    async def _handle_trend_update(self, trends_data: Dict[str, Any]):
        """Handle trend updates from monitoring service"""
        try:
            # Process new trends and suggest content
            for platform, trend_data in trends_data.items():
                if isinstance(trend_data, dict) and trend_data.get("success"):
                    self.logger.info(f"Updated trends for {platform}: {len(trend_data.get('trends', []))} trends")
        except Exception as e:
            self.logger.error(f"Error handling trend update: {str(e)}")
    
    async def create_ai_powered_post(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Create a social media post with full AI enhancement"""
        try:
            platform = ExtendedPlatform(request["platform"])
            base_prompt = request["content"]
            
            # Get trending topics for inspiration
            trends = await self.trend_service.get_trending_topics(platform.value)
            
            # Suggest content based on trends
            if trends.get("success") and request.get("use_trends", True):
                brand_keywords = request.get("brand_keywords", [])
                target_audience = request.get("target_audience", "general")
                
                trend_suggestions = await self.trend_service.suggest_content_from_trends(
                    trends["trends"], brand_keywords, target_audience
                )
                
                if trend_suggestions.get("success") and trend_suggestions["content_suggestions"]:
                    # Enhance prompt with trending topics
                    top_suggestion = trend_suggestions["content_suggestions"][0]
                    base_prompt = f"{base_prompt}. Consider incorporating: {top_suggestion['suggested_content']}"
            
            # Generate content with AI
            ai_provider = request.get("ai_provider", "openai")
            content_result = await self.multi_model_service.generate_social_content(
                base_prompt, platform.value, provider=ai_provider
            )
            
            if not content_result["success"]:
                return {"success": False, "error": "Failed to generate content"}
            
            generated_content = content_result["content"]
            
            # Optimize for platform
            optimized = await self.platform_service.optimize_content_for_platform(
                generated_content, platform
            )
            
            # Generate hashtags
            hashtags = await self.platform_service.generate_platform_specific_hashtags(
                optimized["content"], platform
            )
            
            # Generate image if requested
            media_urls = []
            if request.get("generate_image", False):
                image_result = await self.image_service.generate_platform_optimized_image(
                    f"Social media image for: {optimized['content'][:100]}", platform.value
                )
                
                if image_result["success"]:
                    media_urls.append(image_result["image_url"])
            
            # Create enhanced post object
            post_id = f"post_{datetime.now().timestamp()}"
            enhanced_post = EnhancedSocialPost(
                id=post_id,
                platform=platform,
                content=optimized["content"],
                media_urls=media_urls,
                hashtags=hashtags,
                scheduled_time=datetime.fromisoformat(request["scheduled_time"]) if request.get("scheduled_time") else None,
                published_time=None,
                status="draft",
                campaign_id=request.get("campaign_id"),
                ab_test_id=None,
                generated_by_ai=True,
                ai_provider=content_result.get("provider_used", ai_provider),
                trend_keywords=[],
                performance_prediction=await self._predict_performance(optimized["content"], platform, hashtags),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store post
            self.posts_store[post_id] = enhanced_post
            
            return {
                "success": True,
                "post": asdict(enhanced_post),
                "ai_insights": {
                    "content_optimizations": optimized.get("optimizations_applied", []),
                    "platform_suggestions": optimized.get("suggestions", {}),
                    "performance_prediction": enhanced_post.performance_prediction,
                    "trend_integration": bool(trends.get("success"))
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error creating AI-powered post: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _predict_performance(self, content: str, platform: ExtendedPlatform, 
                                 hashtags: List[str]) -> Dict[str, float]:
        """Predict post performance using AI analysis"""
        try:
            # Mock performance prediction - would use ML model in production
            content_length = len(content)
            hashtag_count = len(hashtags)
            
            # Platform-specific scoring
            platform_multipliers = {
                ExtendedPlatform.INSTAGRAM: 1.2,
                ExtendedPlatform.TIKTOK: 1.5,
                ExtendedPlatform.TWITTER: 1.0,
                ExtendedPlatform.LINKEDIN: 0.8,
                ExtendedPlatform.FACEBOOK: 0.9,
                ExtendedPlatform.PINTEREST: 1.1
            }
            
            base_score = 50.0  # Base engagement prediction
            multiplier = platform_multipliers.get(platform, 1.0)
            
            # Adjust based on content characteristics
            if content_length > 100 and content_length < 200:
                base_score += 10
            
            if hashtag_count >= 3 and hashtag_count <= 7:
                base_score += 15
            
            predicted_engagement = min(100.0, base_score * multiplier)
            
            return {
                "engagement_rate": predicted_engagement,
                "expected_likes": predicted_engagement * 10,
                "expected_comments": predicted_engagement * 2,
                "expected_shares": predicted_engagement * 1,
                "viral_potential": min(95.0, predicted_engagement * 1.2),
                "confidence_score": 0.75
            }
            
        except Exception as e:
            self.logger.error(f"Error predicting performance: {str(e)}")
            return {"engagement_rate": 50.0, "confidence_score": 0.5}
    
    async def create_ab_test_campaign(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Create A/B test campaign with multiple content variants"""
        try:
            platform = request["platform"]
            base_content = request["base_content"]
            variant_count = request.get("variant_count", 3)
            
            # Generate multiple variants using different approaches
            variants = []
            
            for i in range(variant_count):
                # Use different AI providers or prompts for variety
                providers = ["openai", "anthropic", "mistral"]
                provider = providers[i % len(providers)]
                
                variant_prompt = f"{base_content}. Create variant {i+1} with a {['professional', 'casual', 'creative'][i % 3]} tone."
                
                content_result = await self.multi_model_service.generate_social_content(
                    variant_prompt, platform, provider=provider
                )
                
                if content_result["success"]:
                    variants.append({
                        "content": content_result["content"],
                        "ai_provider": content_result.get("provider_used", provider),
                        "cost": 15.0  # Cost per variant
                    })
            
            # Create A/B test
            test_result = await self.ab_testing_service.create_ab_test(
                test_name=request.get("test_name", f"Test_{datetime.now().strftime('%Y%m%d_%H%M')}"),
                platform=platform,
                variants=variants,
                duration_hours=request.get("duration_hours", 24)
            )
            
            return test_result
            
        except Exception as e:
            self.logger.error(f"Error creating A/B test campaign: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_real_time_insights(self, post_id: str = None) -> Dict[str, Any]:
        """Get real-time insights and recommendations"""
        try:
            insights = {
                "timestamp": datetime.now().isoformat(),
                "post_insights": {},
                "trending_opportunities": {},
                "performance_recommendations": []
            }
            
            # Get post-specific insights
            if post_id and post_id in self.posts_store:
                post = self.posts_store[post_id]
                
                # Get real-time metrics
                post_metrics = await self.metrics_service.generate_metrics_insights(post_id)
                insights["post_insights"] = post_metrics
                
                # Get A/B test results if applicable
                if post.ab_test_id:
                    ab_results = await self.ab_testing_service.analyze_test_results(post.ab_test_id)
                    insights["ab_test_results"] = ab_results
            
            # Get trending opportunities
            trending = await self.trend_service.get_trending_topics()
            if trending.get("success"):
                insights["trending_opportunities"] = {
                    "current_trends": trending["trends"][:5],
                    "content_suggestions": []
                }
            
            # Generate performance recommendations
            insights["performance_recommendations"] = await self._generate_performance_recommendations()
            
            return {
                "success": True,
                "insights": insights
            }
            
        except Exception as e:
            self.logger.error(f"Error getting real-time insights: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_performance_recommendations(self) -> List[Dict[str, str]]:
        """Generate performance improvement recommendations"""
        recommendations = []
        
        # Analyze recent posts performance
        recent_posts = [
            post for post in self.posts_store.values()
            if post.created_at > datetime.now() - timedelta(days=7)
        ]
        
        if not recent_posts:
            recommendations.append({
                "type": "posting_frequency",
                "message": "Consider posting more regularly to build audience engagement",
                "priority": "medium"
            })
        
        # Check AI provider diversity
        ai_providers = set(post.ai_provider for post in recent_posts if post.ai_provider)
        if len(ai_providers) < 2:
            recommendations.append({
                "type": "ai_diversity",
                "message": "Try different AI providers to vary your content style",
                "priority": "low"
            })
        
        # Platform diversity
        platforms = set(post.platform for post in recent_posts)
        if len(platforms) < 3:
            recommendations.append({
                "type": "platform_expansion",
                "message": "Consider expanding to additional social platforms",
                "priority": "medium"
            })
        
        return recommendations
    
    async def bulk_content_generation(self, request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate multiple pieces of content for different platforms"""
        try:
            base_topic = request["topic"]
            platforms = request.get("platforms", ["instagram", "twitter", "linkedin"])
            count_per_platform = request.get("count_per_platform", 2)
            
            generated_content = {}
            
            for platform in platforms:
                platform_content = []
                
                for i in range(count_per_platform):
                    # Vary the approach for each piece
                    approaches = ["educational", "entertaining", "promotional", "behind_scenes"]
                    approach = approaches[i % len(approaches)]
                    
                    prompt = f"Create {approach} content about {base_topic} for {platform}"
                    
                    content_result = await self.multi_model_service.generate_social_content(
                        prompt, platform
                    )
                    
                    if content_result["success"]:
                        # Optimize for platform
                        optimized = await self.platform_service.optimize_content_for_platform(
                            content_result["content"], ExtendedPlatform(platform)
                        )
                        
                        platform_content.append({
                            "content": optimized["content"],
                            "approach": approach,
                            "hashtags": await self.platform_service.generate_platform_specific_hashtags(
                                optimized["content"], ExtendedPlatform(platform)
                            ),
                            "ai_provider": content_result.get("provider_used"),
                            "optimizations": optimized.get("optimizations_applied", [])
                        })
                
                generated_content[platform] = platform_content
            
            return {
                "success": True,
                "generated_content": generated_content,
                "total_pieces": sum(len(content) for content in generated_content.values()),
                "generation_time": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error in bulk content generation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def get_trend_based_suggestions(self, brand_keywords: List[str], 
                                        target_audience: str = "general") -> Dict[str, Any]:
        """Get content suggestions based on current trends"""
        try:
            # Get trends from multiple sources
            twitter_trends = await self.trend_service.get_trending_topics("twitter")
            google_trends = await self.trend_service.get_trending_topics("google")
            
            all_trends = []
            if twitter_trends.get("success"):
                all_trends.extend(twitter_trends["trends"])
            if google_trends.get("success"):
                all_trends.extend(google_trends["trends"])
            
            # Get content suggestions
            suggestions = await self.trend_service.suggest_content_from_trends(
                all_trends, brand_keywords, target_audience
            )
            
            return suggestions
            
        except Exception as e:
            self.logger.error(f"Error getting trend-based suggestions: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get comprehensive status of the enhanced social media agent"""
        return {
            "agent_name": "Enhanced Social Media Agent",
            "version": "2.0.0",
            "active_posts": len(self.posts_store),
            "active_ab_tests": len(self.ab_testing_service.active_tests),
            "services_status": {
                "image_generation": bool(self.image_service.openai_api_key or self.image_service.replicate_api_key),
                "real_time_metrics": True,
                "platform_extensions": True,
                "ab_testing": True,
                "trend_monitoring": bool(self.trend_service.twitter_bearer_token),
                "multi_model": len(self.multi_model_service.api_keys) > 0
            },
            "supported_platforms": [platform.value for platform in ExtendedPlatform],
            "ai_providers": self.multi_model_service.get_provider_status(),
            "last_updated": datetime.now().isoformat()
        }
