
import asyncio
import logging
from typing import Dict, Any, List, Optional
from enum import Enum
import httpx
import json

logger = logging.getLogger(__name__)

class LLMProvider(str, Enum):
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    MISTRAL = "mistral"
    GOOGLE = "google"

class MultiModelService:
    """Service for supporting multiple LLM providers for content generation"""
    
    def __init__(self):
        self.logger = logger
        self.current_provider = LLMProvider.ANTHROPIC
        self.api_keys = {}
        self.model_configs = self._initialize_model_configs()
        self.fallback_order = [LLMProvider.ANTHROPIC, LLMProvider.GOOGLE, LLMProvider.MISTRAL]
    
    def _initialize_model_configs(self) -> Dict[str, Dict[str, Any]]:
        """Initialize configuration for different LLM providers"""
        return {
            LLMProvider.OPENAI: {
                "api_url": "https://api.openai.com/v1/chat/completions",
                "models": ["gpt-5", "gpt-5-mini", "gpt-4.1", "gpt-4.1-mini"],
                "default_model": "gpt-5-mini",
                "max_tokens": 4000,
                "temperature": 0.7,
                "supports_vision": True,
                "rate_limit": 60  # requests per minute
            },
            LLMProvider.ANTHROPIC: {
                "api_url": "https://api.anthropic.com/v1/messages",
                "models": ["claude-opus-4.5", "claude-sonnet-4.5", "claude-haiku-4.5", "claude-opus-4.1", "claude-sonnet-4"],
                "default_model": "claude-opus-4.5",
                "max_tokens": 4000,
                "temperature": 0.7,
                "supports_vision": True,
                "rate_limit": 50
            },
            LLMProvider.MISTRAL: {
                "api_url": "https://api.mistral.ai/v1/chat/completions",
                "models": ["mistral-large-latest", "mistral-medium-latest"],
                "default_model": "mistral-large-latest",
                "max_tokens": 4000,
                "temperature": 0.7,
                "supports_vision": False,
                "rate_limit": 100
            },
            LLMProvider.GOOGLE: {
                "api_url": "https://generativelanguage.googleapis.com/v1beta/models",
                "models": ["gemini-3-pro", "gemini-3-flash", "gemini-2.5-pro", "gemini-2.5-flash"],
                "default_model": "gemini-3-flash",
                "max_tokens": 4000,
                "temperature": 0.7,
                "supports_vision": True,
                "rate_limit": 60
            }
        }
    
    def set_llm_provider(self, provider: str, api_key: str = None) -> Dict[str, Any]:
        """Set the active LLM provider"""
        try:
            if provider not in LLMProvider.__members__.values():
                return {
                    "success": False,
                    "error": f"Unsupported provider: {provider}. Supported: {list(LLMProvider.__members__.values())}"
                }
            
            self.current_provider = LLMProvider(provider)
            
            if api_key:
                self.api_keys[provider] = api_key
            
            return {
                "success": True,
                "provider": provider,
                "available_models": self.model_configs[provider]["models"],
                "default_model": self.model_configs[provider]["default_model"]
            }
            
        except Exception as e:
            self.logger.error(f"Error setting LLM provider: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def generate_social_content(self, prompt: str, platform: str, 
                                    model: str = None, provider: str = None) -> Dict[str, Any]:
        """Generate social media content using specified or current provider"""
        try:
            # Use specified provider or current one
            active_provider = LLMProvider(provider) if provider else self.current_provider
            
            # Try with primary provider first, then fallback
            for attempt_provider in [active_provider] + self.fallback_order:
                if attempt_provider not in self.api_keys:
                    continue
                
                try:
                    result = await self._generate_with_provider(prompt, platform, attempt_provider, model)
                    if result["success"]:
                        result["provider_used"] = attempt_provider.value
                        return result
                except Exception as e:
                    self.logger.warning(f"Provider {attempt_provider} failed: {str(e)}")
                    continue
            
            return {
                "success": False,
                "error": "All providers failed or no API keys available"
            }
            
        except Exception as e:
            self.logger.error(f"Error in multi-model content generation: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def _generate_with_provider(self, prompt: str, platform: str, 
                                    provider: LLMProvider, model: str = None) -> Dict[str, Any]:
        """Generate content with specific provider"""
        config = self.model_configs[provider]
        api_key = self.api_keys.get(provider.value)
        
        if not api_key:
            raise Exception(f"No API key for provider {provider}")
        
        model_name = model or config["default_model"]
        
        # Create platform-optimized prompt
        enhanced_prompt = self._create_platform_prompt(prompt, platform, provider)
        
        if provider == LLMProvider.OPENAI:
            return await self._call_openai(enhanced_prompt, model_name, api_key, config)
        elif provider == LLMProvider.ANTHROPIC:
            return await self._call_anthropic(enhanced_prompt, model_name, api_key, config)
        elif provider == LLMProvider.MISTRAL:
            return await self._call_mistral(enhanced_prompt, model_name, api_key, config)
        elif provider == LLMProvider.GOOGLE:
            return await self._call_google(enhanced_prompt, model_name, api_key, config)
        else:
            raise Exception(f"Provider {provider} not implemented")
    
    def _create_platform_prompt(self, prompt: str, platform: str, provider: LLMProvider) -> str:
        """Create platform-optimized prompt for specific provider"""
        platform_guidelines = {
            "instagram": "Visual-focused, lifestyle content, 5-10 hashtags",
            "twitter": "Concise, engaging, 2-4 hashtags, under 280 characters",
            "linkedin": "Professional tone, industry insights, 1-3 hashtags",
            "facebook": "Conversational, community-focused, longer format allowed",
            "tiktok": "Trendy, creative, youth-focused, viral potential",
            "pinterest": "Keyword-rich, searchable, inspiration-focused"
        }
        
        guidelines = platform_guidelines.get(platform, "Engaging social media content")
        
        # Provider-specific prompt formatting
        if provider == LLMProvider.ANTHROPIC:
            return f"Human: Create social media content for {platform}. {guidelines}\n\nContent request: {prompt}\n\nAssistant:"
        else:
            return f"Create social media content for {platform}. {guidelines}\n\nContent request: {prompt}"
    
    async def _call_openai(self, prompt: str, model: str, api_key: str, config: Dict) -> Dict[str, Any]:
        """Call OpenAI API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config["api_url"],
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a social media content creator."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": config["max_tokens"],
                    "temperature": config["temperature"]
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "content": content,
                    "model_used": model,
                    "provider": "openai",
                    "usage": data.get("usage", {})
                }
            else:
                raise Exception(f"OpenAI API error: {response.status_code}")
    
    async def _call_anthropic(self, prompt: str, model: str, api_key: str, config: Dict) -> Dict[str, Any]:
        """Call Anthropic API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config["api_url"],
                headers={
                    "x-api-key": api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": model,
                    "max_tokens": config["max_tokens"],
                    "messages": [{"role": "user", "content": prompt}]
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["content"][0]["text"]
                
                return {
                    "success": True,
                    "content": content,
                    "model_used": model,
                    "provider": "anthropic",
                    "usage": data.get("usage", {})
                }
            else:
                raise Exception(f"Anthropic API error: {response.status_code}")
    
    async def _call_mistral(self, prompt: str, model: str, api_key: str, config: Dict) -> Dict[str, Any]:
        """Call Mistral API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                config["api_url"],
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": [
                        {"role": "system", "content": "You are a social media content creator."},
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": config["max_tokens"],
                    "temperature": config["temperature"]
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                
                return {
                    "success": True,
                    "content": content,
                    "model_used": model,
                    "provider": "mistral",
                    "usage": data.get("usage", {})
                }
            else:
                raise Exception(f"Mistral API error: {response.status_code}")
    
    async def _call_google(self, prompt: str, model: str, api_key: str, config: Dict) -> Dict[str, Any]:
        """Call Google Gemini API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{config['api_url']}/{model}:generateContent?key={api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{
                        "parts": [{"text": prompt}]
                    }],
                    "generationConfig": {
                        "temperature": config["temperature"],
                        "maxOutputTokens": config["max_tokens"]
                    }
                },
                timeout=30.0
            )
            
            if response.status_code == 200:
                data = response.json()
                content = data["candidates"][0]["content"]["parts"][0]["text"]
                
                return {
                    "success": True,
                    "content": content,
                    "model_used": model,
                    "provider": "google",
                    "usage": data.get("usageMetadata", {})
                }
            else:
                raise Exception(f"Google API error: {response.status_code}")
    
    async def compare_providers(self, prompt: str, platform: str) -> Dict[str, Any]:
        """Compare output from different providers for the same prompt"""
        results = {}
        
        for provider in self.fallback_order:
            if provider.value in self.api_keys:
                try:
                    result = await self._generate_with_provider(prompt, platform, provider)
                    if result["success"]:
                        results[provider.value] = {
                            "content": result["content"],
                            "model": result["model_used"],
                            "usage": result.get("usage", {})
                        }
                except Exception as e:
                    results[provider.value] = {"error": str(e)}
        
        return {
            "success": True,
            "comparison_results": results,
            "prompt": prompt,
            "platform": platform
        }
    
    def get_provider_status(self) -> Dict[str, Any]:
        """Get status of all configured providers"""
        status = {
            "current_provider": self.current_provider.value,
            "available_providers": [],
            "provider_details": {}
        }
        
        for provider, config in self.model_configs.items():
            has_api_key = provider.value in self.api_keys
            
            if has_api_key:
                status["available_providers"].append(provider.value)
            
            status["provider_details"][provider.value] = {
                "configured": has_api_key,
                "models": config["models"],
                "default_model": config["default_model"],
                "supports_vision": config["supports_vision"],
                "rate_limit": config["rate_limit"]
            }
        
        return status
    
    async def test_provider_connection(self, provider: str) -> Dict[str, Any]:
        """Test connection to a specific provider"""
        if provider not in self.api_keys:
            return {
                "success": False,
                "provider": provider,
                "error": "No API key configured"
            }
        
        try:
            test_result = await self._generate_with_provider(
                "Generate a simple test message", 
                "twitter", 
                LLMProvider(provider)
            )
            
            return {
                "success": test_result["success"],
                "provider": provider,
                "response_time": "< 1s",  # Would measure actual response time
                "model_used": test_result.get("model_used"),
                "error": test_result.get("error")
            }
            
        except Exception as e:
            return {
                "success": False,
                "provider": provider,
                "error": str(e)
            }
