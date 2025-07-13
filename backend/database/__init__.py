# Database package
from .supabase_client import get_supabase, supabase_client


async def get_supabase_client():
    """Async wrapper to return the Supabase client."""
    return get_supabase()

__all__ = ['get_supabase', 'supabase_client', 'get_supabase_client']
