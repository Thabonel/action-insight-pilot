# agents/content_agent.py

import asyncio
import json
import logging
import re
import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class ContentType(Enum):
    BLOG_POST = "blog_post"
    EMAIL = "email"
    SOCIAL_POST = "social_post"
    AD_COPY = "ad_copy"
    VIDEO_SCRIPT = "video_script"
    LANDING_PAGE = "landing_page"
    NEWSLETTER = "newsletter"
    PRODUCT_DESCRIPTION = "product_description"
    CASE_STUDY = "case_study"
    WHITE_PAPER = "white_paper"
    PRESS_RELEASE = "press_release"

class ContentStatus(Enum):
    DRAFT = "draft"
    REVIEW = "review"
    APPROVED = "approved"
    SCHEDULED = "scheduled"
    PUBLISHED = "published"
    ARCHIVED = "archived"
    REJECTED = "rejected"

class Platform(Enum):
    LINKEDIN = "linkedin"
    TWITTER = "twitter"
    FACEBOOK = "facebook"
    INSTAGRAM = "instagram"
    YOUTUBE = "youtube"
    TIKTOK = "tiktok"
    BLOG = "blog"
    EMAIL = "email"
    WEBSITE = "website"

class Tone(Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    FRIENDLY = "friendly"
    AUTHORITATIVE = "authoritative"
    CONVERSATIONAL = "conversational"
    HUMOROUS = "humorous"
    INSPIRING = "inspiring"
    EDUCATIONAL = "educational"

class ContentLength(Enum):
    SHORT = "short"       # <300 words
    MEDIUM = "medium"     # 300-800 words
    LONG = "long"         # 800-1500 words
    EXTENDED = "extended" # >1500 words

@dataclass
class SEOParameters:
    primary_keyword: str
    secondary_keywords: List[str]
    meta_description: Optional[str] = None
    target_keyword_density: float = 2.0  # percentage
    focus_keyphrase: Optional[str] = None

@dataclass
class ContentBrief:
    title: str
    content_type: ContentType
    platform: Platform
    target_audience: str
    key_messages: List[str]
    tone: Tone = Tone.PROFESSIONAL
    length: ContentLength = ContentLength.MEDIUM
    seo_params: Optional[SEOParameters] = None
    cta: Optional[str] = None
    deadline: Optional[datetime] = None
    brand_guidelines: Optional[Dict[str, Any]] = None
    competitor_analysis: Optional[List[str]] = None
    visual_requirements: Optional[Dict[str, str]] = None

@dataclass
class ContentQuality:
    seo_score: int = 0
    readability_score: int = 0
    engagement_prediction: float = 0.0
    sentiment_score: float = 0.0
    uniqueness_score: int = 0
    brand_alignment_score: int = 0
    platform_optimization_score: int = 0

@dataclass
class ContentPerformance:
    views: int = 0
    likes: int = 0
    shares: int = 0
    comments: int = 0
    clicks: int = 0
    conversions: int = 0
    engagement_rate: float = 0.0
    ctr: float = 0.0
    last_updated: Optional[datetime] = None

@dataclass
class GeneratedContent:
    id: str
    brief: ContentBrief
    content: Dict[str, Any]
    status: ContentStatus
    created_at: datetime
    updated_at: datetime
    quality: ContentQuality
    performance: Optional[ContentPerformance] = None
    versions: List[Dict[str, Any]] = None
    approval_notes: Optional[str] = None
    published_at: Optional[datetime] = None

class ContentAgent:
    def __init__(self, openai_api_key: str, supabase_client=None):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.supabase = supabase_client
        self.content_store: Dict[str, GeneratedContent] = {}
        self.content_calendar: Dict[str, List[str]] = {}  # date -> content_ids
        self.template_library: Dict[str, Dict] = self._load_templates()
        
    def _load_templates(self) -> Dict[str, Dict]:
        """Load content templates for different types and platforms"""
        return {
            "linkedin_post": {
                "structure": "Hook + Context + Insight + CTA",
                "max_length": 3000,
                "hashtag_limit": 5,
                "optimal_posting_times": ["8-10am", "12-2pm", "5-6pm"]
            },
            "twitter_post": {
                "structure": "Hook + Value + CTA",
                "max_length": 280,
                "hashtag_limit": 2,
                "optimal_posting_times": ["9-10am", "12-1pm", "5-6pm"]
            },
            "blog_post": {
                "structure": "Title + Introduction + Main Content + Conclusion + CTA",
                "min_length": 1000,
                "seo_requirements": True,
                "internal_links": 3
            },
            "email": {
                "structure": "Subject + Preview + Body + CTA + Footer",
                "subject_length": 50,
                "preview_length": 90,
                "body_paragraphs": "3-5"
            }
        }

    async def create_content(self, brief: ContentBrief) -> GeneratedContent:
        """Generate high-quality content based on comprehensive brief"""
        try:
            # Generate unique content ID
            content_id = f"content_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{brief.content_type.value}"
            
            # Research and analyze
            research_data = await self._conduct_content_research(brief)
            
            # Generate multiple content variations
            content_variations = await self._generate_content_variations(brief, research_data)
            
            # Select best variation
            best_content = await self._select_best_content(content_variations, brief)
            
            # Optimize for platform
            optimized_content = await self._optimize_for_platform(best_content, brief.platform)
            
            # Create content object
            content = GeneratedContent(
                id=content_id,
                brief=brief,
                content=optimized_content,
                status=ContentStatus.DRAFT,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                quality=ContentQuality(),
                versions=content_variations
            )
            
            # Comprehensive quality analysis
            await self._analyze_content_quality(content)
            
            # Store content
            self.content_store[content_id] = content
            
            # Add to content calendar if deadline specified
            if brief.deadline:
                await self._add_to_calendar(content_id, brief.deadline)
            
            # Save to database
            if self.supabase:
                await self._save_content_to_db(content)
            
            logger.info(f"Created high-quality content: {content_id}")
            return content
            
        except Exception as e:
            logger.error(f"Error creating content: {str(e)}")
            raise

    async def _conduct_content_research(self, brief: ContentBrief) -> Dict[str, Any]:
        """Conduct research for content creation"""
        research_data = {
            "trending_topics": [],
            "competitor_content": [],
            "audience_insights": {},
            "platform_best_practices": {},
            "seo_opportunities": {}
        }
        
        try:
            # Research trending topics
            trending_prompt = f"""
            Research trending topics related to:
            - Industry: {brief.target_audience}
            - Content type: {brief.content_type.value}
            - Platform: {brief.platform.value}
            - Key messages: {', '.join(brief.key_messages)}
            
            Provide 5-10 trending topics, hashtags, and current discussions.
            Return as JSON: {{"trending_topics": [], "relevant_hashtags": [], "discussion_points": []}}
            """
            
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a content research specialist. Always respond with valid JSON."},
                    {"role": "user", "content": trending_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            trending_data = json.loads(response.choices[0].message.content)
            research_data.update(trending_data)
            
            # Platform-specific research
            platform_research = await self._research_platform_best_practices(brief.platform)
            research_data["platform_best_practices"] = platform_research
            
            # SEO research if applicable
            if brief.seo_params:
                seo_research = await self._research_seo_opportunities(brief.seo_params)
                research_data["seo_opportunities"] = seo_research
            
        except Exception as e:
            logger.error(f"Error conducting research: {str(e)}")
        
        return research_data

    async def _research_platform_best_practices(self, platform: Platform) -> Dict[str, Any]:
        """Research platform-specific best practices"""
        template = self.template_library.get(f"{platform.value}_post", {})
        
        best_practices_prompt = f"""
        Provide current best practices for {platform.value} content creation:
        
        Include:
        1. Optimal content length and format
        2. Best posting times
        3. Engagement strategies
        4. Hashtag recommendations
        5. Visual content requirements
        6. Current algorithm preferences
        
        Return as structured JSON.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": f"You are a {platform.value} marketing expert."},
                    {"role": "user", "content": best_practices_prompt}
                ],
                temperature=0.3,
                max_tokens=600
            )
            
            return json.loads(response.choices[0].message.content)
        except:
            return template

    async def _research_seo_opportunities(self, seo_params: SEOParameters) -> Dict[str, Any]:
        """Research SEO opportunities and keyword optimization"""
        seo_prompt = f"""
        Analyze SEO opportunities for:
        Primary keyword: {seo_params.primary_keyword}
        Secondary keywords: {', '.join(seo_params.secondary_keywords)}
        
        Provide:
        1. Related long-tail keywords
        2. Content structure recommendations
        3. Internal linking opportunities
        4. Meta description suggestions
        5. Featured snippet opportunities
        
        Return as JSON.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an SEO specialist."},
                    {"role": "user", "content": seo_prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            return json.loads(response.choices[0].message.content)
        except:
            return {"related_keywords": [], "structure_recommendations": []}

    async def _generate_content_variations(self, brief: ContentBrief, research_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate multiple content variations"""
        variations = []
        
        # Generate 3 different approaches
        approaches = ["data-driven", "story-based", "problem-solution"]
        
        for i, approach in enumerate(approaches):
            variation_prompt = f"""
            Create {brief.content_type.value} content using a {approach} approach:
            
            Brief:
            - Title: {brief.title}
            - Platform: {brief.platform.value}
            - Target Audience: {brief.target_audience}
            - Tone: {brief.tone.value}
            - Length: {brief.length.value}
            - Key Messages: {', '.join(brief.key_messages)}
            - CTA: {brief.cta or 'Engage with us'}
            
            Research Context:
            {json.dumps(research_data, indent=2)[:1000]}...
            
            Platform Requirements:
            {json.dumps(self.template_library.get(f"{brief.platform.value}_post", {}), indent=2)}
            
            Create engaging content with:
            1. Compelling headline/title
            2. Hook/opening
            3. Main content body
            4. Call-to-action
            5. Relevant hashtags/tags
            6. Visual content suggestions
            
            Format as JSON: {{"title": "", "hook": "", "content": "", "cta": "", "hashtags": [], "visual_suggestions": []}}
            """
            
            try:
                response = await self.openai_client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": f"You are an expert {approach} content creator. Always respond with valid JSON."},
                        {"role": "user", "content": variation_prompt}
                    ],
                    temperature=0.7 + (i * 0.1),  # Increase creativity for each variation
                    max_tokens=2500
                )
                
                variation = json.loads(response.choices[0].message.content)
                variation["approach"] = approach
                variation["variation_id"] = i + 1
                variations.append(variation)
                
            except Exception as e:
                logger.error(f"Error generating variation {i+1}: {str(e)}")
                # Fallback variation
                variations.append({
                    "title": brief.title,
                    "content": f"Generated content for {brief.content_type.value}",
                    "cta": brief.cta or "Learn more",
                    "hashtags": [],
                    "approach": approach,
                    "variation_id": i + 1
                })
        
        return variations

    async def _select_best_content(self, variations: List[Dict[str, Any]], brief: ContentBrief) -> Dict[str, Any]:
        """Select the best content variation using AI evaluation"""
        
        evaluation_prompt = f"""
        Evaluate these {len(variations)} content variations and select the best one:
        
        Content Brief:
        - Target Audience: {brief.target_audience}
        - Platform: {brief.platform.value}
        - Tone: {brief.tone.value}
        - Key Messages: {', '.join(brief.key_messages)}
        
        Variations:
        {json.dumps(variations, indent=2)}
        
        Evaluate each variation on:
        1. Audience relevance (1-10)
        2. Platform optimization (1-10)
        3. Message clarity (1-10)
        4. Engagement potential (1-10)
        5. Brand alignment (1-10)
        
        Return the best variation with evaluation scores:
        {{"selected_variation": {{"variation_id": 1, "total_score": 45}}, "evaluation_details": {{"variation_1": {{"scores": {{}}, "reasoning": ""}}}}}}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a content evaluation expert. Always respond with valid JSON."},
                    {"role": "user", "content": evaluation_prompt}
                ],
                temperature=0.2,
                max_tokens=1500
            )
            
            evaluation = json.loads(response.choices[0].message.content)
            selected_id = evaluation["selected_variation"]["variation_id"]
            
            # Return the selected variation with evaluation data
            best_content = variations[selected_id - 1].copy()
            best_content["evaluation"] = evaluation
            
            return best_content
            
        except Exception as e:
            logger.error(f"Error selecting best content: {str(e)}")
            # Return first variation as fallback
            return variations[0] if variations else {"content": "Content generation failed"}

    async def _optimize_for_platform(self, content: Dict[str, Any], platform: Platform) -> Dict[str, Any]:
        """Optimize content for specific platform requirements"""
        
        platform_template = self.template_library.get(f"{platform.value}_post", {})
        optimized_content = content.copy()
        
        # Platform-specific optimizations
        if platform == Platform.TWITTER:
            # Ensure under 280 characters
            if len(content.get("content", "")) > 250:
                optimized_content["content"] = content["content"][:250] + "..."
            
            # Limit hashtags
            if len(content.get("hashtags", [])) > 2:
                optimized_content["hashtags"] = content["hashtags"][:2]
        
        elif platform == Platform.LINKEDIN:
            # Optimize for professional tone
            if "hashtags" in content and len(content["hashtags"]) > 5:
                optimized_content["hashtags"] = content["hashtags"][:5]
            
            # Add professional formatting
            if "content" in content:
                optimized_content["content"] = self._format_linkedin_post(content["content"])
        
        elif platform == Platform.INSTAGRAM:
            # Focus on visual content
            optimized_content["visual_priority"] = True
            
            # Optimize hashtags for discovery
            if len(content.get("hashtags", [])) < 10:
                additional_hashtags = await self._generate_instagram_hashtags(content)
                optimized_content["hashtags"] = content.get("hashtags", []) + additional_hashtags
        
        elif platform == Platform.EMAIL:
            # Add email-specific elements
            optimized_content["subject_line"] = content.get("title", "")
            optimized_content["preview_text"] = content.get("hook", "")[:90]
            optimized_content["preheader"] = content.get("hook", "")
        
        return optimized_content

    def _format_linkedin_post(self, content: str) -> str:
        """Format content for LinkedIn best practices"""
        # Add line breaks for readability
        paragraphs = content.split('\n')
        formatted_paragraphs = []
        
        for paragraph in paragraphs:
            if len(paragraph) > 100:
                # Break long paragraphs
                sentences = paragraph.split('. ')
                current_paragraph = ""
                
                for sentence in sentences:
                    if len(current_paragraph + sentence) > 100 and current_paragraph:
                        formatted_paragraphs.append(current_paragraph.strip())
                        current_paragraph = sentence + ". "
                    else:
                        current_paragraph += sentence + ". "
                
                if current_paragraph:
                    formatted_paragraphs.append(current_paragraph.strip())
            else:
                formatted_paragraphs.append(paragraph)
        
        return '\n\n'.join(formatted_paragraphs)

    async def _generate_instagram_hashtags(self, content: Dict[str, Any]) -> List[str]:
        """Generate Instagram-specific hashtags"""
        hashtag_prompt = f"""
        Generate 5-10 Instagram hashtags for this content:
        
        Content: {content.get("content", "")[:200]}...
        Existing hashtags: {content.get("hashtags", [])}
        
        Focus on:
        1. Trending hashtags
        2. Niche-specific tags
        3. Community hashtags
        4. Engagement hashtags
        
        Return as JSON array: ["hashtag1", "hashtag2", ...]
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an Instagram marketing expert."},
                    {"role": "user", "content": hashtag_prompt}
                ],
                temperature=0.6,
                max_tokens=300
            )
            
            return json.loads(response.choices[0].message.content)
        except:
            return ["#content", "#marketing", "#business"]

    async def _analyze_content_quality(self, content: GeneratedContent):
        """Comprehensive content quality analysis"""
        try:
            content_text = content.content.get("content", "")
            
            # SEO Analysis
            if content.brief.seo_params:
                content.quality.seo_score = await self._calculate_seo_score(content_text, content.brief.seo_params)
            else:
                content.quality.seo_score = 70  # Default score
            
            # Readability Analysis
            content.quality.readability_score = self._calculate_readability_score(content_text)
            
            # Engagement Prediction
            content.quality.engagement_prediction = await self._predict_engagement(content)
            
            # Sentiment Analysis
            content.quality.sentiment_score = await self._analyze_sentiment(content_text)
            
            # Uniqueness Check
            content.quality.uniqueness_score = await self._check_uniqueness(content_text)
            
            # Brand Alignment
            if content.brief.brand_guidelines:
                content.quality.brand_alignment_score = await self._check_brand_alignment(content, content.brief.brand_guidelines)
            else:
                content.quality.brand_alignment_score = 85
            
            # Platform Optimization
            content.quality.platform_optimization_score = self._calculate_platform_optimization(content)
            
        except Exception as e:
            logger.error(f"Error analyzing content quality: {str(e)}")
            # Set default scores
            content.quality = ContentQuality(
                seo_score=70,
                readability_score=75,
                engagement_prediction=0.6,
                sentiment_score=0.5,
                uniqueness_score=80,
                brand_alignment_score=75,
                platform_optimization_score=70
            )

    async def _calculate_seo_score(self, content: str, seo_params: SEOParameters) -> int:
        """Calculate SEO score based on keyword optimization"""
        score = 0
        content_lower = content.lower()
        word_count = len(content.split())
        
        # Primary keyword density
        primary_count = content_lower.count(seo_params.primary_keyword.lower())
        primary_density = (primary_count / word_count) * 100 if word_count > 0 else 0
        
        if 1 <= primary_density <= 3:
            score += 30
        elif primary_density > 0:
            score += 20
        
        # Secondary keywords presence
        secondary_found = sum(1 for kw in seo_params.secondary_keywords if kw.lower() in content_lower)
        score += (secondary_found / len(seo_params.secondary_keywords)) * 30 if seo_params.secondary_keywords else 20
        
        # Content length (SEO-friendly)
        if 300 <= word_count <= 2000:
            score += 25
        elif word_count > 100:
            score += 15
        
        # Focus keyphrase in title/headings
        title = content[:100].lower()
        if seo_params.focus_keyphrase and seo_params.focus_keyphrase.lower() in title:
            score += 15
        
        return min(100, score)

    def _calculate_readability_score(self, content: str) -> int:
        """Calculate readability score using simple metrics"""
        if not content:
            return 0
        
        sentences = len(re.split(r'[.!?]+', content))
        words = len(content.split())
        characters = len(content.replace(' ', ''))
        
        if sentences == 0 or words == 0:
            return 0
        
        # Simple readability metrics
        avg_sentence_length = words / sentences
        avg_word_length = characters / words
        
        # Score based on ideal ranges
        score = 100
        
        # Sentence length (ideal: 15-20 words)
        if avg_sentence_length > 25:
            score -= 20
        elif avg_sentence_length > 20:
            score -= 10
        elif avg_sentence_length < 10:
            score -= 15
        
        # Word length (ideal: 4-6 characters)
        if avg_word_length > 7:
            score -= 15
        elif avg_word_length > 6:
            score -= 5
        elif avg_word_length < 3:
            score -= 10
        
        return max(0, score)

    async def _predict_engagement(self, content: GeneratedContent) -> float:
        """Predict engagement rate using AI analysis"""
        
        prediction_prompt = f"""
        Predict the engagement rate (0.0-1.0) for this content:
        
        Content Type: {content.brief.content_type.value}
        Platform: {content.brief.platform.value}
        Content: {content.content.get("content", "")[:500]}...
        Hashtags: {content.content.get("hashtags", [])}
        
        Consider:
        1. Content quality and value
        2. Platform best practices
        3. Trending topics alignment
        4. Call-to-action effectiveness
        5. Visual appeal (if applicable)
        
        Return prediction as JSON: {{"engagement_rate": 0.0-1.0, "reasoning": "explanation"}}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an engagement prediction expert."},
                    {"role": "user", "content": prediction_prompt}
                ],
                temperature=0.3,
                max_tokens=400
            )
            
            prediction = json.loads(response.choices[0].message.content)
            return prediction.get("engagement_rate", 0.5)
            
        except Exception as e:
            logger.error(f"Error predicting engagement: {str(e)}")
            return 0.6  # Default prediction

    async def _analyze_sentiment(self, content: str) -> float:
        """Analyze content sentiment"""
        sentiment_prompt = f"""
        Analyze the sentiment of this content (0.0 = very negative, 0.5 = neutral, 1.0 = very positive):
        
        Content: {content[:500]}...
        
        Return as JSON: {{"sentiment_score": 0.0-1.0, "sentiment_label": "positive/neutral/negative"}}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a sentiment analysis expert."},
                    {"role": "user", "content": sentiment_prompt}
                ],
                temperature=0.1,
                max_tokens=100
            )
            
            sentiment = json.loads(response.choices[0].message.content)
            return sentiment.get("sentiment_score", 0.5)
            
        except:
            return 0.5  # Neutral default

    async def _check_uniqueness(self, content: str) -> int:
        """Check content uniqueness (simplified implementation)"""
        # In a real implementation, this would check against existing content
        # and potentially use plagiarism detection APIs
        
        word_count = len(content.split())
        unique_words = len(set(content.lower().split()))
        
        if word_count == 0:
            return 0
        
        uniqueness_ratio = unique_words / word_count
        return int(uniqueness_ratio * 100)

    async def _check_brand_alignment(self, content: GeneratedContent, brand_guidelines: Dict[str, Any]) -> int:
        """Check alignment with brand guidelines"""
        
        alignment_prompt = f"""
        Check if this content aligns with brand guidelines:
        
        Content: {content.content.get("content", "")[:500]}...
        Tone: {content.brief.tone.value}
        
        Brand Guidelines: {json.dumps(brand_guidelines, indent=2)}
        
        Score alignment (0-100) based on:
        1. Tone consistency
        2. Brand voice alignment
        3. Value proposition consistency
        4. Brand terminology usage
        
        Return as JSON: {{"alignment_score": 0-100, "issues": [], "recommendations": []}}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a brand compliance expert."},
                    {"role": "user", "content": alignment_prompt}
                ],
                temperature=0.2,
                max_tokens=500
            )
            
            alignment = json.loads(response.choices[0].message.content)
            return alignment.get("alignment_score", 75)
            
        except:
            return 80  # Default score

    def _calculate_platform_optimization(self, content: GeneratedContent) -> int:
        """Calculate platform optimization score"""
        score = 0
        platform = content.brief.platform.value
        content_data = content.content
        
        template = self.template_library.get(f"{platform}_post", {})
        
        # Check length requirements
        content_length = len(content_data.get("content", ""))
        
        if platform == "twitter" and content_length <= 280:
            score += 30
        elif platform == "linkedin" and 500 <= content_length <= 3000:
            score += 30
        elif platform == "instagram" and content_data.get("visual_suggestions"):
            score += 30
        elif content_length > 0:
            score += 20
        
        # Check hashtag optimization
        hashtags = content_data.get("hashtags", [])
        optimal_hashtag_count = template.get("hashtag_limit", 5)
        
        if len(hashtags) <= optimal_hashtag_count and len(hashtags) > 0:
            score += 25
        elif len(hashtags) > 0:
            score += 15
        
        # Check CTA presence
        if content_data.get("cta"):
            score += 25
        
        # Check structure alignment
        if template.get("structure"):
            score += 20  # Assume good structure for now
        
        return min(100, score)

    async def _add_to_calendar(self, content_id: str, deadline: datetime):
        """Add content to content calendar"""
        date_key = deadline.strftime("%Y-%m-%d")
        
        if date_key not in self.content_calendar:
            self.content_calendar[date_key] = []
        
        self.content_calendar[date_key].append(content_id)

    async def get_content_calendar(self, start_date: datetime, end_date: datetime) -> Dict[str, List[Dict[str, Any]]]:
        """Get content calendar for date range"""
        calendar_data = {}
        current_date = start_date
        
        while current_date <= end_date:
            date_key = current_date.strftime("%Y-%m-%d")
            content_ids = self.content_calendar.get(date_key, [])
            
            calendar_data[date_key] = []
            for content_id in content_ids:
                content = self.content_store.get(content_id)
                if content:
                    calendar_data[date_key].append({
                        "id": content.id,
                        "title": content.brief.title,
                        "type": content.brief.content_type.value,
                        "platform": content.brief.platform.value,
                        "status": content.status.value,
                        "deadline": content.brief.deadline.isoformat() if content.brief.deadline else None
                    })
            
            current_date += timedelta(days=1)
        
        return calendar_data

    async def update_content(self, content_id: str, updates: Dict[str, Any]) -> GeneratedContent:
        """Update existing content"""
        content = self.content_store.get(content_id)
        if not content:
            raise ValueError(f"Content {content_id} not found")
        
        # Create new version
        if content.versions is None:
            content.versions = []
        
        content.versions.append({
            "version": len(content.versions) + 1,
            "content": content.content.copy(),
            "updated_at": content.updated_at.isoformat(),
            "changes": updates
        })
        
        # Apply updates
        for key, value in updates.items():
            if key in content.content:
                content.content[key] = value
        
        content.updated_at = datetime.now()
        content.status = ContentStatus.REVIEW  # Mark for review after updates
        
        # Re-analyze quality
        await self._analyze_content_quality(content)
        
        # Save updates
        if self.supabase:
            await self._save_content_to_db(content)
        
        return content

    async def approve_content(self, content_id: str, approval_notes: str = "") -> bool:
        """Approve content for publishing"""
        content = self.content_store.get(content_id)
        if not content:
            return False
        
        content.status = ContentStatus.APPROVED
        content.approval_notes = approval_notes
        content.updated_at = datetime.now()
        
        if self.supabase:
            await self._save_content_to_db(content)
        
        return True

    async def schedule_content(self, content_id: str, publish_date: datetime) -> bool:
        """Schedule content for publishing"""
        content = self.content_store.get(content_id)
        if not content or content.status != ContentStatus.APPROVED:
            return False
        
        content.status = ContentStatus.SCHEDULED
        content.brief.deadline = publish_date
        content.updated_at = datetime.now()
        
        # Add to calendar
        await self._add_to_calendar(content_id, publish_date)
        
        if self.supabase:
            await self._save_content_to_db(content)
        
        return True

    async def publish_content(self, content_id: str) -> bool:
        """Mark content as published"""
        content = self.content_store.get(content_id)
        if not content:
            return False
        
        content.status = ContentStatus.PUBLISHED
        content.published_at = datetime.now()
        content.updated_at = datetime.now()
        
        # Initialize performance tracking
        content.performance = ContentPerformance(last_updated=datetime.now())
        
        if self.supabase:
            await self._save_content_to_db(content)
        
        return True

    async def update_content_performance(self, content_id: str, performance_data: Dict[str, Any]) -> bool:
        """Update content performance metrics"""
        content = self.content_store.get(content_id)
        if not content:
            return False
        
        if not content.performance:
            content.performance = ContentPerformance()
        
        # Update metrics
        for key, value in performance_data.items():
            if hasattr(content.performance, key):
                setattr(content.performance, key, value)
        
        # Calculate engagement rate
        total_engagement = content.performance.likes + content.performance.shares + content.performance.comments
        if content.performance.views > 0:
            content.performance.engagement_rate = (total_engagement / content.performance.views) * 100
        
        # Calculate CTR
        if content.performance.views > 0:
            content.performance.ctr = (content.performance.clicks / content.performance.views) * 100
        
        content.performance.last_updated = datetime.now()
        content.updated_at = datetime.now()
        
        if self.supabase:
            await self._save_content_to_db(content)
        
        return True

    async def get_content_analytics(self) -> Dict[str, Any]:
        """Get comprehensive content analytics"""
        if not self.content_store:
            return {"message": "No content generated yet"}
        
        total_content = len(self.content_store)
        published_content = [c for c in self.content_store.values() if c.status == ContentStatus.PUBLISHED]
        
        # Quality metrics
        avg_seo = sum(c.quality.seo_score for c in self.content_store.values()) / total_content
        avg_readability = sum(c.quality.readability_score for c in self.content_store.values()) / total_content
        avg_engagement_pred = sum(c.quality.engagement_prediction for c in self.content_store.values()) / total_content
        
        # Performance metrics
        total_views = sum(c.performance.views for c in published_content if c.performance)
        total_engagement = sum(
            (c.performance.likes + c.performance.shares + c.performance.comments) 
            for c in published_content if c.performance
        )
        
        # Content type distribution
        type_distribution = {}
        for content in self.content_store.values():
            content_type = content.brief.content_type.value
            type_distribution[content_type] = type_distribution.get(content_type, 0) + 1
        
        # Platform distribution
        platform_distribution = {}
        for content in self.content_store.values():
            platform = content.brief.platform.value
            platform_distribution[platform] = platform_distribution.get(platform, 0) + 1
        
        # Top performing content
        top_content = sorted(
            [c for c in published_content if c.performance],
            key=lambda x: x.performance.engagement_rate,
            reverse=True
        )[:5]
        
        return {
            "total_content": total_content,
            "published_content": len(published_content),
            "pending_approval": len([c for c in self.content_store.values() if c.status == ContentStatus.REVIEW]),
            "scheduled_content": len([c for c in self.content_store.values() if c.status == ContentStatus.SCHEDULED]),
            "average_scores": {
                "seo": round(avg_seo, 1),
                "readability": round(avg_readability, 1),
                "engagement_prediction": round(avg_engagement_pred, 2)
            },
            "performance": {
                "total_views": total_views,
                "total_engagement": total_engagement,
                "avg_engagement_rate": round(total_engagement / max(total_views, 1) * 100, 2)
            },
            "distribution": {
                "by_type": type_distribution,
                "by_platform": platform_distribution
            },
            "top_performing": [
                {
                    "id": c.id,
                    "title": c.brief.title,
                    "engagement_rate": c.performance.engagement_rate
                }
                for c in top_content
            ]
        }

    async def generate_content_insights(self) -> Dict[str, Any]:
        """Generate AI-powered insights about content performance"""
        
        analytics = await self.get_content_analytics()
        
        insights_prompt = f"""
        Analyze this content performance data and provide insights:
        
        {json.dumps(analytics, indent=2)}
        
        Provide insights on:
        1. Content performance trends
        2. Top performing content types and platforms
        3. Quality improvement opportunities
        4. Strategic recommendations
        5. Content calendar optimization
        
        Return as structured JSON with insights and recommendations.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a content strategy analyst."},
                    {"role": "user", "content": insights_prompt}
                ],
                temperature=0.4,
                max_tokens=1200
            )
            
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            logger.error(f"Error generating insights: {str(e)}")
            return {"insights": "Unable to generate insights at this time"}

    async def bulk_create_content(self, briefs: List[ContentBrief]) -> List[Dict[str, Any]]:
        """Create multiple pieces of content in bulk"""
        results = []
        
        for brief in briefs:
            try:
                content = await self.create_content(brief)
                results.append({
                    "success": True,
                    "content_id": content.id,
                    "title": brief.title
                })
            except Exception as e:
                results.append({
                    "success": False,
                    "error": str(e),
                    "title": brief.title
                })
        
        return results

    async def _save_content_to_db(self, content: GeneratedContent):
        """Save content to database with proper serialization"""
        if not self.supabase:
            return
        
        try:
            content_data = {
                "id": content.id,
                "title": content.brief.title,
                "content_type": content.brief.content_type.value,
                "platform": content.brief.platform.value,
                "target_audience": content.brief.target_audience,
                "tone": content.brief.tone.value,
                "length": content.brief.length.value,
                "content": content.content,
                "status": content.status.value,
                "quality_scores": asdict(content.quality),
                "created_at": content.created_at.isoformat(),
                "updated_at": content.updated_at.isoformat(),
                "published_at": content.published_at.isoformat() if content.published_at else None,
                "approval_notes": content.approval_notes
            }
            
            # Add performance data if available
            if content.performance:
                content_data["performance"] = asdict(content.performance)
                if content_data["performance"]["last_updated"]:
                    content_data["performance"]["last_updated"] = content.performance.last_updated.isoformat()
            
            # Add SEO parameters if available
            if content.brief.seo_params:
                content_data["seo_params"] = asdict(content.brief.seo_params)
            
            self.supabase.table('generated_content').upsert(content_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving content to database: {str(e)}")

    def get_content(self, content_id: str) -> Optional[GeneratedContent]:
        """Get specific content by ID"""
        return self.content_store.get(content_id)

    def list_content(self, 
                    content_type: ContentType = None, 
                    platform: Platform = None,
                    status: ContentStatus = None,
                    limit: int = 50) -> List[GeneratedContent]:
        """List content with optional filtering"""
        content_list = list(self.content_store.values())
        
        # Apply filters
        if content_type:
            content_list = [c for c in content_list if c.brief.content_type == content_type]
        
        if platform:
            content_list = [c for c in content_list if c.brief.platform == platform]
        
        if status:
            content_list = [c for c in content_list if c.status == status]
        
        # Sort by creation date, newest first
        content_list.sort(key=lambda x: x.created_at, reverse=True)
        return content_list[:limit]

    def get_content_by_date_range(self, start_date: datetime, end_date: datetime) -> List[GeneratedContent]:
        """Get content created within date range"""
        return [
            content for content in self.content_store.values()
            if start_date <= content.created_at <= end_date
        ]

    async def clone_content(self, content_id: str, modifications: Dict[str, Any] = None) -> GeneratedContent:
        """Clone existing content with optional modifications"""
        original = self.content_store.get(content_id)
        if not original:
            raise ValueError(f"Content {content_id} not found")
        
        # Create new brief based on original
        new_brief = ContentBrief(
            title=f"Copy of {original.brief.title}",
            content_type=original.brief.content_type,
            platform=original.brief.platform,
            target_audience=original.brief.target_audience,
            key_messages=original.brief.key_messages.copy(),
            tone=original.brief.tone,
            length=original.brief.length,
            seo_params=original.brief.seo_params,
            cta=original.brief.cta,
            brand_guidelines=original.brief.brand_guidelines
        )
        
        # Apply modifications
        if modifications:
            for key, value in modifications.items():
                if hasattr(new_brief, key):
                    setattr(new_brief, key, value)
        
        # Create new content
        return await self.create_content(new_brief)
