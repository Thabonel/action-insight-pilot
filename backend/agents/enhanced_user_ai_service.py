
import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from ..database.supabase_client import get_supabase
from ..database.user_secrets_client import UserSecretsClient

logger = logging.getLogger(__name__)

class EnhancedUserAIService:
    """Enhanced AI service with knowledge base integration"""
    
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.secrets_client = UserSecretsClient()
    
    async def has_api_key(self) -> bool:
        """Check if user has OpenAI API key configured"""
        try:
            api_key = await self.secrets_client.get_secret(self.user_id, 'openai_api_key')
            return api_key is not None and len(api_key.strip()) > 0
        except Exception as e:
            logger.error(f"Error checking API key for user {self.user_id}: {e}")
            return False
    
    async def search_knowledge_base(
        self, 
        query: str, 
        bucket_type: Optional[str] = None,
        campaign_id: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search user's knowledge base for relevant information"""
        try:
            supabase = get_supabase()
            
            # Get OpenAI API key for embedding generation
            api_key = await self.secrets_client.get_secret(self.user_id, 'openai_api_key')
            if not api_key:
                return []
            
            # Generate embedding for the query
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    'https://api.openai.com/v1/embeddings',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'input': query,
                        'model': 'text-embedding-ada-002'
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"OpenAI API error: {response.text}")
                    return []
                
                embedding_data = response.json()
                query_embedding = embedding_data['data'][0]['embedding']
            
            # Search knowledge chunks using the database function
            result = supabase.rpc('search_knowledge_chunks', {
                'p_user_id': self.user_id,
                'p_query_embedding': query_embedding,
                'p_bucket_type': bucket_type,
                'p_campaign_id': campaign_id,
                'p_limit': limit,
                'p_similarity_threshold': 0.7
            }).execute()
            
            if result.data:
                logger.info(f"Found {len(result.data)} relevant knowledge chunks for query: {query}")
                return result.data
            
            return []
            
        except Exception as e:
            logger.error(f"Knowledge search error for user {self.user_id}: {e}")
            return []
    
    async def generate_daily_focus_with_knowledge(
        self,
        query: str,
        campaigns: List[Dict[str, Any]],
        context: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate daily focus recommendations enhanced with knowledge base"""
        try:
            # Search knowledge base for relevant information
            knowledge_chunks = await self.search_knowledge_base(
                query=f"daily focus marketing strategy {query}",
                limit=3
            )
            
            # Get OpenAI API key
            api_key = await self.secrets_client.get_secret(self.user_id, 'openai_api_key')
            if not api_key:
                return {
                    'success': False,
                    'error': 'OpenAI API key not configured'
                }
            
            # Build enhanced prompt with knowledge context
            knowledge_context = ""
            if knowledge_chunks:
                knowledge_context = "\n\nRelevant Knowledge from your knowledge base:\n"
                for i, chunk in enumerate(knowledge_chunks, 1):
                    knowledge_context += f"{i}. From '{chunk['document_title']}' in {chunk['bucket_name']}:\n{chunk['chunk_content']}\n\n"
            
            system_prompt = f"""You are a marketing AI assistant with access to the user's specific knowledge base. 
            Provide personalized daily focus recommendations based on their campaigns and knowledge.
            
            User's Marketing Data:
            - Active Campaigns: {len([c for c in campaigns if c.get('status') == 'active'])}
            - Total Campaigns: {len(campaigns)}
            
            {knowledge_context}
            
            Provide actionable, specific recommendations that incorporate both the campaign data and the relevant knowledge from their knowledge base."""
            
            user_prompt = f"""
            Query: {query}
            
            Campaign Data: {json.dumps(campaigns[:5], indent=2)}
            
            Context: {json.dumps(context or [], indent=2)}
            
            Please provide daily focus recommendations that are:
            1. Specific to my campaigns and situation
            2. Informed by the knowledge in my knowledge base
            3. Actionable and prioritized
            4. Include specific next steps
            """
            
            # Call OpenAI API
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'gpt-4',
                        'messages': [
                            {'role': 'system', 'content': system_prompt},
                            {'role': 'user', 'content': user_prompt}
                        ],
                        'temperature': 0.7,
                        'max_tokens': 1500
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"OpenAI API error: {response.text}")
                    return {
                        'success': False,
                        'error': f'OpenAI API error: {response.status_code}'
                    }
                
                ai_response = response.json()
                
                return {
                    'success': True,
                    'title': 'Your AI-Enhanced Daily Focus',
                    'response': ai_response['choices'][0]['message']['content'],
                    'knowledge_sources': len(knowledge_chunks),
                    'campaigns_analyzed': len(campaigns),
                    'timestamp': asyncio.get_event_loop().time()
                }
                
        except Exception as e:
            logger.error(f"Enhanced daily focus generation failed for user {self.user_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    async def process_general_query_with_knowledge(
        self,
        query: str,
        campaigns: List[Dict[str, Any]],
        context: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Process general queries enhanced with knowledge base search"""
        try:
            # Search knowledge base for relevant information
            knowledge_chunks = await self.search_knowledge_base(
                query=query,
                limit=5
            )
            
            # Get OpenAI API key
            api_key = await self.secrets_client.get_secret(self.user_id, 'openai_api_key')
            if not api_key:
                return {
                    'success': False,
                    'error': 'OpenAI API key not configured'
                }
            
            # Build enhanced prompt
            knowledge_context = ""
            if knowledge_chunks:
                knowledge_context = "\n\nRelevant information from your knowledge base:\n"
                for i, chunk in enumerate(knowledge_chunks, 1):
                    knowledge_context += f"{i}. From '{chunk['document_title']}' ({chunk['bucket_name']}):\n{chunk['chunk_content']}\n\n"
            
            system_prompt = f"""You are a knowledgeable marketing AI assistant with access to the user's personal knowledge base and campaign data. 
            Provide helpful, accurate responses that incorporate both their specific knowledge and general marketing expertise.
            
            {knowledge_context}
            
            Always reference relevant information from their knowledge base when applicable."""
            
            user_prompt = f"""
            Question: {query}
            
            My Campaign Context: {json.dumps(campaigns[:3], indent=2) if campaigns else 'No active campaigns'}
            
            Additional Context: {json.dumps(context or [], indent=2)}
            
            Please provide a comprehensive answer that incorporates:
            1. Information from my knowledge base (if relevant)
            2. My current campaign context
            3. General marketing best practices
            4. Specific actionable recommendations
            """
            
            # Call OpenAI API
            import httpx
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'gpt-4',
                        'messages': [
                            {'role': 'system', 'content': system_prompt},
                            {'role': 'user', 'content': user_prompt}
                        ],
                        'temperature': 0.7,
                        'max_tokens': 2000
                    }
                )
                
                if response.status_code != 200:
                    logger.error(f"OpenAI API error: {response.text}")
                    return {
                        'success': False,
                        'error': f'OpenAI API error: {response.status_code}'
                    }
                
                ai_response = response.json()
                
                return {
                    'success': True,
                    'title': 'AI Assistant Response',
                    'response': ai_response['choices'][0]['message']['content'],
                    'knowledge_sources': len(knowledge_chunks),
                    'campaigns_analyzed': len(campaigns),
                    'timestamp': asyncio.get_event_loop().time()
                }
                
        except Exception as e:
            logger.error(f"Enhanced query processing failed for user {self.user_id}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
