import asyncio
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import pandas as pd
import numpy as np
from openai import AsyncOpenAI

logger = logging.getLogger(__name__)

class MetricType(Enum):
    CAMPAIGN_PERFORMANCE = "campaign_performance"
    LEAD_GENERATION = "lead_generation"
    CONTENT_ENGAGEMENT = "content_engagement"
    SOCIAL_MEDIA = "social_media"
    WEBSITE_TRAFFIC = "website_traffic"
    CONVERSION = "conversion"
    ROI = "roi"

class ReportType(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    CUSTOM = "custom"

class InsightLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class MetricData:
    metric_name: str
    value: float
    previous_value: float
    change_percent: float
    timestamp: datetime
    metadata: Dict[str, Any] = None

@dataclass
class Insight:
    id: str
    level: InsightLevel
    title: str
    description: str
    metric_type: MetricType
    impact_score: float
    recommendations: List[str]
    timestamp: datetime
    data_points: List[MetricData] = None

@dataclass
class Report:
    id: str
    title: str
    report_type: ReportType
    period_start: datetime
    period_end: datetime
    metrics: Dict[str, MetricData]
    insights: List[Insight]
    recommendations: List[str]
    created_at: datetime
    executive_summary: str = ""

class AnalyticsAgent:
    def __init__(self, openai_api_key: str, supabase_client=None):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.supabase = supabase_client
        self.reports_store: Dict[str, Report] = {}
        self.insights_store: Dict[str, Insight] = {}
        self.metric_history: Dict[str, List[MetricData]] = {}
        
    async def collect_all_metrics(self, 
                                campaign_agent=None,
                                lead_agent=None,
                                content_agent=None,
                                social_agent=None) -> Dict[str, MetricData]:
        """Collect metrics from all agents"""
        
        all_metrics = {}
        
        # Campaign metrics
        if campaign_agent:
            campaign_metrics = await self._collect_campaign_metrics(campaign_agent)
            all_metrics.update(campaign_metrics)
        
        # Lead generation metrics
        if lead_agent:
            lead_metrics = await self._collect_lead_metrics(lead_agent)
            all_metrics.update(lead_metrics)
        
        # Content metrics
        if content_agent:
            content_metrics = await self._collect_content_metrics(content_agent)
            all_metrics.update(content_metrics)
        
        # Social media metrics
        if social_agent:
            social_metrics = await self._collect_social_metrics(social_agent)
            all_metrics.update(social_metrics)
        
        # Store metric history
        for metric_name, metric_data in all_metrics.items():
            if metric_name not in self.metric_history:
                self.metric_history[metric_name] = []
            self.metric_history[metric_name].append(metric_data)
        
        return all_metrics

    async def _collect_campaign_metrics(self, campaign_agent) -> Dict[str, MetricData]:
        """Collect metrics from campaign agent"""
        metrics = {}
        
        try:
            # Get campaign overview
            campaigns = list(campaign_agent.campaigns_store.values())
            
            if not campaigns:
                return metrics
            
            # Active campaigns
            active_campaigns = [c for c in campaigns if c.status.value == "active"]
            metrics["active_campaigns"] = MetricData(
                metric_name="active_campaigns",
                value=len(active_campaigns),
                previous_value=0,  # Would calculate from history
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Total campaign spend
            total_spend = sum(c.budget_used for c in campaigns)
            metrics["total_campaign_spend"] = MetricData(
                metric_name="total_campaign_spend",
                value=total_spend,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Average conversion rate
            conversions = [c.metrics.get("conversion_rate", 0) for c in campaigns if c.metrics]
            avg_conversion = np.mean(conversions) if conversions else 0
            metrics["avg_conversion_rate"] = MetricData(
                metric_name="avg_conversion_rate",
                value=avg_conversion,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # ROI calculation
            total_revenue = sum(c.metrics.get("revenue", 0) for c in campaigns if c.metrics)
            roi = ((total_revenue - total_spend) / total_spend * 100) if total_spend > 0 else 0
            metrics["campaign_roi"] = MetricData(
                metric_name="campaign_roi",
                value=roi,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error collecting campaign metrics: {str(e)}")
        
        return metrics

    async def _collect_lead_metrics(self, lead_agent) -> Dict[str, MetricData]:
        """Collect metrics from lead generation agent"""
        metrics = {}
        
        try:
            leads = list(lead_agent.leads_store.values())
            
            if not leads:
                return metrics
            
            # Total leads
            metrics["total_leads"] = MetricData(
                metric_name="total_leads",
                value=len(leads),
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Qualified leads
            qualified_leads = [l for l in leads if l.status.value == "qualified"]
            metrics["qualified_leads"] = MetricData(
                metric_name="qualified_leads",
                value=len(qualified_leads),
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Lead quality score
            quality_scores = [l.score for l in leads if l.score > 0]
            avg_quality = np.mean(quality_scores) if quality_scores else 0
            metrics["avg_lead_quality"] = MetricData(
                metric_name="avg_lead_quality",
                value=avg_quality,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Conversion rate (qualified/total)
            conversion_rate = (len(qualified_leads) / len(leads) * 100) if leads else 0
            metrics["lead_conversion_rate"] = MetricData(
                metric_name="lead_conversion_rate",
                value=conversion_rate,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error collecting lead metrics: {str(e)}")
        
        return metrics

    async def _collect_content_metrics(self, content_agent) -> Dict[str, MetricData]:
        """Collect metrics from content agent"""
        metrics = {}
        
        try:
            content_items = list(content_agent.content_store.values())
            
            if not content_items:
                return metrics
            
            # Total content pieces
            metrics["total_content"] = MetricData(
                metric_name="total_content",
                value=len(content_items),
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Average SEO score
            seo_scores = [c.seo_score for c in content_items if c.seo_score > 0]
            avg_seo = np.mean(seo_scores) if seo_scores else 0
            metrics["avg_seo_score"] = MetricData(
                metric_name="avg_seo_score",
                value=avg_seo,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Average readability score
            readability_scores = [c.readability_score for c in content_items if c.readability_score > 0]
            avg_readability = np.mean(readability_scores) if readability_scores else 0
            metrics["avg_readability_score"] = MetricData(
                metric_name="avg_readability_score",
                value=avg_readability,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Average engagement prediction
            engagement_predictions = [c.engagement_prediction for c in content_items if c.engagement_prediction > 0]
            avg_engagement = np.mean(engagement_predictions) if engagement_predictions else 0
            metrics["avg_engagement_prediction"] = MetricData(
                metric_name="avg_engagement_prediction",
                value=avg_engagement,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error collecting content metrics: {str(e)}")
        
        return metrics

    async def _collect_social_metrics(self, social_agent) -> Dict[str, MetricData]:
        """Collect metrics from social media agent"""
        metrics = {}
        
        try:
            posts = list(social_agent.posts_store.values())
            engagement_items = list(social_agent.engagement_store.values())
            
            # Total posts
            metrics["total_social_posts"] = MetricData(
                metric_name="total_social_posts",
                value=len(posts),
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Published posts
            published_posts = [p for p in posts if p.status.value == "published"]
            metrics["published_posts"] = MetricData(
                metric_name="published_posts",
                value=len(published_posts),
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Total engagement
            total_engagement = len(engagement_items)
            metrics["total_engagement"] = MetricData(
                metric_name="total_engagement",
                value=total_engagement,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
            # Response rate
            responded_items = [e for e in engagement_items if e.responded]
            response_rate = (len(responded_items) / len(engagement_items) * 100) if engagement_items else 0
            metrics["engagement_response_rate"] = MetricData(
                metric_name="engagement_response_rate",
                value=response_rate,
                previous_value=0,
                change_percent=0,
                timestamp=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Error collecting social metrics: {str(e)}")
        
        return metrics

    async def generate_insights(self, metrics: Dict[str, MetricData]) -> List[Insight]:
        """Generate AI-powered insights from metrics"""
        
        insights = []
        
        # Analyze each metric for trends and anomalies
        for metric_name, metric_data in metrics.items():
            insight = await self._analyze_metric_for_insights(metric_name, metric_data)
            if insight:
                insights.append(insight)
                self.insights_store[insight.id] = insight
        
        # Generate cross-metric insights
        cross_insights = await self._generate_cross_metric_insights(metrics)
        insights.extend(cross_insights)
        
        # Sort by impact score
        insights.sort(key=lambda x: x.impact_score, reverse=True)
        
        return insights

    async def _analyze_metric_for_insights(self, metric_name: str, metric_data: MetricData) -> Optional[Insight]:
        """Analyze individual metric for insights"""
        
        # Get historical data for trend analysis
        history = self.metric_history.get(metric_name, [])
        if len(history) < 2:
            return None  # Need at least 2 data points for comparison
        
        # Calculate trend
        recent_values = [h.value for h in history[-5:]]  # Last 5 data points
        trend = np.polyfit(range(len(recent_values)), recent_values, 1)[0]
        
        # Determine significance
        avg_value = np.mean(recent_values)
        change_threshold = avg_value * 0.1  # 10% change threshold
        
        if abs(metric_data.change_percent) < 10:
            return None  # No significant change
        
        # Generate insight using AI
        insight_prompt = f"""
        Analyze this marketing metric and provide insights:
        
        Metric: {metric_name}
        Current Value: {metric_data.value}
        Previous Value: {metric_data.previous_value}
        Change: {metric_data.change_percent}%
        Trend: {'increasing' if trend > 0 else 'decreasing'}
        
        Provide insights in JSON format:
        {{
            "level": "critical/high/medium/low",
            "title": "Brief insight title",
            "description": "Detailed analysis",
            "impact_score": 0.0-1.0,
            "recommendations": ["action1", "action2", "action3"]
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a marketing analytics expert. Always respond with valid JSON."},
                    {"role": "user", "content": insight_prompt}
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            insight_data = json.loads(response.choices[0].message.content)
            
            insight = Insight(
                id=f"insight_{metric_name}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                level=InsightLevel(insight_data["level"]),
                title=insight_data["title"],
                description=insight_data["description"],
                metric_type=MetricType.CAMPAIGN_PERFORMANCE,  # Would determine dynamically
                impact_score=insight_data["impact_score"],
                recommendations=insight_data["recommendations"],
                timestamp=datetime.now(),
                data_points=[metric_data]
            )
            
            return insight
            
        except Exception as e:
            logger.error(f"Error generating insight for {metric_name}: {str(e)}")
            return None

    async def _generate_cross_metric_insights(self, metrics: Dict[str, MetricData]) -> List[Insight]:
        """Generate insights by analyzing relationships between metrics"""
        
        insights = []
        
        # Analyze correlations and patterns
        correlation_prompt = f"""
        Analyze these marketing metrics for cross-metric insights and correlations:
        
        Metrics:
        {json.dumps({name: {"value": m.value, "change": m.change_percent} for name, m in metrics.items()}, indent=2)}
        
        Identify:
        1. Strong correlations between metrics
        2. Potential cause-effect relationships
        3. Optimization opportunities
        4. Performance bottlenecks
        
        Provide up to 3 most important cross-metric insights in JSON array format:
        [
            {{
                "level": "critical/high/medium/low",
                "title": "Insight title",
                "description": "Detailed analysis",
                "impact_score": 0.0-1.0,
                "recommendations": ["action1", "action2"],
                "related_metrics": ["metric1", "metric2"]
            }}
        ]
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a marketing analytics expert specializing in cross-metric analysis."},
                    {"role": "user", "content": correlation_prompt}
                ],
                temperature=0.3,
                max_tokens=1000
            )
            
            insights_data = json.loads(response.choices[0].message.content)
            
            for insight_data in insights_data:
                insight = Insight(
                    id=f"cross_insight_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{len(insights)}",
                    level=InsightLevel(insight_data["level"]),
                    title=insight_data["title"],
                    description=insight_data["description"],
                    metric_type=MetricType.CAMPAIGN_PERFORMANCE,
                    impact_score=insight_data["impact_score"],
                    recommendations=insight_data["recommendations"],
                    timestamp=datetime.now()
                )
                insights.append(insight)
                self.insights_store[insight.id] = insight
            
        except Exception as e:
            logger.error(f"Error generating cross-metric insights: {str(e)}")
        
        return insights

    async def create_report(self, 
                          report_type: ReportType,
                          period_start: datetime,
                          period_end: datetime,
                          metrics: Dict[str, MetricData],
                          insights: List[Insight] = None) -> Report:
        """Create comprehensive analytics report"""
        
        report_id = f"report_{report_type.value}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        if insights is None:
            insights = await self.generate_insights(metrics)
        
        # Generate executive summary
        executive_summary = await self._generate_executive_summary(metrics, insights, report_type)
        
        # Generate recommendations
        recommendations = await self._generate_recommendations(metrics, insights)
        
        report = Report(
            id=report_id,
            title=f"{report_type.value.title()} Marketing Analytics Report",
            report_type=report_type,
            period_start=period_start,
            period_end=period_end,
            metrics=metrics,
            insights=insights,
            recommendations=recommendations,
            created_at=datetime.now(),
            executive_summary=executive_summary
        )
        
        self.reports_store[report_id] = report
        
        # Save to database
        if self.supabase:
            await self._save_report_to_db(report)
        
        logger.info(f"Created {report_type.value} report: {report_id}")
        return report

    async def _generate_executive_summary(self, 
                                        metrics: Dict[str, MetricData], 
                                        insights: List[Insight],
                                        report_type: ReportType) -> str:
        """Generate executive summary using AI"""
        
        # Prepare metrics summary
        key_metrics = {name: {"value": m.value, "change": m.change_percent} 
                      for name, m in list(metrics.items())[:10]}  # Top 10 metrics
        
        # Prepare insights summary
        top_insights = [{"title": i.title, "level": i.level.value, "impact": i.impact_score} 
                       for i in insights[:5]]
        
        summary_prompt = f"""
        Create an executive summary for this {report_type.value} marketing analytics report:
        
        Key Metrics:
        {json.dumps(key_metrics, indent=2)}
        
        Top Insights:
        {json.dumps(top_insights, indent=2)}
        
        Create a concise executive summary (2-3 paragraphs) that:
        1. Highlights overall performance
        2. Identifies key trends and changes
        3. Points to critical areas needing attention
        4. Maintains executive-level perspective
        
        Keep it professional, data-driven, and actionable.
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a marketing analytics executive reporting to senior leadership."},
                    {"role": "user", "content": summary_prompt}
                ],
                temperature=0.5,
                max_tokens=500
            )
            
            return response.choices[0].message.content.strip()
            
        except Exception as e:
            logger.error(f"Error generating executive summary: {str(e)}")
            return "Executive summary generation failed. Please review metrics and insights manually."

    async def _generate_recommendations(self, 
                                      metrics: Dict[str, MetricData], 
                                      insights: List[Insight]) -> List[str]:
        """Generate strategic recommendations"""
        
        # Collect all recommendations from insights
        all_recommendations = []
        for insight in insights:
            all_recommendations.extend(insight.recommendations)
        
        # Generate additional strategic recommendations
        strategic_prompt = f"""
        Based on these marketing metrics and insights, provide 5-7 strategic recommendations:
        
        Metrics Performance:
        {json.dumps({name: {"value": m.value, "change": m.change_percent} for name, m in metrics.items()}, indent=2)}
        
        Existing Recommendations:
        {json.dumps(all_recommendations, indent=2)}
        
        Provide strategic, high-level recommendations that:
        1. Address performance gaps
        2. Capitalize on opportunities
        3. Optimize resource allocation
        4. Improve overall marketing effectiveness
        
        Format as JSON array: ["recommendation1", "recommendation2", ...]
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a senior marketing strategist providing executive recommendations."},
                    {"role": "user", "content": strategic_prompt}
                ],
                temperature=0.6,
                max_tokens=800
            )
            
            recommendations = json.loads(response.choices[0].message.content)
            return recommendations
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
            return ["Review performance metrics and develop improvement strategies"]

    async def predict_performance(self, 
                                metric_name: str, 
                                days_ahead: int = 30) -> Dict[str, Any]:
        """Predict future performance using historical data"""
        
        history = self.metric_history.get(metric_name, [])
        if len(history) < 7:  # Need at least a week of data
            return {"error": "Insufficient historical data for prediction"}
        
        # Prepare time series data
        values = [h.value for h in history]
        timestamps = [h.timestamp for h in history]
        
        # Simple linear regression for trend prediction
        x = np.arange(len(values))
        coefficients = np.polyfit(x, values, 1)
        trend_line = np.poly1d(coefficients)
        
        # Predict future values
        future_x = np.arange(len(values), len(values) + days_ahead)
        predictions = trend_line(future_x)
        
        # Calculate confidence intervals (simplified)
        residuals = values - trend_line(x)
        std_error = np.std(residuals)
        confidence_interval = 1.96 * std_error  # 95% confidence
        
        # Generate prediction insights
        prediction_prompt = f"""
        Analyze this performance prediction for {metric_name}:
        
        Historical Values: {values[-10:]}  # Last 10 values
        Predicted Values: {predictions[:7].tolist()}  # Next 7 days
        Trend: {'increasing' if coefficients[0] > 0 else 'decreasing'}
        
        Provide insights about:
        1. Prediction confidence
        2. Potential factors affecting the forecast
        3. Recommendations for improving the metric
        
        Format as JSON:
        {{
            "confidence": "high/medium/low",
            "key_factors": ["factor1", "factor2"],
            "recommendations": ["rec1", "rec2"]
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a predictive analytics expert."},
                    {"role": "user", "content": prediction_prompt}
                ],
                temperature=0.3,
                max_tokens=400
            )
            
            analysis = json.loads(response.choices[0].message.content)
            
            return {
                "metric_name": metric_name,
                "predictions": predictions.tolist(),
                "confidence_interval": confidence_interval,
                "trend_slope": coefficients[0],
                "analysis": analysis,
                "prediction_dates": [(datetime.now() + timedelta(days=i)).isoformat() 
                                   for i in range(1, days_ahead + 1)]
            }
            
        except Exception as e:
            logger.error(f"Error generating prediction analysis: {str(e)}")
            return {
                "metric_name": metric_name,
                "predictions": predictions.tolist(),
                "confidence_interval": confidence_interval,
                "trend_slope": coefficients[0]
            }

    async def create_dashboard_data(self) -> Dict[str, Any]:
        """Create comprehensive dashboard data"""
        
        # Collect latest metrics from all agents (would need agent references)
        current_metrics = {}  # Placeholder
        
        # Get recent insights
        recent_insights = sorted(
            [i for i in self.insights_store.values()],
            key=lambda x: x.timestamp,
            reverse=True
        )[:10]
        
        # Get latest reports
        recent_reports = sorted(
            [r for r in self.reports_store.values()],
            key=lambda x: x.created_at,
            reverse=True
        )[:5]
        
        # Calculate KPI summaries
        kpi_summary = await self._calculate_kpi_summary(current_metrics)
        
        return {
            "kpi_summary": kpi_summary,
            "recent_insights": [
                {
                    "id": i.id,
                    "title": i.title,
                    "level": i.level.value,
                    "impact_score": i.impact_score,
                    "timestamp": i.timestamp.isoformat()
                }
                for i in recent_insights
            ],
            "recent_reports": [
                {
                    "id": r.id,
                    "title": r.title,
                    "type": r.report_type.value,
                    "created_at": r.created_at.isoformat()
                }
                for r in recent_reports
            ],
            "metric_trends": await self._get_metric_trends(),
            "alerts": await self._get_performance_alerts()
        }

    async def _calculate_kpi_summary(self, metrics: Dict[str, MetricData]) -> Dict[str, Any]:
        """Calculate high-level KPI summary"""
        
        # Define key KPIs and their calculations
        kpis = {
            "total_campaigns": 0,
            "total_leads": 0,
            "avg_conversion_rate": 0,
            "total_content_pieces": 0,
            "social_engagement_rate": 0,
            "overall_roi": 0
        }
        
        # Calculate from available metrics
        for metric_name, metric_data in metrics.items():
            if "campaign" in metric_name and "total" in metric_name:
                kpis["total_campaigns"] = metric_data.value
            elif "lead" in metric_name and "total" in metric_name:
                kpis["total_leads"] = metric_data.value
            elif "conversion_rate" in metric_name:
                kpis["avg_conversion_rate"] = metric_data.value
            elif "content" in metric_name and "total" in metric_name:
                kpis["total_content_pieces"] = metric_data.value
            elif "engagement_rate" in metric_name:
                kpis["social_engagement_rate"] = metric_data.value
            elif "roi" in metric_name:
                kpis["overall_roi"] = metric_data.value
        
        return kpis

    async def _get_metric_trends(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get trend data for key metrics"""
        
        trends = {}
        
        for metric_name, history in self.metric_history.items():
            if len(history) >= 7:  # At least a week of data
                recent_history = history[-30:]  # Last 30 data points
                trends[metric_name] = [
                    {
                        "timestamp": h.timestamp.isoformat(),
                        "value": h.value
                    }
                    for h in recent_history
                ]
        
        return trends

    async def _get_performance_alerts(self) -> List[Dict[str, Any]]:
        """Get performance alerts and warnings"""
        
        alerts = []
        
        # Check for critical insights
        critical_insights = [i for i in self.insights_store.values() 
                           if i.level == InsightLevel.CRITICAL]
        
        for insight in critical_insights:
            alerts.append({
                "type": "critical_insight",
                "title": insight.title,
                "description": insight.description,
                "timestamp": insight.timestamp.isoformat()
            })
        
        # Check for metric anomalies
        for metric_name, history in self.metric_history.items():
            if len(history) >= 10:
                recent_values = [h.value for h in history[-10:]]
                latest_value = recent_values[-1]
                avg_value = np.mean(recent_values[:-1])
                std_value = np.std(recent_values[:-1])
                
                # Check for anomalies (value beyond 2 standard deviations)
                if abs(latest_value - avg_value) > 2 * std_value:
                    alerts.append({
                        "type": "anomaly",
                        "title": f"Anomaly detected in {metric_name}",
                        "description": f"Latest value ({latest_value:.2f}) significantly differs from recent average ({avg_value:.2f})",
                        "timestamp": datetime.now().isoformat()
                    })
        
        return alerts[:10]  # Limit to 10 most recent alerts

    async def _save_report_to_db(self, report: Report):
        """Save report to database"""
        if not self.supabase:
            return
        
        try:
            report_data = {
                "id": report.id,
                "title": report.title,
                "report_type": report.report_type.value,
                "period_start": report.period_start.isoformat(),
                "period_end": report.period_end.isoformat(),
                "metrics": {name: asdict(metric) for name, metric in report.metrics.items()},
                "insights": [asdict(insight) for insight in report.insights],
                "recommendations": report.recommendations,
                "executive_summary": report.executive_summary,
                "created_at": report.created_at.isoformat()
            }
            
            # Convert datetime objects and enums in nested structures
            for metric_name, metric_dict in report_data["metrics"].items():
                metric_dict["timestamp"] = metric_dict["timestamp"].isoformat() if isinstance(metric_dict["timestamp"], datetime) else metric_dict["timestamp"]
            
            for insight_dict in report_data["insights"]:
                insight_dict["level"] = insight_dict["level"].value if hasattr(insight_dict["level"], 'value') else insight_dict["level"]
                insight_dict["metric_type"] = insight_dict["metric_type"].value if hasattr(insight_dict["metric_type"], 'value') else insight_dict["metric_type"]
                insight_dict["timestamp"] = insight_dict["timestamp"].isoformat() if isinstance(insight_dict["timestamp"], datetime) else insight_dict["timestamp"]
            
            self.supabase.table('analytics_reports').upsert(report_data).execute()
            
        except Exception as e:
            logger.error(f"Error saving report to database: {str(e)}")

    def get_report(self, report_id: str) -> Optional[Report]:
        """Get specific report by ID"""
        return self.reports_store.get(report_id)

    def list_reports(self, report_type: ReportType = None, limit: int = 10) -> List[Report]:
        """List reports with optional filtering"""
        reports = list(self.reports_store.values())
        
        if report_type:
            reports = [r for r in reports if r.report_type == report_type]
        
        # Sort by creation date, newest first
        reports.sort(key=lambda x: x.created_at, reverse=True)
        return reports[:limit]

    def get_insight(self, insight_id: str) -> Optional[Insight]:
        """Get specific insight by ID"""
        return self.insights_store.get(insight_id)

    def list_insights(self, level: InsightLevel = None, limit: int = 20) -> List[Insight]:
        """List insights with optional filtering"""
        insights = list(self.insights_store.values())
        
        if level:
            insights = [i for i in insights if i.level == level]
        
        # Sort by impact score and timestamp
        insights.sort(key=lambda x: (x.impact_score, x.timestamp), reverse=True)
        return insights[:limit]
