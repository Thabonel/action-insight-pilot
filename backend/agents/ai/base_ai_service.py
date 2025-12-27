
import asyncio
import json
import logging
from typing import Dict, Any, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class BaseAIService:
    """Base service for handling AI API calls with Anthropic Claude"""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.anthropic.com/v1"
        self.headers = {
            "x-api-key": api_key,
            "Content-Type": "application/json",
            "anthropic-version": "2023-06-01"
        }

    async def _make_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Make async HTTP request to Anthropic Claude API"""
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
                logger.error(f"Anthropic Claude API request failed: {str(e)}")
                raise Exception(f"AI service error: {str(e)}")

    def _create_chat_completion_data(self, messages: list, model: str = "claude-opus-4.5", temperature: float = 0.7, max_tokens: int = 4000) -> Dict[str, Any]:
        """Create standardized chat completion request data for Claude"""
        data = {
            "model": model,
            "max_tokens": max_tokens,
            "messages": messages
        }
        # Claude uses max_tokens for all models
        if temperature != 0.7:
            data["temperature"] = temperature
        return data
