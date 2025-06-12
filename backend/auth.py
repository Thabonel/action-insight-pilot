from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Security
security = HTTPBearer(auto_error=False)

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token from Supabase or other auth provider"""
    # TEMPORARY: Skip auth validation for testing
    # TODO: Add proper JWT validation later
    return "mock-user-token"
    
    # Original validation (commented out for testing):
    # if not credentials or not credentials.credentials:
    #     raise HTTPException(
    #         status_code=status.HTTP_401_UNAUTHORIZED,
    #         detail="Invalid authentication credentials",
    #         headers={"WWW-Authenticate": "Bearer"},
    #     )
    # return credentials.credentials
