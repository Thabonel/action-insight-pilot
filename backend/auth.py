import jwt
import os
import requests
from typing import Dict, Any, Optional
from fastapi import Header, HTTPException
from functools import lru_cache
import logging

logger = logging.getLogger(__name__)

@lru_cache(maxsize=1)
def get_supabase_jwt_secret() -> str:
    """Get Supabase JWT secret with caching"""
    jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
    if not jwt_secret:
        # Fallback to JWT_SECRET for backwards compatibility
        jwt_secret = os.getenv("JWT_SECRET")
    
    if not jwt_secret:
        # If JWT_SECRET is not set, try to derive it from the project
        supabase_url = os.getenv("SUPABASE_URL")
        if supabase_url:
            # For development, you might need to get this from Supabase dashboard
            # For production, ensure SUPABASE_JWT_SECRET is properly set
            logger.warning("SUPABASE_JWT_SECRET not found, using fallback method")
            raise ValueError("SUPABASE_JWT_SECRET must be configured for production")
        raise ValueError("Neither SUPABASE_JWT_SECRET nor SUPABASE_URL configured")
    return jwt_secret

def verify_token(authorization: Optional[str] = Header(None)) -> str:
    """FastAPI dependency: return Authorization header or raise 401.

    Routes use this with Depends to ensure presence of an auth header.
    Use get_current_user() to decode and validate the JWT when needed.
    """
    if not authorization:
        # Raise 401 to match tests expecting auth errors, not 422
        raise HTTPException(status_code=401, detail="Authorization header required")
    return authorization

def decode_token(token: str) -> Dict[str, Any]:
    """Decode and verify JWT token and return its payload."""
    try:
        if not token:
            raise ValueError("Token is required")
        if token.startswith('Bearer '):
            token = token[7:]
        jwt_secret = get_supabase_jwt_secret()
        payload = jwt.decode(
            token,
            jwt_secret,
            algorithms=["HS256"],
            options={"verify_aud": False, "verify_iss": False},
        )
        if not payload.get("sub"):
            raise ValueError("Token missing user ID (sub)")
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token has expired")
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise ValueError("Invalid token")
    except Exception as e:
        logger.error(f"Token verification failed: {str(e)}")
        raise ValueError(f"Token verification failed: {str(e)}")

def get_current_user(token: str) -> Dict[str, Any]:
    """Get current user from JWT token"""
    try:
        payload = decode_token(token)
        
        # Extract user information from JWT payload
        user_data = {
            "id": payload.get("sub"),
            "email": payload.get("email"),
            "role": payload.get("role", "authenticated"),
            "app_metadata": payload.get("app_metadata", {}),
            "user_metadata": payload.get("user_metadata", {}),
            "aud": payload.get("aud"),
            "exp": payload.get("exp"),
            "iat": payload.get("iat")
        }
        
        return user_data
        
    except Exception as e:
        logger.error(f"Failed to get current user: {str(e)}")
        raise ValueError(f"Failed to get current user: {str(e)}")

def extract_user_id(token: str) -> str:
    """Extract user ID from JWT token"""
    try:
        payload = decode_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("User ID not found in token")
        return user_id
    except Exception as e:
        logger.error(f"Failed to extract user ID: {str(e)}")
        raise ValueError(f"Failed to extract user ID: {str(e)}")

def is_admin_user(token: str) -> bool:
    """Check if the user has admin privileges"""
    try:
        user = get_current_user(token)
        app_metadata = user.get("app_metadata", {})
        user_metadata = user.get("user_metadata", {})
        
        # Check various places where admin role might be stored
        return (
            user.get("role") == "admin" or
            app_metadata.get("role") == "admin" or
            user_metadata.get("role") == "admin" or
            "admin" in app_metadata.get("roles", [])
        )
    except Exception:
        return False

# Dependency for FastAPI routes
def get_current_user_dependency(authorization: str = None) -> Dict[str, Any]:
    """FastAPI dependency to get current user from Authorization header"""
    if not authorization:
        raise ValueError("Authorization header is required")
    
    return get_current_user(authorization)
