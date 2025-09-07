
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
    
    def _create_chat_completion_data(self, messages: list, model: str = "gpt-5-2025-08-07", temperature: float = 0.7, max_tokens: int = 800) -> Dict[str, Any]:
        """Create standardized chat completion request data"""
        data = {
            "model": model,
            "messages": messages,
        }
        # Use correct params for newer models (GPT-5, GPT-4.1+, O3, O4)
        if isinstance(model, str) and model.startswith(("gpt-5", "gpt-4.1", "o3", "o4")):
            data["max_completion_tokens"] = max_tokens
        else:
            data["temperature"] = temperature
            data["max_tokens"] = max_tokens
        return data
