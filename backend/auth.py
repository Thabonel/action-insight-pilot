
# ... keep existing code

import jwt
import os
from typing import Dict, Any

def verify_token(token: str) -> Dict[str, Any]:
    """Verify JWT token from Supabase and extract user data"""
    try:
        # Get Supabase JWT secret
        jwt_secret = os.getenv("SUPABASE_JWT_SECRET")
        if not jwt_secret:
            raise ValueError("SUPABASE_JWT_SECRET not configured")
        
        # Decode and verify the token
        payload = jwt.decode(token, jwt_secret, algorithms=["HS256"])
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")
    except Exception as e:
        raise ValueError(f"Token verification failed: {str(e)}")

# ... keep existing code
