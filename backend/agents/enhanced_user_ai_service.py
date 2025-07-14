
import asyncio
import json
import logging
from typing import Dict, Any, Optional, List
from database.supabase_client import get_supabase
from database.user_secrets_client import UserSecretsClient

logger = logging.getLogger(__name__)

class EnhancedUserAIService:
    """Enhanced AI service with knowledge base integration including platform documentation"""
    
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
        limit: int = 5,
        include_platform_docs: bool = True
    ) -> List[Dict[str, Any]]:
        """Search user's knowledge base including platform documentation for relevant information"""
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
            
            # Search user's knowledge chunks
            result = supabase.rpc('search_knowledge_chunks', {
                'p_user_id': self.user_id,
                'p_query_embedding': query_embedding,
                'p_bucket_type': bucket_type,
                'p_campaign_id': campaign_id,
                'p_limit': limit,
                'p_similarity_threshold': 0.7
            }).execute()
            
            knowledge_results = result.data if result.data else []
            
            # If including platform docs and query seems to be about platform usage, search platform docs
            if include_platform_docs and self._is_platform_help_query(query):
                platform_results = await self._search_platform_documentation(query, api_key, limit=3)
                knowledge_results.extend(platform_results)
            
            if knowledge_results:
                logger.info(f"Found {len(knowledge_results)} relevant knowledge chunks for query: {query}")
                return knowledge_results
            
            return []
            
        except Exception as e:
            logger.error(f"Knowledge search error for user {self.user_id}: {e}")
            return []
    
    def _is_platform_help_query(self, query: str) -> bool:
        """Determine if query is asking for help with platform features"""
        help_keywords = [
            'how do i', 'how to', 'where do i', 'where is', 'how can i',
            'create', 'upload', 'configure', 'set up', 'setup', 'find',
            'knowledge bucket', 'campaign', 'settings', 'api key',
            'dashboard', 'navigation', 'help', 'guide', 'tutorial',
            'troubleshoot', 'error', 'not working', 'problem'
        ]
        query_lower = query.lower()
        return any(keyword in query_lower for keyword in help_keywords)
    
    async def _search_platform_documentation(
        self, 
        query: str, 
        api_key: str, 
        limit: int = 3
    ) -> List[Dict[str, Any]]:
        """Search platform documentation for help-related queries"""
        try:
            supabase = get_supabase()
            
            # Generate embedding for platform doc search
            import httpx
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    'https://api.openai.com/v1/embeddings',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'input': f"platform help documentation {query}",
                        'model': 'text-embedding-ada-002'
                    }
                )
                
                if response.status_code != 200:
                    return []
                
                embedding_data = response.json()
                query_embedding = embedding_data['data'][0]['embedding']
            
            # Search for platform documentation (assuming bucket name 'platform-documentation')
            result = supabase.rpc('search_knowledge_chunks', {
                'p_user_id': self.user_id,
                'p_query_embedding': query_embedding,
                'p_bucket_type': 'general',
                'p_campaign_id': None,
                'p_limit': limit,
                'p_similarity_threshold': 0.6
            }).execute()
            
            if result.data:
                # Filter for platform documentation
                platform_docs = [
                    chunk for chunk in result.data 
                    if 'platform' in chunk.get('bucket_name', '').lower() or 
                       'documentation' in chunk.get('bucket_name', '').lower()
                ]
                return platform_docs
            
            return []
            
        except Exception as e:
            logger.error(f"Platform documentation search error: {e}")
            return []
    
    async def generate_daily_focus_with_knowledge(
        self,
        query: str,
        campaigns: List[Dict[str, Any]],
        context: List[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate daily focus recommendations enhanced with knowledge base"""
        try:
            # Search knowledge base for relevant information (including platform docs)
            knowledge_chunks = await self.search_knowledge_base(
                query=f"daily focus marketing strategy {query}",
                limit=3,
                include_platform_docs=True
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
            
            system_prompt = f"""You are a marketing AI assistant with access to the user's specific knowledge base and platform documentation. 
            Provide personalized daily focus recommendations based on their campaigns and knowledge.
            
            If the user asks for help with platform features, use the platform documentation to provide step-by-step guidance.
            
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
            5. If this is a platform help question, provide step-by-step guidance from the documentation
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
        """Process general queries enhanced with knowledge base search including platform help"""
        try:
            # Search knowledge base for relevant information (including platform docs for help queries)
            knowledge_chunks = await self.search_knowledge_base(
                query=query,
                limit=5,
                include_platform_docs=True
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
                knowledge_context = "\n\nRelevant information from your knowledge base and platform documentation:\n"
                for i, chunk in enumerate(knowledge_chunks, 1):
                    knowledge_context += f"{i}. From '{chunk['document_title']}' ({chunk['bucket_name']}):\n{chunk['chunk_content']}\n\n"
            
            system_prompt = f"""You are a knowledgeable marketing AI assistant with access to the user's personal knowledge base, campaign data, and complete platform documentation. 
            Provide helpful, accurate responses that incorporate both their specific knowledge and general marketing expertise.
            
            When users ask "how to" questions about the platform, provide detailed step-by-step guidance from the platform documentation.
            
            {knowledge_context}
            
            Always reference relevant information from their knowledge base when applicable."""
            
            user_prompt = f"""
            Question: {query}
            
            My Campaign Context: {json.dumps(campaigns[:3], indent=2) if campaigns else 'No active campaigns'}
            
            Additional Context: {json.dumps(context or [], indent=2)}
            
            Please provide a comprehensive answer that incorporates:
            1. Information from my knowledge base (if relevant)
            2. Platform documentation (if this is a how-to question)
            3. My current campaign context
            4. General marketing best practices
            5. Specific actionable recommendations
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

    async def _fetch_conversation_history(self, conversation_id: str, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve recent conversation messages"""
        try:
            supabase = get_supabase()
            result = supabase.from('conversation_messages') \
                .select('role, content') \
                .eq('conversation_id', conversation_id) \
                .order('timestamp', { 'ascending': False }) \
                .limit(limit) \
                .execute()
            return result.data or []
        except Exception as e:
            logger.error(f"Conversation history fetch failed: {e}")
            return []

    async def _summarize_text(self, text: str, api_key: str) -> str:
        """Summarize long context using OpenAI if it exceeds token limits"""
        try:
            import httpx
            async with httpx.AsyncClient(timeout=20.0) as client:
                response = await client.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers={
                        'Authorization': f'Bearer {api_key}',
                        'Content-Type': 'application/json',
                    },
                    json={
                        'model': 'gpt-3.5-turbo',
                        'messages': [
                            {'role': 'system', 'content': 'Summarize the following text'} ,
                            {'role': 'user', 'content': text}
                        ],
                        'max_tokens': 200,
                        'temperature': 0.3
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    return data['choices'][0]['message']['content']
        except Exception as e:
            logger.error(f"Summarization failed: {e}")
        return text[:4000]

    async def process_conversation_query_with_knowledge(
        self,
        query: str,
        conversation_id: str,
        campaigns: Optional[List[Dict[str, Any]]] = None,
        context: Optional[List[Dict[str, Any]]] = None,
        history_limit: int = 20
    ) -> Dict[str, Any]:
        """Generate a chat response using conversation history and knowledge base"""
        try:
            supabase = get_supabase()

            api_key = await self.secrets_client.get_secret(self.user_id, 'openai_api_key')
            if not api_key:
                return {'success': False, 'error': 'OpenAI API key not configured'}

            history_records = await self._fetch_conversation_history(conversation_id, history_limit)
            history_records.reverse()
            history_text = "\n".join(f"{m['role']}: {m['content']}" for m in history_records)

            if len(history_text) / 4 > 1500:
                history_text = await self._summarize_text(history_text, api_key)

            knowledge_chunks = await self.search_knowledge_base(
                query=f"{history_text}\n{query}",
                limit=5,
                include_platform_docs=True
            )

            knowledge_context = ""
            if knowledge_chunks:
                knowledge_context = "\n\nContext from knowledge base:\n" + "\n".join(
                    f"- {c['chunk_content']}" for c in knowledge_chunks
                )

            system_prompt = (
                "You are a helpful marketing assistant. Use the conversation history "
                "and provided knowledge to answer the user."
                f"{knowledge_context}"
            )

            messages = [
                {'role': m['role'], 'content': m['content']} for m in history_records
            ]
            messages.append({'role': 'user', 'content': query})

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
                        'messages': [{'role': 'system', 'content': system_prompt}, *messages],
                        'temperature': 0.7,
                        'max_tokens': 1500
                    }
                )

                if response.status_code != 200:
                    return {'success': False, 'error': f'OpenAI API error: {response.status_code}'}

                ai_response = response.json()

            chunk_ids = [c['chunk_id'] for c in knowledge_chunks]
            if chunk_ids:
                records = [
                    {'conversation_id': conversation_id, 'chunk_id': cid}
                    for cid in chunk_ids
                ]
                try:
                    supabase.from('conversation_knowledge_refs').insert(records).execute()
                except Exception as e:
                    logger.error(f"Failed to persist knowledge refs: {e}")

            return {
                'success': True,
                'response': ai_response['choices'][0]['message']['content'],
                'knowledge_chunk_ids': chunk_ids
            }

        except Exception as e:
            logger.error(f"Conversation query failed for user {self.user_id}: {e}")
            return {'success': False, 'error': str(e)}
