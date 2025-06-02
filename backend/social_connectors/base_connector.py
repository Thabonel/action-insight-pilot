
"""
Base Social Media Connector
Abstract base class for all social media platform integrations
"""

from abc import ABC, abstractmethod
from typing import Dict, List, Optional, Any
from datetime import datetime
from dataclasses import dataclass
from enum import Enum

class PlatformType(str, Enum):
    BUFFER = "buffer"
    HOOTSUITE = "hootsuite"
    LATER = "later"
    SPROUT_SOCIAL = "sprout_social"

class PostStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    FAILED = "failed"

@dataclass
class SocialPost:
    id: Optional[str]
    content: str
    platform_profiles: List[str]  # Which social accounts to post to
    scheduled_time: Optional[datetime]
    media_urls: List[str]
    status: PostStatus
    platform_post_id: Optional[str] = None
    created_at: Optional[datetime] = None
    published_at: Optional[datetime] = None

@dataclass
class PlatformProfile:
    id: str
    name: str
    platform: str  # twitter, facebook, instagram, etc.
    username: str
    avatar_url: Optional[str] = None
    is_active: bool = True

@dataclass
class ConnectionStatus:
    platform: PlatformType
    is_connected: bool
    user_id: str
    profiles: List[PlatformProfile]
    last_sync: Optional[datetime] = None
    access_token_expires: Optional[datetime] = None

class BaseSocialConnector(ABC):
    """Base class for all social media platform connectors"""
    
    def __init__(self, client_id: str, client_secret: str, redirect_uri: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.redirect_uri = redirect_uri
        self.platform_type = None  # Override in subclasses
    
    @abstractmethod
    def get_authorization_url(self, state: str) -> str:
        """Generate OAuth authorization URL"""
        pass
    
    @abstractmethod
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token"""
        pass
    
    @abstractmethod
    async def get_user_profiles(self, access_token: str) -> List[PlatformProfile]:
        """Get user's social media profiles/accounts"""
        pass
    
    @abstractmethod
    async def create_post(self, access_token: str, post: SocialPost) -> Dict[str, Any]:
        """Create/schedule a post on the platform"""
        pass
    
    @abstractmethod
    async def get_post_analytics(self, access_token: str, post_id: str) -> Dict[str, Any]:
        """Get analytics for a specific post"""
        pass
    
    @abstractmethod
    async def validate_token(self, access_token: str) -> bool:
        """Validate if access token is still valid"""
        pass
    
    def format_content_for_platform(self, content: str, platform: str) -> str:
        """Format content based on platform-specific requirements"""
        # Base implementation - override in platform-specific connectors
        return content
