
"""
Later API Connector
Handles OAuth and posting to Later
"""

import httpx
from typing import Dict, List, Any
from datetime import datetime
from .base_connector import BaseSocialConnector, PlatformType, SocialPost, PlatformProfile
import logging

logger = logging.getLogger(__name__)

class LaterConnector(BaseSocialConnector):
    """Later API integration"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        super().__init__(client_id, client_secret, redirect_uri)
        self.platform_type = PlatformType.LATER
        self.base_url = "https://api.later.com/v1"
        self.auth_url = "https://api.later.com/v1/oauth/authorize"
        self.token_url = "https://api.later.com/v1/oauth/token"
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Later OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "read write",
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for Later access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.token_url,
                    data={
                        "client_id": self.client_id,
                        "client_secret": self.client_secret,
                        "redirect_uri": self.redirect_uri,
                        "code": authorization_code,
                        "grant_type": "authorization_code"
                    }
                )
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"Later token exchange failed: {response.text}")
                    return {"error": "Token exchange failed"}
                    
        except Exception as e:
            logger.error(f"Later token exchange error: {e}")
            return {"error": str(e)}
    
    async def get_user_profiles(self, access_token: str) -> List[PlatformProfile]:
        """Get user's Later social profiles"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/social_profiles",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    profiles = []
                    
                    for profile in data.get("social_profiles", []):
                        profiles.append(PlatformProfile(
                            id=profile["id"],
                            name=profile.get("display_name", ""),
                            platform=profile["platform"],
                            username=profile.get("username", ""),
                            avatar_url=profile.get("avatar_url", ""),
                            is_active=profile.get("active", True)
                        ))
                    
                    return profiles
                else:
                    logger.error(f"Later profiles fetch failed: {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Later profiles fetch error: {e}")
            return []
    
    async def create_post(self, access_token: str, post: SocialPost) -> Dict[str, Any]:
        """Create/schedule a post on Later"""
        try:
            async with httpx.AsyncClient() as client:
                for profile_id in post.platform_profiles:
                    post_data = {
                        "text": post.content,
                        "social_profile_id": profile_id
                    }
                    
                    # Add scheduling if specified
                    if post.scheduled_time:
                        post_data["scheduled_at"] = post.scheduled_time.isoformat()
                    
                    # Add media if present
                    if post.media_urls:
                        post_data["media_url"] = post.media_urls[0]
                    
                    response = await client.post(
                        f"{self.base_url}/posts",
                        json=post_data,
                        headers={
                            "Authorization": f"Bearer {access_token}",
                            "Content-Type": "application/json"
                        }
                    )
                    
                    if response.status_code in [200, 201]:
                        result = response.json()
                        return {
                            "success": True,
                            "platform_post_id": result.get("id"),
                            "scheduled": bool(post.scheduled_time),
                            "profiles_posted": len(post.platform_profiles)
                        }
                    else:
                        logger.error(f"Later post creation failed: {response.text}")
                        return {"success": False, "error": response.text}
                        
        except Exception as e:
            logger.error(f"Later post creation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_post_analytics(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get analytics for a Later post"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/posts/{post_id}/analytics",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "views": data.get("impressions", 0),
                        "clicks": data.get("clicks", 0),
                        "likes": data.get("likes", 0),
                        "comments": data.get("comments", 0),
                        "shares": data.get("shares", 0)
                    }
                else:
                    return {}
                    
        except Exception as e:
            logger.error(f"Later analytics fetch error: {e}")
            return {}
    
    async def validate_token(self, access_token: str) -> bool:
        """Validate Later access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/user",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                return response.status_code == 200
        except:
            return False
