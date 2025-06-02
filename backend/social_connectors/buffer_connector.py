
"""
Buffer API Connector
Handles OAuth and posting to Buffer
"""

import httpx
from typing import Dict, List, Any
from datetime import datetime
from .base_connector import BaseSocialConnector, PlatformType, SocialPost, PlatformProfile
import logging

logger = logging.getLogger(__name__)

class BufferConnector(BaseSocialConnector):
    """Buffer API integration"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        super().__init__(client_id, client_secret, redirect_uri)
        self.platform_type = PlatformType.BUFFER
        self.base_url = "https://api.bufferapp.com/1"
        self.auth_url = "https://bufferapp.com/oauth2/authorize"
        self.token_url = "https://api.bufferapp.com/1/oauth2/token.json"
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Buffer OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for Buffer access token"""
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
                    logger.error(f"Buffer token exchange failed: {response.text}")
                    return {"error": "Token exchange failed"}
                    
        except Exception as e:
            logger.error(f"Buffer token exchange error: {e}")
            return {"error": str(e)}
    
    async def get_user_profiles(self, access_token: str) -> List[PlatformProfile]:
        """Get user's Buffer profiles"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/profiles.json",
                    params={"access_token": access_token}
                )
                
                if response.status_code == 200:
                    profiles_data = response.json()
                    profiles = []
                    
                    for profile in profiles_data:
                        profiles.append(PlatformProfile(
                            id=profile["id"],
                            name=profile.get("formatted_service", ""),
                            platform=profile["service"],
                            username=profile.get("formatted_username", ""),
                            avatar_url=profile.get("avatar", ""),
                            is_active=True
                        ))
                    
                    return profiles
                else:
                    logger.error(f"Buffer profiles fetch failed: {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Buffer profiles fetch error: {e}")
            return []
    
    async def create_post(self, access_token: str, post: SocialPost) -> Dict[str, Any]:
        """Create/schedule a post on Buffer"""
        try:
            async with httpx.AsyncClient() as client:
                for profile_id in post.platform_profiles:
                    post_data = {
                        "access_token": access_token,
                        "text": post.content,
                        "profile_ids[]": profile_id
                    }
                    
                    # Add media if present
                    if post.media_urls:
                        post_data["media"] = {"link": post.media_urls[0]}  # Buffer supports one media per post
                    
                    # Add scheduling if specified
                    if post.scheduled_time:
                        post_data["scheduled_at"] = post.scheduled_time.timestamp()
                    
                    endpoint = f"{self.base_url}/updates/create.json"
                    response = await client.post(endpoint, data=post_data)
                    
                    if response.status_code == 200:
                        result = response.json()
                        return {
                            "success": True,
                            "platform_post_id": result.get("id"),
                            "scheduled": bool(post.scheduled_time),
                            "profiles_posted": len(post.platform_profiles)
                        }
                    else:
                        logger.error(f"Buffer post creation failed: {response.text}")
                        return {"success": False, "error": response.text}
                        
        except Exception as e:
            logger.error(f"Buffer post creation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_post_analytics(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get analytics for a Buffer post"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/updates/{post_id}.json",
                    params={"access_token": access_token}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "views": data.get("statistics", {}).get("reach", 0),
                        "clicks": data.get("statistics", {}).get("clicks", 0),
                        "likes": data.get("statistics", {}).get("likes", 0),
                        "comments": data.get("statistics", {}).get("comments", 0),
                        "shares": data.get("statistics", {}).get("shares", 0)
                    }
                else:
                    return {}
                    
        except Exception as e:
            logger.error(f"Buffer analytics fetch error: {e}")
            return {}
    
    async def validate_token(self, access_token: str) -> bool:
        """Validate Buffer access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/user.json",
                    params={"access_token": access_token}
                )
                return response.status_code == 200
        except:
            return False
