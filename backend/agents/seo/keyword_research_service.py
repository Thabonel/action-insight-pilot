"""
Keyword Research Service for SEO analysis
Integrates with external APIs to provide keyword metrics
"""
import asyncio
import aiohttp
import logging
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import json

logger = logging.getLogger(__name__)

@dataclass
class KeywordMetrics:
    keyword: str
    search_volume: int
    difficulty: float
    cpc: float
    competition: str
    serp_features: List[str]
    trend_data: List[Dict[str, Any]]

class KeywordResearchService:
    """Service for keyword research and SEO metrics"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def research_keywords(self, seed_keywords: List[str], location: str = "US") -> List[KeywordMetrics]:
        """Research keywords and return metrics"""
        try:
            # For demo purposes, return mock data
            # In production, integrate with APIs like DataForSEO, SEMrush, etc.
            results = []
            
            for keyword in seed_keywords:
                # Mock keyword data
                mock_metrics = KeywordMetrics(
                    keyword=keyword,
                    search_volume=self._generate_mock_volume(keyword),
                    difficulty=self._generate_mock_difficulty(keyword),
                    cpc=self._generate_mock_cpc(keyword),
                    competition="Medium",
                    serp_features=["Featured Snippet", "People Also Ask", "Images"],
                    trend_data=self._generate_mock_trends()
                )
                results.append(mock_metrics)
                
                # Generate related keywords
                related = await self._get_related_keywords(keyword)
                results.extend(related)
            
            return results
            
        except Exception as e:
            logger.error(f"Error researching keywords: {e}")
            return []
    
    async def get_competitor_keywords(self, competitor_domain: str) -> List[KeywordMetrics]:
        """Get keywords that competitors are ranking for"""
        try:
            # Mock competitor keyword data
            competitor_keywords = [
                f"{competitor_domain.split('.')[0]} review",
                f"{competitor_domain.split('.')[0]} alternative",
                f"best {competitor_domain.split('.')[0]}",
                f"{competitor_domain.split('.')[0]} pricing",
                f"{competitor_domain.split('.')[0]} features"
            ]
            
            results = []
            for keyword in competitor_keywords:
                mock_metrics = KeywordMetrics(
                    keyword=keyword,
                    search_volume=self._generate_mock_volume(keyword),
                    difficulty=self._generate_mock_difficulty(keyword),
                    cpc=self._generate_mock_cpc(keyword),
                    competition="High",
                    serp_features=["Ads", "Local Pack", "Reviews"],
                    trend_data=self._generate_mock_trends()
                )
                results.append(mock_metrics)
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting competitor keywords: {e}")
            return []
    
    async def get_trending_keywords(self, industry: str = "marketing") -> List[KeywordMetrics]:
        """Get trending keywords in a specific industry"""
        try:
            # Mock trending keywords
            trending_keywords = [
                f"{industry} automation",
                f"AI {industry}",
                f"{industry} trends 2024",
                f"digital {industry}",
                f"{industry} tools",
                f"{industry} strategy",
                f"{industry} analytics",
                f"{industry} ROI"
            ]
            
            results = []
            for keyword in trending_keywords:
                mock_metrics = KeywordMetrics(
                    keyword=keyword,
                    search_volume=self._generate_mock_volume(keyword) * 2,  # Trending = higher volume
                    difficulty=self._generate_mock_difficulty(keyword),
                    cpc=self._generate_mock_cpc(keyword),
                    competition="Medium",
                    serp_features=["News", "Videos", "Featured Snippet"],
                    trend_data=self._generate_trending_data()
                )
                results.append(mock_metrics)
            
            return results
            
        except Exception as e:
            logger.error(f"Error getting trending keywords: {e}")
            return []
    
    async def _get_related_keywords(self, seed_keyword: str) -> List[KeywordMetrics]:
        """Get related keywords for a seed keyword"""
        related_terms = [
            f"{seed_keyword} tips",
            f"{seed_keyword} guide",
            f"best {seed_keyword}",
            f"{seed_keyword} strategy",
            f"how to {seed_keyword}"
        ]
        
        results = []
        for term in related_terms[:3]:  # Limit to 3 related terms
            mock_metrics = KeywordMetrics(
                keyword=term,
                search_volume=self._generate_mock_volume(term) // 2,  # Related = lower volume
                difficulty=self._generate_mock_difficulty(term),
                cpc=self._generate_mock_cpc(term),
                competition="Low",
                serp_features=["Featured Snippet", "People Also Ask"],
                trend_data=self._generate_mock_trends()
            )
            results.append(mock_metrics)
        
        return results
    
    def _generate_mock_volume(self, keyword: str) -> int:
        """Generate realistic mock search volume"""
        # Use keyword length to generate pseudo-random but consistent volumes
        base_volume = abs(hash(keyword)) % 100000
        return max(100, base_volume)
    
    def _generate_mock_difficulty(self, keyword: str) -> float:
        """Generate realistic mock keyword difficulty (0-100)"""
        difficulty = abs(hash(keyword + "diff")) % 100
        return round(difficulty / 100 * 100, 1)
    
    def _generate_mock_cpc(self, keyword: str) -> float:
        """Generate realistic mock CPC"""
        cpc = abs(hash(keyword + "cpc")) % 1000
        return round(cpc / 100, 2)
    
    def _generate_mock_trends(self) -> List[Dict[str, Any]]:
        """Generate mock trend data for the last 12 months"""
        import random
        trends = []
        for i in range(12):
            trends.append({
                "month": f"2024-{str(i+1).zfill(2)}",
                "volume": random.randint(80, 120),  # Relative volume (100 = baseline)
                "competition": random.uniform(0.3, 0.8)
            })
        return trends
    
    def _generate_trending_data(self) -> List[Dict[str, Any]]:
        """Generate mock trending data (upward trend)"""
        import random
        trends = []
        base_volume = 100
        for i in range(12):
            base_volume += random.randint(5, 15)  # Trending = growing volume
            trends.append({
                "month": f"2024-{str(i+1).zfill(2)}",
                "volume": min(base_volume, 200),  # Cap at 200%
                "competition": random.uniform(0.4, 0.9)
            })
        return trends
    
    def to_dict(self, metrics: KeywordMetrics) -> Dict[str, Any]:
        """Convert KeywordMetrics to dictionary"""
        return {
            "keyword": metrics.keyword,
            "search_volume": metrics.search_volume,
            "difficulty": metrics.difficulty,
            "cpc": metrics.cpc,
            "competition": metrics.competition,
            "serp_features": metrics.serp_features,
            "trend_data": metrics.trend_data
        }