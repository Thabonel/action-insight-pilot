
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)

class ExtendedPlatform(str, Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    PINTEREST = "pinterest"
    THREADS = "threads"
    SNAPCHAT = "snapchat"

class PlatformExtensionsService:
    """Service for supporting additional social media platforms"""
    
    def __init__(self):
        self.logger = logger
        self.platform_configs = self._initialize_platform_configs()
    
    def _initialize_platform_configs(self) -> Dict[str, Dict[str, Any]]:
        """Initialize configuration for all supported platforms"""
        return {
            ExtendedPlatform.TIKTOK: {
                "max_caption_length": 2200,
                "video_formats": ["mp4"],
                "max_duration": 600,  # 10 minutes
                "recommended_hashtags": 3-5,
                "best_posting_times": ["18:00", "19:00", "20:00"],
                "content_guidelines": "Trending audio, vertical video, authentic content",
                "api_endpoint": "https://open-api.tiktok.com/",
                "required_scopes": ["user.info.basic", "video.publish"]
            },
            ExtendedPlatform.PINTEREST: {
                "max_caption_length": 500,
                "image_formats": ["jpg", "png", "gif"],
                "min_image_size": "600x900",
                "recommended_hashtags": 10-20,
                "best_posting_times": ["20:00", "21:00", "22:00"],
                "content_guidelines": "High-quality images, vertical format, keyword-rich descriptions",
                "api_endpoint": "https://api.pinterest.com/",
                "required_scopes": ["boards:read", "pins:write"]
            },
            ExtendedPlatform.THREADS: {
                "max_caption_length": 500,
                "image_formats": ["jpg", "png"],
                "max_images": 10,
                "recommended_hashtags": 3-5,
                "best_posting_times": ["12:00", "15:00", "17:00"],
                "content_guidelines": "Conversational tone, community-focused, real-time discussions",
                "api_endpoint": "https://graph.threads.net/",
                "required_scopes": ["threads_basic", "threads_content_publish"]
            },
            ExtendedPlatform.SNAPCHAT: {
                "max_caption_length": 250,
                "video_formats": ["mp4"],
                "max_duration": 60,
                "recommended_hashtags": 0-3,
                "best_posting_times": ["19:00", "20:00", "21:00"],
                "content_guidelines": "Authentic, ephemeral, AR filters encouraged",
                "api_endpoint": "https://adsapi.snapchat.com/",
                "required_scopes": ["snapchat-marketing-api"]
            }
        }
    
    async def optimize_content_for_platform(self, content: str, platform: ExtendedPlatform, 
                                          media_type: str = "text") -> Dict[str, Any]:
        """Optimize content for specific platform requirements"""
        try:
            config = self.platform_configs.get(platform)
            if not config:
                return {"error": f"Platform {platform} not supported"}
            
            optimized_content = {
                "original_content": content,
                "platform": platform.value,
                "optimizations_applied": []
            }
            
            # Truncate content if needed
            max_length = config["max_caption_length"]
            if len(content) > max_length:
                optimized_content["content"] = content[:max_length-3] + "..."
                optimized_content["optimizations_applied"].append("content_truncated")
            else:
                optimized_content["content"] = content
            
            # Add platform-specific enhancements
            if platform == ExtendedPlatform.TIKTOK:
                optimized_content["suggestions"] = {
                    "trending_audio": "Consider adding trending audio",
                    "hashtags": ["#fyp", "#viral", "#trending"],
                    "video_style": "Vertical format (9:16), eye-catching first 3 seconds"
                }
            
            elif platform == ExtendedPlatform.PINTEREST:
                optimized_content["suggestions"] = {
                    "image_requirements": "Vertical image (2:3 ratio), text overlay recommended",
                    "seo_keywords": "Include relevant keywords for search",
                    "board_selection": "Choose appropriate board category"
                }
            
            elif platform == ExtendedPlatform.THREADS:
                optimized_content["suggestions"] = {
                    "engagement_style": "Ask questions to encourage discussion",
                    "timing": "Post during active conversation hours",
                    "community_focus": "Reference trending topics in your niche"
                }
            
            elif platform == ExtendedPlatform.SNAPCHAT:
                optimized_content["suggestions"] = {
                    "ar_filters": "Consider using branded AR filters",
                    "story_format": "Design for vertical viewing",
                    "authenticity": "Keep content casual and authentic"
                }
            
            return optimized_content
            
        except Exception as e:
            self.logger.error(f"Error optimizing content for {platform}: {str(e)}")
            return {"error": str(e)}
    
    async def generate_platform_specific_hashtags(self, content: str, platform: ExtendedPlatform) -> List[str]:
        """Generate hashtags optimized for specific platform"""
        base_hashtags = []
        
        # Extract keywords from content
        keywords = content.lower().split()
        common_words = {"the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by"}
        filtered_keywords = [word for word in keywords if word not in common_words and len(word) > 3]
        
        # Platform-specific hashtag strategies
        if platform == ExtendedPlatform.TIKTOK:
            base_hashtags = ["#fyp", "#viral", "#trending"]
            base_hashtags.extend([f"#{word}" for word in filtered_keywords[:3]])
            
        elif platform == ExtendedPlatform.PINTEREST:
            # Pinterest loves specific, searchable hashtags
            base_hashtags.extend([f"#{word}" for word in filtered_keywords[:15]])
            base_hashtags.extend(["#inspiration", "#ideas", "#diy", "#home", "#style"])
            
        elif platform == ExtendedPlatform.THREADS:
            # Threads prefers fewer, more conversation-focused hashtags
            base_hashtags.extend([f"#{word}" for word in filtered_keywords[:3]])
            
        elif platform == ExtendedPlatform.SNAPCHAT:
            # Snapchat uses minimal hashtags
            base_hashtags.extend([f"#{word}" for word in filtered_keywords[:2]])
        
        return base_hashtags[:self.platform_configs[platform].get("recommended_hashtags", 5)]
    
    def get_platform_posting_schedule(self, platform: ExtendedPlatform, timezone: str = "UTC") -> Dict[str, Any]:
        """Get optimal posting schedule for platform"""
        config = self.platform_configs.get(platform, {})
        
        return {
            "platform": platform.value,
            "best_times": config.get("best_posting_times", ["12:00", "18:00"]),
            "timezone": timezone,
            "frequency_recommendation": self._get_posting_frequency(platform),
            "content_guidelines": config.get("content_guidelines", "")
        }
    
    def _get_posting_frequency(self, platform: ExtendedPlatform) -> str:
        """Get recommended posting frequency for platform"""
        frequency_map = {
            ExtendedPlatform.TIKTOK: "1-3 times daily",
            ExtendedPlatform.PINTEREST: "3-5 pins daily",
            ExtendedPlatform.THREADS: "2-4 times daily",
            ExtendedPlatform.SNAPCHAT: "1-2 stories daily",
            ExtendedPlatform.INSTAGRAM: "1 post daily",
            ExtendedPlatform.FACEBOOK: "1 post daily",
            ExtendedPlatform.TWITTER: "3-5 tweets daily",
            ExtendedPlatform.LINKEDIN: "1 post daily",
            ExtendedPlatform.YOUTUBE: "1-2 videos weekly"
        }
        
        return frequency_map.get(platform, "1 post daily")
    
    async def validate_platform_content(self, content: str, media_urls: List[str], 
                                      platform: ExtendedPlatform) -> Dict[str, Any]:
        """Validate content meets platform requirements"""
        config = self.platform_configs.get(platform, {})
        validation_results = {
            "valid": True,
            "warnings": [],
            "errors": [],
            "suggestions": []
        }
        
        # Check content length
        max_length = config.get("max_caption_length", 1000)
        if len(content) > max_length:
            validation_results["errors"].append(f"Content exceeds {max_length} character limit")
            validation_results["valid"] = False
        
        # Check media requirements
        if media_urls:
            for url in media_urls:
                if not self._validate_media_format(url, platform):
                    validation_results["warnings"].append(f"Media format may not be optimal for {platform.value}")
        
        # Platform-specific validations
        if platform == ExtendedPlatform.TIKTOK and not media_urls:
            validation_results["suggestions"].append("TikTok performs better with video content")
        
        if platform == ExtendedPlatform.PINTEREST and not media_urls:
            validation_results["errors"].append("Pinterest requires at least one image")
            validation_results["valid"] = False
        
        return validation_results
    
    def _validate_media_format(self, media_url: str, platform: ExtendedPlatform) -> bool:
        """Validate media format for platform"""
        config = self.platform_configs.get(platform, {})
        
        # Extract file extension from URL
        extension = media_url.split('.')[-1].lower()
        
        supported_formats = config.get("image_formats", []) + config.get("video_formats", [])
        return extension in supported_formats
