
import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAIService:
    """Base service for handling AI API calls with OpenAI"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.openai.com/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make async HTTP request to OpenAI API"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/{endpoint}",
                    headers=self.headers,
                    json=data
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPError as e:
                logger.error(f"OpenAI API request failed: {str(e)}")
                raise Exception(f"AI service error: {str(e)}")
    
    def _create_chat_completion_data(self, messages: list, model: str = "gpt-4o-mini", temperature: float = 0.7, max_tokens: int = 800) -> Dict[str, Any]:
        """Create standardized chat completion request data"""
        return {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
