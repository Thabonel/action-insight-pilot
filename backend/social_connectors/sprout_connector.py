
"""
Sprout Social API Connector
Handles OAuth and posting to Sprout Social
"""

import httpx
from typing import Dict, List, Any
from datetime import datetime
from .base_connector import BaseSocialConnector, PlatformType, SocialPost, PlatformProfile
import logging

logger = logging.getLogger(__name__)

class SproutConnector(BaseSocialConnector):
    """Sprout Social API integration"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        super().__init__(client_id, client_secret, redirect_uri)
        self.platform_type = PlatformType.SPROUT_SOCIAL
        self.base_url = "https://api.sproutsocial.com/v1"
        self.auth_url = "https://sproutsocial.com/oauth/authorize"
        self.token_url = "https://api.sproutsocial.com/oauth/token"
    
    def get_authorization_url(self, state: str) -> str:
        """Generate Sprout Social OAuth authorization URL"""
        params = {
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "response_type": "code",
            "scope": "write",
            "state": state
        }
        
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{self.auth_url}?{query_string}"
    
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for Sprout Social access token"""
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
                    logger.error(f"Sprout token exchange failed: {response.text}")
                    return {"error": "Token exchange failed"}
                    
        except Exception as e:
            logger.error(f"Sprout token exchange error: {e}")
            return {"error": str(e)}
    
    async def get_user_profiles(self, access_token: str) -> List[PlatformProfile]:
        """Get user's Sprout Social profiles"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/customer/profiles",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                
                if response.status_code == 200:
                    data = response.json()
                    profiles = []
                    
                    for profile in data.get("profiles", []):
                        profiles.append(PlatformProfile(
                            id=str(profile["id"]),
                            name=profile.get("name", ""),
                            platform=profile["network"],
                            username=profile.get("username", ""),
                            avatar_url=profile.get("image_url", ""),
                            is_active=True
                        ))
                    
                    return profiles
                else:
                    logger.error(f"Sprout profiles fetch failed: {response.text}")
                    return []
                    
        except Exception as e:
            logger.error(f"Sprout profiles fetch error: {e}")
            return []
    
    async def create_post(self, access_token: str, post: SocialPost) -> Dict[str, Any]:
        """Create/schedule a post on Sprout Social"""
        try:
            async with httpx.AsyncClient() as client:
                post_data = {
                    "content": post.content,
                    "profile_ids": [int(pid) for pid in post.platform_profiles]
                }
                
                # Add scheduling if specified
                if post.scheduled_time:
                    post_data["send_time"] = post.scheduled_time.isoformat()
                
                response = await client.post(
                    f"{self.base_url}/messages",
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
                        "platform_post_id": str(result.get("id")),
                        "scheduled": bool(post.scheduled_time),
                        "profiles_posted": len(post.platform_profiles)
                    }
                else:
                    logger.error(f"Sprout post creation failed: {response.text}")
                    return {"success": False, "error": response.text}
                    
        except Exception as e:
            logger.error(f"Sprout post creation error: {e}")
            return {"success": False, "error": str(e)}
    
    async def get_post_analytics(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get analytics for a Sprout Social post"""
        # Sprout Social analytics are available through their reporting API
        # This would require additional implementation
        return {}
    
    async def validate_token(self, access_token: str) -> bool:
        """Validate Sprout Social access token"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{self.base_url}/customer",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                return response.status_code == 200
        except:
            return False
