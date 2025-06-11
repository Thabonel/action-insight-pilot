
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
import uuid
import statistics

logger = logging.getLogger(__name__)

@dataclass
class ABTestVariant:
    id: str
    content: str
    media_urls: List[str]
    hashtags: List[str]
    metrics: Dict[str, float]
    conversion_rate: float
    roi: float
    cost: float
    revenue: float

@dataclass
class ABTest:
    id: str
    name: str
    platform: str
    variants: List[ABTestVariant]
    start_date: datetime
    end_date: Optional[datetime]
    status: str
    winning_variant_id: Optional[str]
    confidence_level: float
    sample_size: int

class ABTestingService:
    """Service for A/B testing social media posts with ROI tracking"""
    
    def __init__(self):
        self.logger = logger
        self.active_tests = {}
        self.completed_tests = {}
    
    async def create_ab_test(self, test_name: str, platform: str, variants: List[Dict[str, Any]], 
                           duration_hours: int = 24) -> Dict[str, Any]:
        """Create a new A/B test with multiple variants"""
        try:
            test_id = str(uuid.uuid4())
            
            # Convert variant dictionaries to ABTestVariant objects
            test_variants = []
            for i, variant_data in enumerate(variants):
                variant = ABTestVariant(
                    id=f"{test_id}_variant_{i}",
                    content=variant_data.get("content", ""),
                    media_urls=variant_data.get("media_urls", []),
                    hashtags=variant_data.get("hashtags", []),
                    metrics={
                        "impressions": 0,
                        "likes": 0,
                        "comments": 0,
                        "shares": 0,
                        "clicks": 0,
                        "saves": 0
                    },
                    conversion_rate=0.0,
                    roi=0.0,
                    cost=variant_data.get("cost", 10.0),  # Default cost per variant
                    revenue=0.0
                )
                test_variants.append(variant)
            
            # Create test
            ab_test = ABTest(
                id=test_id,
                name=test_name,
                platform=platform,
                variants=test_variants,
                start_date=datetime.now(),
                end_date=datetime.now() + timedelta(hours=duration_hours),
                status="running",
                winning_variant_id=None,
                confidence_level=0.0,
                sample_size=len(test_variants) * 1000  # Estimated sample size
            )
            
            self.active_tests[test_id] = ab_test
            
            return {
                "success": True,
                "test_id": test_id,
                "test": asdict(ab_test),
                "message": f"A/B test '{test_name}' created with {len(variants)} variants"
            }
            
        except Exception as e:
            self.logger.error(f"Error creating A/B test: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def update_variant_metrics(self, test_id: str, variant_id: str, 
                                   metrics_update: Dict[str, Any]) -> Dict[str, Any]:
        """Update metrics for a specific variant"""
        try:
            if test_id not in self.active_tests:
                return {"success": False, "error": "Test not found"}
            
            test = self.active_tests[test_id]
            variant = next((v for v in test.variants if v.id == variant_id), None)
            
            if not variant:
                return {"success": False, "error": "Variant not found"}
            
            # Update metrics
            for metric, value in metrics_update.items():
                if metric in variant.metrics:
                    variant.metrics[metric] += value
            
            # Calculate conversion rate and ROI
            clicks = variant.metrics.get("clicks", 0)
            impressions = variant.metrics.get("impressions", 1)
            conversions = metrics_update.get("conversions", 0)
            revenue_update = metrics_update.get("revenue", 0)
            
            variant.revenue += revenue_update
            
            if clicks > 0:
                variant.conversion_rate = (conversions / clicks) * 100
            
            if variant.cost > 0:
                variant.roi = ((variant.revenue - variant.cost) / variant.cost) * 100
            
            return {
                "success": True,
                "variant_id": variant_id,
                "updated_metrics": variant.metrics,
                "conversion_rate": variant.conversion_rate,
                "roi": variant.roi
            }
            
        except Exception as e:
            self.logger.error(f"Error updating variant metrics: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def analyze_test_results(self, test_id: str) -> Dict[str, Any]:
        """Analyze A/B test results and determine statistical significance"""
        try:
            if test_id not in self.active_tests:
                return {"success": False, "error": "Test not found"}
            
            test = self.active_tests[test_id]
            
            if len(test.variants) < 2:
                return {"success": False, "error": "Need at least 2 variants for analysis"}
            
            # Calculate engagement rates for each variant
            variant_performance = []
            
            for variant in test.variants:
                total_engagement = (
                    variant.metrics.get("likes", 0) +
                    variant.metrics.get("comments", 0) +
                    variant.metrics.get("shares", 0) +
                    variant.metrics.get("clicks", 0)
                )
                
                impressions = variant.metrics.get("impressions", 1)
                engagement_rate = (total_engagement / impressions) * 100
                
                variant_performance.append({
                    "variant_id": variant.id,
                    "engagement_rate": engagement_rate,
                    "conversion_rate": variant.conversion_rate,
                    "roi": variant.roi,
                    "total_engagement": total_engagement,
                    "revenue": variant.revenue,
                    "cost": variant.cost,
                    "content_preview": variant.content[:100] + "..." if len(variant.content) > 100 else variant.content
                })
            
            # Sort by ROI (primary metric)
            variant_performance.sort(key=lambda x: x["roi"], reverse=True)
            
            # Calculate statistical significance (simplified)
            best_variant = variant_performance[0]
            second_best = variant_performance[1] if len(variant_performance) > 1 else None
            
            confidence_level = 0.0
            if second_best:
                # Simple confidence calculation based on difference in ROI
                roi_difference = best_variant["roi"] - second_best["roi"]
                confidence_level = min(95.0, max(50.0, roi_difference * 2))
            
            test.confidence_level = confidence_level
            test.winning_variant_id = best_variant["variant_id"]
            
            # Generate insights
            insights = self._generate_test_insights(variant_performance)
            
            return {
                "success": True,
                "test_id": test_id,
                "test_name": test.name,
                "status": test.status,
                "winning_variant": best_variant,
                "all_variants": variant_performance,
                "confidence_level": confidence_level,
                "insights": insights,
                "recommendations": self._generate_recommendations(variant_performance)
            }
            
        except Exception as e:
            self.logger.error(f"Error analyzing test results: {str(e)}")
            return {"success": False, "error": str(e)}
    
    def _generate_test_insights(self, variant_performance: List[Dict[str, Any]]) -> List[Dict[str, str]]:
        """Generate insights from test performance data"""
        insights = []
        
        if len(variant_performance) < 2:
            return insights
        
        best = variant_performance[0]
        worst = variant_performance[-1]
        
        # ROI insights
        roi_diff = best["roi"] - worst["roi"]
        if roi_diff > 50:
            insights.append({
                "type": "roi",
                "message": f"Best variant achieved {roi_diff:.1f}% higher ROI than worst variant",
                "impact": "high"
            })
        
        # Engagement insights
        engagement_rates = [v["engagement_rate"] for v in variant_performance]
        avg_engagement = statistics.mean(engagement_rates)
        
        if best["engagement_rate"] > avg_engagement * 1.5:
            insights.append({
                "type": "engagement",
                "message": f"Winning variant has {best['engagement_rate']:.1f}% engagement rate, significantly above average",
                "impact": "medium"
            })
        
        # Conversion insights
        if best["conversion_rate"] > 5.0:
            insights.append({
                "type": "conversion",
                "message": f"High conversion rate of {best['conversion_rate']:.1f}% indicates strong call-to-action",
                "impact": "high"
            })
        
        return insights
    
    def _generate_recommendations(self, variant_performance: List[Dict[str, Any]]) -> List[str]:
        """Generate actionable recommendations based on test results"""
        recommendations = []
        
        if not variant_performance:
            return recommendations
        
        best = variant_performance[0]
        
        # ROI-based recommendations
        if best["roi"] > 100:
            recommendations.append("Scale up the winning variant - it's highly profitable")
        elif best["roi"] > 0:
            recommendations.append("Optimize the winning variant further to improve ROI")
        else:
            recommendations.append("Consider revising content strategy - current variants show negative ROI")
        
        # Engagement recommendations
        if best["engagement_rate"] < 2.0:
            recommendations.append("Focus on creating more engaging content - current engagement is below industry average")
        
        # Conversion recommendations
        if best["conversion_rate"] < 1.0:
            recommendations.append("Strengthen call-to-action and landing page to improve conversion rates")
        
        return recommendations
    
    async def get_test_summary(self, test_id: str) -> Dict[str, Any]:
        """Get summary of A/B test performance"""
        try:
            test = self.active_tests.get(test_id) or self.completed_tests.get(test_id)
            if not test:
                return {"success": False, "error": "Test not found"}
            
            total_spend = sum(variant.cost for variant in test.variants)
            total_revenue = sum(variant.revenue for variant in test.variants)
            overall_roi = ((total_revenue - total_spend) / total_spend * 100) if total_spend > 0 else 0
            
            return {
                "success": True,
                "test_summary": {
                    "test_id": test.id,
                    "test_name": test.name,
                    "platform": test.platform,
                    "duration": str(test.end_date - test.start_date) if test.end_date else "Ongoing",
                    "variants_count": len(test.variants),
                    "total_spend": total_spend,
                    "total_revenue": total_revenue,
                    "overall_roi": overall_roi,
                    "winning_variant_id": test.winning_variant_id,
                    "confidence_level": test.confidence_level,
                    "status": test.status
                }
            }
            
        except Exception as e:
            self.logger.error(f"Error getting test summary: {str(e)}")
            return {"success": False, "error": str(e)}
    
    async def finalize_test(self, test_id: str) -> Dict[str, Any]:
        """Finalize A/B test and move to completed tests"""
        try:
            if test_id not in self.active_tests:
                return {"success": False, "error": "Active test not found"}
            
            test = self.active_tests[test_id]
            test.status = "completed"
            test.end_date = datetime.now()
            
            # Move to completed tests
            self.completed_tests[test_id] = test
            del self.active_tests[test_id]
            
            # Get final analysis
            analysis = await self.analyze_test_results(test_id)
            
            return {
                "success": True,
                "message": f"Test '{test.name}' finalized",
                "final_analysis": analysis
            }
            
        except Exception as e:
            self.logger.error(f"Error finalizing test: {str(e)}")
            return {"success": False, "error": str(e)}
