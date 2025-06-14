
import os
import logging
from supabase import create_client, Client
from typing import Optional
import json
from cryptography.fernet import Fernet
import base64

logger = logging.getLogger(__name__)

class UserSecretsClient:
    """Client for retrieving user-specific encrypted secrets from Supabase"""
    
    def __init__(self):
        self._client: Optional[Client] = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize Supabase client for user secrets access"""
        try:
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if not supabase_url or not supabase_service_key:
                raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables")
            
            self._client = create_client(supabase_url, supabase_service_key)
            logger.info("✅ User secrets client initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize user secrets client: {e}")
            raise
    
    def _decrypt_secret(self, encrypted_value: str, iv: str) -> str:
        """Decrypt a user secret using the master key"""
        try:
            master_key = os.getenv("SECRET_MASTER_KEY")
            if not master_key or len(master_key) != 64:
                raise ValueError("Master key must be 64 hex characters (32 bytes)")
            
            # Convert hex master key to bytes
            key_bytes = bytes.fromhex(master_key)
            
            # Decode base64 encrypted data and IV
            encrypted_data = base64.b64decode(encrypted_value.encode())
            iv_data = base64.b64decode(iv.encode())
            
            # Create Fernet cipher (we'll implement AES-GCM decryption here)
            # For now, we'll use a simple approach - in production, implement proper AES-GCM
            from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
            from cryptography.hazmat.backends import default_backend
            
            cipher = Cipher(algorithms.AES(key_bytes), modes.GCM(iv_data), backend=default_backend())
            decryptor = cipher.decryptor()
            
            # Split encrypted data and tag (last 16 bytes)
            ciphertext = encrypted_data[:-16]
            tag = encrypted_data[-16:]
            
            decryptor.authenticate_additional_data(b"")
            plaintext = decryptor.finalize_with_tag(tag) + decryptor.finalize()
            
            return plaintext.decode('utf-8')
            
        except Exception as e:
            logger.error(f"Failed to decrypt secret: {e}")
            raise
    
    async def get_user_secret(self, user_id: str, service_name: str) -> Optional[str]:
        """Retrieve and decrypt a user's secret for a specific service"""
        try:
            if not self._client:
                self._initialize_client()
            
            # Query user_secrets table
            result = self._client.table('user_secrets')\
                .select('encrypted_value, initialization_vector')\
                .eq('user_id', user_id)\
                .eq('service_name', service_name)\
                .eq('is_active', True)\
                .execute()
            
            if not result.data:
                logger.warning(f"No secret found for user {user_id} and service {service_name}")
                return None
            
            secret_data = result.data[0]
            encrypted_value = secret_data['encrypted_value']
            iv = secret_data['initialization_vector']
            
            # Update last_used_at
            self._client.table('user_secrets')\
                .update({'last_used_at': 'now()'})\
                .eq('user_id', user_id)\
                .eq('service_name', service_name)\
                .execute()
            
            # Decrypt and return the secret
            decrypted_value = self._decrypt_secret(encrypted_value, iv)
            logger.info(f"✅ Successfully retrieved secret for user {user_id}, service {service_name}")
            
            return decrypted_value
            
        except Exception as e:
            logger.error(f"❌ Failed to get user secret: {e}")
            return None
    
    async def has_user_secret(self, user_id: str, service_name: str) -> bool:
        """Check if user has a specific secret configured"""
        try:
            if not self._client:
                self._initialize_client()
            
            result = self._client.table('user_secrets')\
                .select('id')\
                .eq('user_id', user_id)\
                .eq('service_name', service_name)\
                .eq('is_active', True)\
                .execute()
            
            return len(result.data) > 0
            
        except Exception as e:
            logger.error(f"❌ Failed to check user secret: {e}")
            return False

# Global instance
user_secrets_client = UserSecretsClient()

def get_user_secrets() -> UserSecretsClient:
    """Get user secrets client instance"""
    return user_secrets_client
