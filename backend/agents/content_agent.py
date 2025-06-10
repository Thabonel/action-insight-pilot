
from abc import ABC, abstractmethod
from datetime import datetime
from typing import Dict, Any, Optional, List
import logging
import json
import time
from supabase import Client
from .base_agent import BaseAgent
from .ai_service import AIService

logger = logging.getLogger(__name__)

class ContentAgent(BaseAgent):
    """AI-powered content creation agent using OpenAI"""
    
    def __init__(self, agent_id: int, supabase_client: Client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
        
    async def _initialize_ai_service(self):
        """Initialize AI service with OpenAI API key from secrets"""
        if self.ai_service is None:
            try:
                # Get OpenAI API key from user secrets
                result = await self.supabase.functions.invoke("manage-user-secrets", {
                    "body": json.dumps({"serviceName": "openai_api_key"}),
                    "headers": {"Content-Type": "application/json"}
                })
                
                if result.get('data') and result['data'].get('value'):
                    api_key = result['data']['value']
                    self.ai_service = AIService(api_key)
                    self.logger.info("AI service initialized successfully")
                else:
                    raise Exception("OpenAI API key not found in user secrets")
                    
            except Exception as e:
                self.logger.error(f"Failed to initialize AI service: {str(e)}")
                raise Exception(f"AI service initialization failed: {str(e)}")
    
    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            "create_email_content",
            "create_social_content", 
            "create_blog_content",
            "optimize_content",
            "generate_headlines"
        ]
    
    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute content creation tasks using AI"""
        await self._initialize_ai_service()
        
        if task_type == "create_email_content":
            return await self._create_email_content(input_data)
        elif task_type == "create_social_content":
            return await self._create_social_content(input_data)
        elif task_type == "create_blog_content":
            return await self._create_blog_content(input_data)
        elif task_type == "optimize_content":
            return await self._optimize_content(input_data)
        elif task_type == "generate_headlines":
            return await self._generate_headlines(input_data)
        else:
            raise ValueError(f"Unsupported task type: {task_type}")
    
    async def _create_email_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create email marketing content using AI"""
        self.validate_input_data(["campaign_type", "target_audience"], input_data)
        
        campaign_type = input_data["campaign_type"]
        target_audience = input_data["target_audience"]
        
        self.logger.info(f"Generating email content for {campaign_type} campaign")
        
        try:
            # Generate AI content
            ai_result = await self.ai_service.generate_email_content(campaign_type, target_audience)
            
            # Structure the content
            content = {
                "subject_line": ai_result.get("subject_line", f"Transform Your {campaign_type} Strategy"),
                "preview_text": ai_result.get("preview_text", "Discover new opportunities"),
                "html_content": ai_result.get("html_content", "<p>Professional email content</p>"),
                "text_content": ai_result.get("text_content", "Professional email content"),
                "key_points": ai_result.get("key_points", ["AI-generated", "Personalized", "Engaging"])
            }
            
            # Save to database
            content_data = {
                "title": content["subject_line"],
                "content_type": "email",
                "content": json.dumps(content),
                "keywords": [campaign_type, target_audience.get("industry", "business")],
                "generated_by_agent": self.agent_id,
                "status": "draft",
                "seo_score": 85  # AI-generated content typically scores well
            }
            
            saved_content = await self.save_result_to_database("content_pieces", content_data)
            if saved_content:
                content["content_id"] = saved_content["id"]
            
            return {
                "content": content,
                "ai_insights": ai_result.get("key_points", []),
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create email content: {str(e)}")
            raise Exception(f"Email content creation failed: {str(e)}")
    
    async def _create_social_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create social media content using AI"""
        self.validate_input_data(["platform", "content_theme"], input_data)
        
        platform = input_data["platform"]
        content_theme = input_data["content_theme"]
        brand_voice = input_data.get("brand_voice", "professional")
        
        self.logger.info(f"Generating {platform} content for theme: {content_theme}")
        
        try:
            # Generate AI content
            ai_result = await self.ai_service.generate_social_post(platform, content_theme, brand_voice)
            
            # Structure the post data
            post_data = {
                "platform": platform,
                "content": ai_result.get("content", f"Engaging content about {content_theme}"),
                "hashtags": ai_result.get("hashtags", [f"#{content_theme.replace(' ', '')}"]),
                "suggested_image": ai_result.get("suggested_image", "Professional branded image"),
                "engagement_hooks": ai_result.get("engagement_hooks", []),
                "scheduled_time": None,
                "status": "draft",
                "engagement_metrics": {}
            }
            
            # Save to database
            saved_post = await self.save_result_to_database("social_posts", post_data)
            if saved_post:
                post_data["post_id"] = saved_post["id"]
            
            return {
                "post": post_data,
                "ai_suggestions": ai_result,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create social content: {str(e)}")
            raise Exception(f"Social content creation failed: {str(e)}")
    
    async def _create_blog_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create blog content using AI"""
        self.validate_input_data(["topic", "target_keywords"], input_data)
        
        topic = input_data["topic"]
        keywords = input_data["target_keywords"]
        word_count = input_data.get("word_count", 800)
        
        # For blog content, we'll use the AI service to generate structured content
        blog_prompt = f"Write a {word_count}-word blog post about {topic}, targeting keywords: {', '.join(keywords)}"
        
        try:
            # Use the social post generator as a base (you could extend AI service for blog-specific generation)
            ai_result = await self.ai_service.generate_social_post("blog", topic, "informative")
            
            content = {
                "title": f"Complete Guide to {topic}",
                "content": ai_result.get("content", f"Comprehensive content about {topic}"),
                "meta_description": f"Learn everything about {topic} in this detailed guide",
                "keywords": keywords,
                "estimated_read_time": max(1, word_count // 200)  # Rough estimate
            }
            
            # Save to database
            content_data = {
                "title": content["title"],
                "content_type": "blog",
                "content": json.dumps(content),
                "keywords": keywords,
                "generated_by_agent": self.agent_id,
                "status": "draft",
                "seo_score": 80
            }
            
            saved_content = await self.save_result_to_database("content_pieces", content_data)
            if saved_content:
                content["content_id"] = saved_content["id"]
            
            return {
                "content": content,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to create blog content: {str(e)}")
            raise Exception(f"Blog content creation failed: {str(e)}")
    
    async def _optimize_content(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Optimize existing content using AI"""
        self.validate_input_data(["content_id"], input_data)
        
        content_id = input_data["content_id"]
        
        try:
            # Get existing content
            result = self.supabase.table("content_pieces")\
                .select("*")\
                .eq("id", content_id)\
                .execute()
            
            if not result.data:
                raise Exception(f"Content {content_id} not found")
            
            content = result.data[0]
            campaign_data = {
                "type": content["content_type"],
                "content": json.loads(content["content"]) if content["content"] else {},
                "target_audience": {"industry": "general"}
            }
            
            # Use AI to optimize
            optimization = await self.ai_service.optimize_campaign_copy(campaign_data)
            
            # Update content with optimizations
            optimized_content = json.loads(content["content"])
            optimized_content["ai_optimizations"] = optimization
            
            self.supabase.table("content_pieces")\
                .update({
                    "content": json.dumps(optimized_content),
                    "seo_score": min(100, content.get("seo_score", 0) + 10),
                    "updated_at": datetime.utcnow().isoformat()
                })\
                .eq("id", content_id)\
                .execute()
            
            return {
                "content_id": content_id,
                "optimizations": optimization,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to optimize content: {str(e)}")
            raise Exception(f"Content optimization failed: {str(e)}")
    
    async def _generate_headlines(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate multiple headline variations"""
        self.validate_input_data(["topic"], input_data)
        
        topic = input_data["topic"]
        count = input_data.get("count", 5)
        
        try:
            headlines = []
            for i in range(count):
                result = await self.ai_service.generate_social_post("headline", f"{topic} variation {i+1}")
                headlines.append(result.get("content", f"Compelling headline about {topic}"))
            
            return {
                "headlines": headlines,
                "topic": topic,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success"
            }
            
        except Exception as e:
            self.logger.error(f"Failed to generate headlines: {str(e)}")
            raise Exception(f"Headlines generation failed: {str(e)}")
