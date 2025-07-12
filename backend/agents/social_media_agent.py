# agents/social_media_agent.py

import asyncio
import json
import logging
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class SocialPlatform(str, Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"

class PostStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"
    DELETED = "deleted"

class EngagementType(str, Enum):
    LIKE = "like"
    COMMENT = "comment"
    SHARE = "share"
    MENTION = "mention"
    DIRECT_MESSAGE = "direct_message"

class SentimentType(str, Enum):
    POSITIVE = "positive"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"

@dataclass
class SocialPost:
    id: str
    platform: SocialPlatform
    content: str
    media_urls: List[str]
    scheduled_time: Optional[datetime]
    published_time: Optional[datetime]
    status: PostStatus
    engagement_stats: Dict[str, int]
    hashtags: List[str]
    mentions: List[str]
    campaign_id: Optional[str]
    created_at: datetime
    updated_at: datetime

@dataclass
class EngagementItem:
    id: str
    platform: SocialPlatform
    post_id: str
    type: EngagementType
    author: str
    content: str
    sentiment: SentimentType
    timestamp: datetime
    responded: bool
    response_content: Optional[str]
    priority_score: float

@dataclass
class SocialAnalytics:
    platform: SocialPlatform
    followers_count: int
    following_count: int
    posts_count: int
    engagement_rate: float
    reach: int
    impressions: int
    clicks: int
    shares: int
    comments: int
    likes: int
    period_start: datetime
    period_end: datetime

class SocialMediaAgent:
    def __init__(self, openai_api_key: str, supabase_client=None):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.supabase = supabase_client
        self.posts_store: Dict[str, SocialPost] = {}
        self.engagement_store: Dict[str, EngagementItem] = {}
        self.analytics_cache: Dict[str, Any] = {}
        
        # Platform-specific settings
        self.platform_limits = {
            SocialPlatform.TWITTER: 280,
            SocialPlatform.LINKEDIN: 3000,
            SocialPlatform.FACEBOOK: 63206,
            SocialPlatform.INSTAGRAM: 2200,
            SocialPlatform.YOUTUBE: 5000,
            SocialPlatform.TIKTOK: 2200
        }
        
        # Platform credentials (would come from environment variables)
        self.platform_credentials = {}

    def _has_platform_credentials(self, platform: SocialPlatform) -> bool:
        """Check if credentials are available for platform"""
        required_creds = {
            SocialPlatform.TWITTER: ['twitter_bearer_token'],
            SocialPlatform.LINKEDIN: ['linkedin_access_token'],
            SocialPlatform.FACEBOOK: ['facebook_access_token', 'facebook_page_id'],
            SocialPlatform.INSTAGRAM: ['instagram_access_token'],
            SocialPlatform.YOUTUBE: ['youtube_api_key'],
            SocialPlatform.TIKTOK: ['tiktok_access_token']
        }
        
        platform_creds = required_creds.get(platform, [])
        return all(cred in self.platform_credentials for cred in platform_creds)

    async def create_post(self, platform: SocialPlatform, content: str, 
                         media_urls: List[str] = None, hashtags: List[str] = None,
                         scheduled_time: datetime = None, campaign_id: str = None) -> Dict[str, Any]:
        """Create a social media post"""
        try:
            # Optimize content for platform
            optimized_content = await self._optimize_content_for_platform(content, platform)
            
            # Generate hashtags if not provided
            if not hashtags:
                hashtags = await self._generate_hashtags(optimized_content, platform)
            
            # Create post object
            post_id = f"post_{datetime.now().timestamp()}"
            post = SocialPost(
                id=post_id,
                platform=platform,
                content=optimized_content,
                media_urls=media_urls or [],
                scheduled_time=scheduled_time,
                published_time=None,
                status=PostStatus.SCHEDULED if scheduled_time else PostStatus.DRAFT,
                engagement_stats={},
                hashtags=hashtags,
                mentions=self._extract_mentions(optimized_content),
                campaign_id=campaign_id,
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            # Store post
            self.posts_store[post_id] = post
            
            # Save to database if available
            if self.supabase:
                try:
                    self.supabase.table('social_posts').insert(asdict(post)).execute()
                except Exception as e:
                    logger.warning(f"Failed to save post to database: {e}")
            
            # Schedule for immediate publishing if no scheduled time
            if not scheduled_time:
                await self._publish_post(post_id)
            
            return {
                "success": True,
                "data": {
                    "post_id": post_id,
                    "platform": platform.value,
                    "content": optimized_content,
                    "hashtags": hashtags,
                    "status": post.status.value,
                    "scheduled_time": scheduled_time.isoformat() if scheduled_time else None
                }
            }
            
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            return {"success": False, "error": str(e)}

    async def _optimize_content_for_platform(self, content: str, platform: SocialPlatform) -> str:
        """Optimize content for specific platform"""
        
        prompt = f"""
        Optimize this social media content for {platform.value}:
        
        Original content: {content}
        
        Platform requirements:
        - Character limit: {self.platform_limits[platform]}
        - Platform: {platform.value}
        
        Optimization guidelines:
        - LinkedIn: Professional tone, industry insights, thought leadership
        - Twitter: Concise, engaging, trending hashtags, Twitter-specific language
        - Facebook: Conversational, community-focused, longer-form content allowed
        - Instagram: Visual-focused, lifestyle, hashtag-heavy, story-telling
        - YouTube: Educational, entertainment value, call-to-action
        - TikTok: Trendy, youth-focused, creative, challenge-oriented
        
        Return the optimized content that maximizes engagement for this platform.
        Keep within character limits and maintain the core message.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=500
            )
            
            optimized = response.choices[0].message.content.strip()
            
            # Ensure content fits within platform limits
            if len(optimized) > self.platform_limits[platform]:
                optimized = optimized[:self.platform_limits[platform]-3] + "..."
            
            return optimized
            
        except Exception as e:
            logger.error(f"Error optimizing content: {e}")
            # Return truncated original content if optimization fails
            limit = self.platform_limits[platform]
            return content[:limit-3] + "..." if len(content) > limit else content

    async def _generate_hashtags(self, content: str, platform: SocialPlatform) -> List[str]:
        """Generate relevant hashtags for content and platform"""
        
        hashtag_counts = {
            SocialPlatform.TWITTER: 3,
            SocialPlatform.LINKEDIN: 5,
            SocialPlatform.FACEBOOK: 3,
            SocialPlatform.INSTAGRAM: 10,
            SocialPlatform.YOUTUBE: 5,
            SocialPlatform.TIKTOK: 8
        }
        
        count = hashtag_counts.get(platform, 5)
        
        prompt = f"""
        Generate {count} relevant hashtags for this {platform.value} post:
        
        Content: {content}
        
        Requirements:
        - Platform: {platform.value}
        - Number of hashtags: {count}
        - Mix of popular and niche hashtags
        - Relevant to content and platform audience
        - No spaces in hashtags
        
        Return only the hashtags, one per line, with # symbol.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            
            hashtags_text = response.choices[0].message.content.strip()
            hashtags = [tag.strip() for tag in hashtags_text.split('\n') if tag.strip().startswith('#')]
            
            return hashtags[:count]  # Ensure we don't exceed the requested count
            
        except Exception as e:
            logger.error(f"Error generating hashtags: {e}")
            return ["#marketing", "#business", "#socialmedia"]  # Fallback hashtags

    def _extract_mentions(self, content: str) -> List[str]:
        """Extract @mentions from content"""
        mention_pattern = r'@(\w+)'
        mentions = re.findall(mention_pattern, content)
        return [f"@{mention}" for mention in mentions]

    async def _publish_post(self, post_id: str) -> bool:
        """Publish a post to the social platform"""
        post = self.posts_store.get(post_id)
        if not post:
            return False
        
        try:
            # Check if platform credentials are available
            if not self._has_platform_credentials(post.platform):
                logger.warning(f"No credentials for {post.platform.value}")
                post.status = PostStatus.FAILED
                return False
            
            # Platform-specific publishing logic would go here
            # For now, simulate successful publishing
            post.status = PostStatus.PUBLISHED
            post.published_time = datetime.now()
            
            # Initialize engagement stats
            post.engagement_stats = {
                "likes": 0,
                "comments": 0,
                "shares": 0,
                "clicks": 0,
                "impressions": 0,
                "reach": 0
            }
            
            # Update in store
            self.posts_store[post_id] = post
            
            # Update database
            if self.supabase:
                try:
                    self.supabase.table('social_posts').update(asdict(post)).eq('id', post_id).execute()
                except Exception as e:
                    logger.warning(f"Failed to update post in database: {e}")
            
            logger.info(f"Post {post_id} published successfully to {post.platform.value}")
            return True
            
        except Exception as e:
            logger.error(f"Error publishing post {post_id}: {e}")
            post.status = PostStatus.FAILED
            return False

    async def schedule_post(self, post_id: str, scheduled_time: datetime) -> Dict[str, Any]:
        """Schedule a post for future publishing"""
        try:
            post = self.posts_store.get(post_id)
            if not post:
                return {"success": False, "error": "Post not found"}
            
            post.scheduled_time = scheduled_time
            post.status = PostStatus.SCHEDULED
            post.updated_at = datetime.now()
            
            # Update store
            self.posts_store[post_id] = post
            
            # Update database
            if self.supabase:
                try:
                    self.supabase.table('social_posts').update(asdict(post)).eq('id', post_id).execute()
                except Exception as e:
                    logger.warning(f"Failed to update scheduled post: {e}")
            
            return {
                "success": True,
                "data": {
                    "post_id": post_id,
                    "scheduled_time": scheduled_time.isoformat(),
                    "status": post.status.value
                }
            }
            
        except Exception as e:
            logger.error(f"Error scheduling post: {e}")
            return {"success": False, "error": str(e)}

    async def get_posts(self, platform: SocialPlatform = None, status: PostStatus = None,
                       campaign_id: str = None, limit: int = 50) -> Dict[str, Any]:
        """Get social media posts with filters"""
        try:
            posts = list(self.posts_store.values())
            
            # Apply filters
            if platform:
                posts = [p for p in posts if p.platform == platform]
            if status:
                posts = [p for p in posts if p.status == status]
            if campaign_id:
                posts = [p for p in posts if p.campaign_id == campaign_id]
            
            # Sort by created date (newest first)
            posts.sort(key=lambda x: x.created_at, reverse=True)
            
            # Apply limit
            posts = posts[:limit]
            
            # Convert to dict format
            posts_data = []
            for post in posts:
                post_dict = asdict(post)
                # Convert datetime objects to ISO strings
                for field in ['scheduled_time', 'published_time', 'created_at', 'updated_at']:
                    if post_dict[field]:
                        post_dict[field] = post_dict[field].isoformat()
                posts_data.append(post_dict)
            
            return {
                "success": True,
                "data": {
                    "posts": posts_data,
                    "total_count": len(posts_data),
                    "filters_applied": {
                        "platform": platform.value if platform else None,
                        "status": status.value if status else None,
                        "campaign_id": campaign_id
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting posts: {e}")
            return {"success": False, "error": str(e)}

    async def monitor_engagement(self, post_id: str = None) -> Dict[str, Any]:
        """Monitor engagement for posts"""
        try:
            # Get posts to monitor
            posts_to_monitor = []
            if post_id:
                post = self.posts_store.get(post_id)
                if post:
                    posts_to_monitor = [post]
            else:
                # Monitor all published posts from last 7 days
                cutoff_date = datetime.now() - timedelta(days=7)
                posts_to_monitor = [
                    p for p in self.posts_store.values()
                    if p.status == PostStatus.PUBLISHED and p.published_time and p.published_time > cutoff_date
                ]
            
            engagement_data = []
            
            for post in posts_to_monitor:
                # Real implementations should query the respective platform APIs
                # for engagement metrics. Here we simply return stored stats.
                stats = post.engagement_stats or {}
                engagement = {
                    "post_id": post.id,
                    "platform": post.platform.value,
                    **stats,
                    "last_updated": datetime.now().isoformat(),
                }

                self.posts_store[post.id] = post
                engagement_data.append(engagement)
            
            return {
                "success": True,
                "data": {
                    "engagement_data": engagement_data,
                    "monitored_posts": len(posts_to_monitor),
                    "last_update": datetime.now().isoformat()
                }
            }
            
        except Exception as e:
            logger.error(f"Error monitoring engagement: {e}")
            return {"success": False, "error": str(e)}

    async def respond_to_engagement(self, engagement_id: str, auto_respond: bool = True) -> Dict[str, Any]:
        """Respond to engagement items (comments, mentions, DMs)"""
        try:
            engagement = self.engagement_store.get(engagement_id)
            if not engagement:
                return {"success": False, "error": "Engagement item not found"}
            
            if engagement.responded:
                return {"success": False, "error": "Already responded to this engagement"}
            
            response_content = None
            
            if auto_respond:
                # Generate AI response
                response_content = await self._generate_engagement_response(engagement)
                
                # In real implementation, this would post the response to the platform
                logger.info(f"Auto-responding to {engagement.type.value} from {engagement.author}")
                
                # Update engagement status
                engagement.responded = True
                engagement.response_content = response_content
                self.engagement_store[engagement_id] = engagement
            
            return {
                "success": True,
                "data": {
                    "engagement_id": engagement_id,
                    "response_content": response_content,
                    "responded": engagement.responded,
                    "auto_generated": auto_respond
                }
            }
            
        except Exception as e:
            logger.error(f"Error responding to engagement: {e}")
            return {"success": False, "error": str(e)}

    async def _generate_engagement_response(self, engagement: EngagementItem) -> str:
        """Generate AI response to engagement"""
        
        # Get original post context
        original_post = self.posts_store.get(engagement.post_id)
        post_content = original_post.content if original_post else "N/A"
        
        prompt = f"""
        Generate a professional and engaging response to this social media {engagement.type.value}:
        
        Original Post: {post_content}
        Platform: {engagement.platform.value}
        
        {engagement.type.value.title()} from {engagement.author}:
        "{engagement.content}"
        
        Sentiment: {engagement.sentiment.value}
        
        Guidelines:
        - Be professional and helpful
        - Match the tone of the platform
        - Keep response concise (under 280 characters for Twitter, longer for other platforms)
        - If negative sentiment, be empathetic and try to resolve issues
        - If positive sentiment, thank them and encourage continued engagement
        - Include a subtle call-to-action when appropriate
        
        Generate only the response text, no quotes or explanations.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "Thank you for your engagement! We appreciate your feedback."

    async def get_analytics(self, platform: SocialPlatform = None, 
                          days: int = 30) -> Dict[str, Any]:
        """Get social media analytics"""
        try:
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)
            
            # Filter posts by date range and platform
            relevant_posts = [
                p for p in self.posts_store.values()
                if p.published_time and p.published_time >= start_date
                and (not platform or p.platform == platform)
            ]
            
            if not relevant_posts:
                return {
                    "success": True,
                    "data": {
                        "analytics": [],
                        "summary": {
                            "total_posts": 0,
                            "total_engagement": 0,
                            "average_engagement_rate": 0,
                            "period": f"{days} days"
                        }
                    }
                }
            
            # Calculate analytics by platform
            analytics_by_platform = {}
            platforms = [platform] if platform else list(set(p.platform for p in relevant_posts))
            
            for plt in platforms:
                platform_posts = [p for p in relevant_posts if p.platform == plt]
                
                total_likes = sum(p.engagement_stats.get('likes', 0) for p in platform_posts)
                total_comments = sum(p.engagement_stats.get('comments', 0) for p in platform_posts)
                total_shares = sum(p.engagement_stats.get('shares', 0) for p in platform_posts)
                total_clicks = sum(p.engagement_stats.get('clicks', 0) for p in platform_posts)
                total_impressions = sum(p.engagement_stats.get('impressions', 0) for p in platform_posts)
                total_reach = sum(p.engagement_stats.get('reach', 0) for p in platform_posts)
                
                total_engagement = total_likes + total_comments + total_shares
                engagement_rate = (total_engagement / total_impressions * 100) if total_impressions > 0 else 0
                
                analytics_by_platform[plt.value] = {
                    "platform": plt.value,
                    "posts_count": len(platform_posts),
                    "total_likes": total_likes,
                    "total_comments": total_comments,
                    "total_shares": total_shares,
                    "total_clicks": total_clicks,
                    "total_impressions": total_impressions,
                    "total_reach": total_reach,
                    "total_engagement": total_engagement,
                    "engagement_rate": round(engagement_rate, 2),
                    "average_likes_per_post": round(total_likes / len(platform_posts), 1) if platform_posts else 0,
                    "average_comments_per_post": round(total_comments / len(platform_posts), 1) if platform_posts else 0,
                    "period_start": start_date.isoformat(),
                    "period_end": end_date.isoformat()
                }
            
            # Overall summary
            total_posts = len(relevant_posts)
            total_engagement = sum(
                p.engagement_stats.get('likes', 0) + 
                p.engagement_stats.get('comments', 0) + 
                p.engagement_stats.get('shares', 0) 
                for p in relevant_posts
            )
            total_impressions = sum(p.engagement_stats.get('impressions', 0) for p in relevant_posts)
            avg_engagement_rate = (total_engagement / total_impressions * 100) if total_impressions > 0 else 0
            
            return {
                "success": True,
                "data": {
                    "analytics": list(analytics_by_platform.values()),
                    "summary": {
                        "total_posts": total_posts,
                        "total_engagement": total_engagement,
                        "average_engagement_rate": round(avg_engagement_rate, 2),
                        "period": f"{days} days",
                        "platforms_analyzed": len(analytics_by_platform)
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error getting analytics: {e}")
            return {"success": False, "error": str(e)}

    async def bulk_schedule_posts(self, posts_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Schedule multiple posts in bulk"""
        try:
            results = []
            
            for post_data in posts_data:
                try:
                    platform = SocialPlatform(post_data['platform'])
                    content = post_data['content']
                    scheduled_time = datetime.fromisoformat(post_data['scheduled_time'])
                    media_urls = post_data.get('media_urls', [])
                    hashtags = post_data.get('hashtags', [])
                    campaign_id = post_data.get('campaign_id')
                    
                    # Create and schedule post
                    result = await self.create_post(
                        platform=platform,
                        content=content,
                        media_urls=media_urls,
                        hashtags=hashtags,
                        scheduled_time=scheduled_time,
                        campaign_id=campaign_id
                    )
                    
                    results.append({
                        "platform": platform.value,
                        "success": result["success"],
                        "post_id": result.get("data", {}).get("post_id") if result["success"] else None,
                        "error": result.get("error") if not result["success"] else None
                    })
                    
                except Exception as e:
                    results.append({
                        "platform": post_data.get('platform', 'unknown'),
                        "success": False,
                        "post_id": None,
                        "error": str(e)
                    })
            
            successful_posts = len([r for r in results if r["success"]])
            
            return {
                "success": True,
                "data": {
                    "results": results,
                    "summary": {
                        "total_posts": len(posts_data),
                        "successful": successful_posts,
                        "failed": len(posts_data) - successful_posts
                    }
                }
            }
            
        except Exception as e:
            logger.error(f"Error bulk scheduling posts: {e}")
            return {"success": False, "error": str(e)}

# Initialize the agent instance
social_media_agent = SocialMediaAgent(
    openai_api_key="your-openai-api-key",  # This should come from environment variables
    supabase_client=None  # This should be initialized with your Supabase client
)
