
import asyncio
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import httpx
import json

logger = logging.getLogger(__name__)

class TrendMonitoringService:
    """Service for monitoring trending topics and suggesting relevant content"""
    
    def __init__(self, twitter_bearer_token: str = None, google_trends_api_key: str = None):
        self.twitter_bearer_token = twitter_bearer_token
        self.google_trends_api_key = google_trends_api_key
        self.logger = logger
        self.trending_cache = {}
        self.trend_callbacks = []
    
    async def get_trending_topics(self, platform: str = "twitter", location: str = "worldwide") -> Dict[str, Any]:
        """Get trending topics from various platforms"""
        try:
            if platform == "twitter":
                return await self._get_twitter_trends(location)
            elif platform == "google":
                return await self._get_google_trends(location)
            elif platform == "tiktok":
                return await self._get_tiktok_trends()
            else:
                return {"error": f"Platform {platform} not supported for trend monitoring"}
                
        except Exception as e:
            self.logger.error(f"Error getting trending topics: {str(e)}")
            return {"error": str(e)}
    
    async def _get_twitter_trends(self, location: str) -> Dict[str, Any]:
        """Get trending topics from Twitter"""
        try:
            # Map location to Twitter WOEID (simplified mapping)
            woeid_map = {
                "worldwide": 1,
                "united_states": 23424977,
                "united_kingdom": 23424975,
                "canada": 23424775,
                "australia": 23424748
            }
            
            woeid = woeid_map.get(location.lower(), 1)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"https://api.twitter.com/1.1/trends/place.json?id={woeid}",
                    headers={
                        "Authorization": f"Bearer {self.twitter_bearer_token}"
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    trends = data[0]["trends"] if data else []
                    
                    processed_trends = []
                    for trend in trends[:20]:  # Top 20 trends
                        processed_trends.append({
                            "keyword": trend["name"],
                            "url": trend.get("url", ""),
                            "tweet_volume": trend.get("tweet_volume", 0),
                            "source": "twitter",
                            "category": self._categorize_trend(trend["name"]),
                            "timestamp": datetime.now().isoformat()
                        })
                    
                    return {
                        "success": True,
                        "trends": processed_trends,
                        "location": location,
                        "source": "twitter"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Twitter API error: {response.status_code}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Error fetching Twitter trends: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_google_trends(self, location: str) -> Dict[str, Any]:
        """Get trending topics from Google Trends"""
        try:
            # Mock implementation - Google Trends doesn't have a direct API
            # In production, you'd use services like SerpAPI or Pytrends
            
            mock_trends = [
                {"keyword": "AI technology", "interest": 100, "category": "technology"},
                {"keyword": "sustainable fashion", "interest": 85, "category": "lifestyle"},
                {"keyword": "remote work", "interest": 70, "category": "business"},
                {"keyword": "electric vehicles", "interest": 90, "category": "automotive"},
                {"keyword": "mental health", "interest": 75, "category": "health"}
            ]
            
            processed_trends = []
            for trend in mock_trends:
                processed_trends.append({
                    "keyword": trend["keyword"],
                    "interest_score": trend["interest"],
                    "source": "google",
                    "category": trend["category"],
                    "timestamp": datetime.now().isoformat()
                })
            
            return {
                "success": True,
                "trends": processed_trends,
                "location": location,
                "source": "google"
            }
            
        except Exception as e:
            self.logger.error(f"Error fetching Google trends: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _get_tiktok_trends(self) -> Dict[str, Any]:
        """Get trending topics from TikTok"""
        try:
            # Mock implementation - TikTok's trending API is limited
            mock_trends = [
                {"keyword": "#fyp", "views": "10M+", "category": "general"},
                {"keyword": "#viral", "views": "8M+", "category": "general"},
                {"keyword": "#dance", "views": "5M+", "category": "entertainment"},
                {"keyword": "#cooking", "views": "4M+", "category": "lifestyle"},
                {"keyword": "#tech", "views": "3M+", "category": "technology"}
            ]
            
            processed_trends = []
            for trend in mock_trends:
                processed_trends.append({
                    "keyword": trend["keyword"],
                    "estimated_views": trend["views"],
                    "source": "tiktok",
                    "category": trend["category"],
                    "timestamp": datetime.now().isoformat()
                })
            
            return {
                "success": True,
                "trends": processed_trends,
                "source": "tiktok"
            }
            
        except Exception as e:
            self.logger.error(f"Error fetching TikTok trends: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _categorize_trend(self, trend_text: str) -> str:
        """Categorize trends based on keywords"""
        trend_lower = trend_text.lower()
        
        categories = {
            "technology": ["ai", "tech", "software", "app", "digital", "cyber", "robot", "automation"],
            "entertainment": ["movie", "tv", "music", "celebrity", "award", "show", "concert"],
            "sports": ["football", "basketball", "soccer", "baseball", "olympics", "championship"],
            "politics": ["election", "vote", "president", "minister", "policy", "government"],
            "business": ["stock", "market", "economy", "company", "startup", "investment"],
            "health": ["covid", "vaccine", "wellness", "fitness", "medical", "health"],
            "lifestyle": ["fashion", "food", "travel", "home", "beauty", "style"]
        }
        
        for category, keywords in categories.items():
            if any(keyword in trend_lower for keyword in keywords):
                return category
        
        return "general"
    
    async def suggest_content_from_trends(self, trends: List[Dict[str, Any]], 
                                        brand_keywords: List[str], 
                                        target_audience: str) -> Dict[str, Any]:
        """Suggest content ideas based on trending topics and brand relevance"""
        try:
            relevant_trends = []
            content_suggestions = []
            
            # Filter trends relevant to brand
            for trend in trends:
                trend_keyword = trend["keyword"].lower()
                category = trend.get("category", "general")
                
                # Check if trend is relevant to brand keywords
                relevance_score = 0
                for brand_keyword in brand_keywords:
                    if brand_keyword.lower() in trend_keyword:
                        relevance_score += 10
                
                # Boost score for certain categories
                if category in ["technology", "business"]:
                    relevance_score += 5
                
                if relevance_score > 0:
                    trend["relevance_score"] = relevance_score
                    relevant_trends.append(trend)
            
            # Sort by relevance
            relevant_trends.sort(key=lambda x: x["relevance_score"], reverse=True)
            
            # Generate content suggestions
            for trend in relevant_trends[:5]:  # Top 5 relevant trends
                suggestions = await self._generate_content_ideas(trend, target_audience)
                content_suggestions.extend(suggestions)
            
            return {
                "success": True,
                "relevant_trends": relevant_trends,
                "content_suggestions": content_suggestions[:10],  # Top 10 suggestions
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error suggesting content from trends: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_content_ideas(self, trend: Dict[str, Any], target_audience: str) -> List[Dict[str, Any]]:
        """Generate specific content ideas based on a trend"""
        trend_keyword = trend["keyword"]
        category = trend.get("category", "general")
        
        content_ideas = []
        
        # Generate different types of content
        content_types = [
            {
                "type": "educational",
                "template": f"How {trend_keyword} impacts {target_audience}",
                "format": "carousel post"
            },
            {
                "type": "opinion",
                "template": f"Our take on {trend_keyword}",
                "format": "text post"
            },
            {
                "type": "behind_scenes",
                "template": f"How we're incorporating {trend_keyword} into our work",
                "format": "video post"
            },
            {
                "type": "user_generated",
                "template": f"Share your {trend_keyword} story with us",
                "format": "user participation post"
            }
        ]
        
        for content_type in content_types:
            content_ideas.append({
                "trend_keyword": trend_keyword,
                "content_type": content_type["type"],
                "suggested_content": content_type["template"],
                "recommended_format": content_type["format"],
                "category": category,
                "urgency": self._calculate_urgency(trend),
                "estimated_engagement": self._estimate_engagement(trend, content_type["type"])
            })
        
        return content_ideas
    
    def _calculate_urgency(self, trend: Dict[str, Any]) -> str:
        """Calculate how urgent it is to create content for this trend"""
        source = trend.get("source", "")
        
        if source == "twitter":
            tweet_volume = trend.get("tweet_volume", 0)
            if tweet_volume and tweet_volume > 100000:
                return "high"
            elif tweet_volume and tweet_volume > 10000:
                return "medium"
        
        elif source == "google":
            interest_score = trend.get("interest_score", 0)
            if interest_score > 80:
                return "high"
            elif interest_score > 50:
                return "medium"
        
        return "low"
    
    def _estimate_engagement(self, trend: Dict[str, Any], content_type: str) -> str:
        """Estimate potential engagement for content based on trend and type"""
        base_score = trend.get("relevance_score", 0)
        
        # Adjust based on content type
        type_multipliers = {
            "educational": 1.2,
            "behind_scenes": 1.1,
            "user_generated": 1.3,
            "opinion": 1.0
        }
        
        multiplier = type_multipliers.get(content_type, 1.0)
        estimated_score = base_score * multiplier
        
        if estimated_score > 15:
            return "high"
        elif estimated_score > 8:
            return "medium"
        else:
            return "low"
    
    async def monitor_brand_mentions(self, brand_keywords: List[str], platforms: List[str] = None) -> Dict[str, Any]:
        """Monitor brand mentions across platforms"""
        if platforms is None:
            platforms = ["twitter"]
        
        mentions = []
        
        for platform in platforms:
            if platform == "twitter" and self.twitter_bearer_token:
                platform_mentions = await self._monitor_twitter_mentions(brand_keywords)
                mentions.extend(platform_mentions)
        
        return {
            "success": True,
            "mentions": mentions,
            "monitored_keywords": brand_keywords,
            "platforms": platforms,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _monitor_twitter_mentions(self, keywords: List[str]) -> List[Dict[str, Any]]:
        """Monitor Twitter mentions for specific keywords"""
        try:
            mentions = []
            
            for keyword in keywords:
                # Mock implementation - would use Twitter API v2 search
                mock_mentions = [
                    {
                        "text": f"Great experience with {keyword}!",
                        "author": "user123",
                        "timestamp": datetime.now().isoformat(),
                        "engagement": {"likes": 5, "retweets": 2},
                        "sentiment": "positive"
                    }
                ]
                mentions.extend(mock_mentions)
            
            return mentions
            
        except Exception as e:
            self.logger.error(f"Error monitoring Twitter mentions: {str(e)}")
            return []
    
    async def start_trend_monitoring(self, interval_minutes: int = 60) -> None:
        """Start continuous trend monitoring"""
        while True:
            try:
                # Get trends from multiple sources
                twitter_trends = await self.get_trending_topics("twitter")
                google_trends = await self.get_trending_topics("google")
                
                # Cache trends
                self.trending_cache["twitter"] = twitter_trends
                self.trending_cache["google"] = google_trends
                self.trending_cache["last_updated"] = datetime.now()
                
                # Notify callbacks
                for callback in self.trend_callbacks:
                    await callback(self.trending_cache)
                
                await asyncio.sleep(interval_minutes * 60)
                
            except Exception as e:
                self.logger.error(f"Error in trend monitoring loop: {str(e)}")
                await asyncio.sleep(300)  # Wait 5 minutes on error
    
    def register_trend_callback(self, callback) -> None:
        """Register callback for trend updates"""
        self.trend_callbacks.append(callback)
