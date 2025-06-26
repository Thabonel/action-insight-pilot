import os
from supabase import create_client, Client
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class SupabaseClient:
    _instance: Optional['SupabaseClient'] = None
    _client: Optional[Client] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client with environment variables"""
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_KEY") 
            
            if not supabase_url or not supabase_key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY environment variables")
            
            self._client = create_client(supabase_url, supabase_key)
            logger.info("✅ Supabase client initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Supabase client: {e}")
            raise
    
    @property
    def client(self) -> Client:
        """Get the Supabase client instance"""
        if self._client is None:
            self._initialize_client()
        return self._client
    
    def test_connection(self):
        """Test the database connection"""
        try:
            result = self.client.table('active_campaigns').select('count', count='exact').execute()
            logger.info(f"✅ Database connection test successful. Campaigns count: {result.count}")
            return True
        except Exception as e:
            logger.error(f"❌ Database connection test failed: {e}")
            return False

# Global instance
supabase_client = SupabaseClient()

def get_supabase() -> Client:
    """Get Supabase client instance"""
    return supabase_client.client
