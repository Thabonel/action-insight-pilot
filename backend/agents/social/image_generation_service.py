
import asyncio
import logging
from typing import Dict, Any, List, Optional
import httpx
from datetime import datetime

logger = logging.getLogger(__name__)

class ImageGenerationService:
    """Service for generating images and videos for social media posts"""
    
    def __init__(self, openai_api_key: str = None, replicate_api_key: str = None):
        self.openai_api_key = openai_api_key
        self.replicate_api_key = replicate_api_key
        self.logger = logger
        
    async def generate_image_dalle(self, prompt: str, style: str = "vivid", size: str = "1024x1024") -> Dict[str, Any]:
        """Generate image using DALL-E"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/images/generations",
                    headers={
                        "Authorization": f"Bearer {self.openai_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "model": "dall-e-3",
                        "prompt": prompt,
                        "n": 1,
                        "size": size,
                        "style": style,
                        "quality": "hd"
                    },
                    timeout=60.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "success": True,
                        "image_url": data["data"][0]["url"],
                        "revised_prompt": data["data"][0].get("revised_prompt", prompt),
                        "generator": "dall-e-3"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"DALL-E API error: {response.status_code}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Error generating image with DALL-E: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_image_stable_diffusion(self, prompt: str, model: str = "black-forest-labs/flux-schnell") -> Dict[str, Any]:
        """Generate image using Stable Diffusion via Replicate"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.replicate.com/v1/predictions",
                    headers={
                        "Authorization": f"Token {self.replicate_api_key}",
                        "Content-Type": "application/json"
                    },
                    json={
                        "version": model,
                        "input": {
                            "prompt": prompt,
                            "go_fast": True,
                            "megapixels": "1",
                            "num_outputs": 1,
                            "aspect_ratio": "1:1",
                            "output_format": "webp",
                            "output_quality": 80,
                            "num_inference_steps": 4
                        }
                    },
                    timeout=60.0
                )
                
                if response.status_code == 201:
                    data = response.json()
                    prediction_id = data["id"]
                    
                    # Poll for completion
                    for _ in range(30):  # Max 30 attempts (5 minutes)
                        await asyncio.sleep(10)
                        
                        status_response = await client.get(
                            f"https://api.replicate.com/v1/predictions/{prediction_id}",
                            headers={"Authorization": f"Token {self.replicate_api_key}"}
                        )
                        
                        if status_response.status_code == 200:
                            status_data = status_response.json()
                            
                            if status_data["status"] == "succeeded":
                                return {
                                    "success": True,
                                    "image_url": status_data["output"][0] if status_data["output"] else None,
                                    "generator": "stable-diffusion"
                                }
                            elif status_data["status"] == "failed":
                                return {
                                    "success": False,
                                    "error": "Generation failed"
                                }
                    
                    return {
                        "success": False,
                        "error": "Generation timeout"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"Replicate API error: {response.status_code}"
                    }
                    
        except Exception as e:
            self.logger.error(f"Error generating image with Stable Diffusion: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_platform_optimized_image(self, prompt: str, platform: str) -> Dict[str, Any]:
        """Generate image optimized for specific platform"""
        platform_specs = {
            "instagram": {"size": "1024x1024", "style": "vivid"},
            "facebook": {"size": "1024x1024", "style": "natural"},
            "twitter": {"size": "1024x1024", "style": "vivid"},
            "linkedin": {"size": "1024x1024", "style": "natural"},
            "tiktok": {"size": "1024x1792", "style": "vivid"},
            "pinterest": {"size": "1024x1536", "style": "natural"},
            "threads": {"size": "1024x1024", "style": "vivid"}
        }
        
        specs = platform_specs.get(platform, {"size": "1024x1024", "style": "vivid"})
        
        # Add platform-specific prompt enhancements
        enhanced_prompt = f"{prompt}, optimized for {platform}, high quality, engaging"
        
        return await self.generate_image_dalle(enhanced_prompt, specs["style"], specs["size"])
    
    def suggest_visual_content(self, post_content: str, platform: str) -> Dict[str, Any]:
        """Suggest visual content based on post text"""
        suggestions = []
        
        # Analyze content for visual opportunities
        keywords = post_content.lower().split()
        
        if any(word in keywords for word in ["product", "launch", "announcement"]):
            suggestions.append({
                "type": "product_showcase",
                "prompt": f"Professional product photography of {post_content[:100]}, clean background, studio lighting"
            })
        
        if any(word in keywords for word in ["tip", "how-to", "guide", "tutorial"]):
            suggestions.append({
                "type": "infographic",
                "prompt": f"Clean infographic design showing {post_content[:100]}, modern typography, colorful"
            })
        
        if any(word in keywords for word in ["team", "company", "office", "culture"]):
            suggestions.append({
                "type": "lifestyle",
                "prompt": f"Professional lifestyle photography of {post_content[:100]}, warm lighting, authentic"
            })
        
        return {
            "suggestions": suggestions,
            "platform": platform,
            "auto_generate": len(suggestions) > 0
        }
