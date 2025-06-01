# agents/lead_generation_agent.py

import asyncio
import json
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass, asdict
from enum import Enum
import httpx
from openai import AsyncOpenAI
import logging
from bs4 import BeautifulSoup
import csv
import io
from urllib.parse import urljoin, urlparse
import time
import hashlib
from collections import defaultdict

logger = logging.getLogger(__name__)

class LeadStatus(Enum):
    NEW = "new"
    QUALIFIED = "qualified"
    CONTACTED = "contacted"
    INTERESTED = "interested"
    NOT_INTERESTED = "not_interested"
    CONVERTED = "converted"
    UNSUBSCRIBED = "unsubscribed"

class DataSource(Enum):
    WEBSITE_SCRAPING = "website_scraping"
    LINKEDIN = "linkedin"
    GOOGLE_SEARCH = "google_search"
    SOCIAL_MEDIA = "social_media"
    DATABASE = "database"
    API = "api"
    MANUAL_IMPORT = "manual_import"

class LeadQuality(Enum):
    HOT = "hot"          # 80-100 score
    WARM = "warm"        # 60-79 score
    COLD = "cold"        # 40-59 score
    UNQUALIFIED = "unqualified"  # 0-39 score

@dataclass
class LeadCriteria:
    industry: Optional[str] = None
    company_size: Optional[str] = None  # "1-10", "11-50", "51-200", "201-1000", "1000+"
    location: Optional[str] = None
    job_titles: Optional[List[str]] = None
    keywords: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    revenue_range: Optional[str] = None
    exclude_competitors: bool = True
    min_employees: Optional[int] = None
    max_employees: Optional[int] = None
    department: Optional[str] = None
    seniority_level: Optional[str] = None

@dataclass
class Lead:
    id: str
    first_name: str
    last_name: str
    email: Optional[str]
    phone: Optional[str]
    job_title: Optional[str]
    company: str
    company_website: Optional[str]
    company_size: Optional[str]
    industry: Optional[str]
    location: Optional[str]
    linkedin_url: Optional[str]
    source: DataSource
    quality_score: float
    quality_level: LeadQuality
    status: LeadStatus
    notes: Optional[str]
    tags: List[str]
    contact_attempts: int
    last_contacted: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    custom_fields: Dict[str, Any]
    confidence_score: float = 0.0  # Confidence in data accuracy
    email_verified: bool = False
    phone_verified: bool = False
    social_profiles: Dict[str, str] = None

@dataclass
class SearchTask:
    id: str
    name: str
    criteria: LeadCriteria
    sources: List[DataSource]
    max_leads: int
    status: str  # "pending", "running", "completed", "failed"
    progress: float
    leads_found: int
    created_at: datetime
    completed_at: Optional[datetime]
    results_summary: Dict[str, Any]
    error_log: List[str] = None

@dataclass
class LeadEnrichment:
    """Data structure for enriched lead information"""
    company_info: Dict[str, Any]
    contact_info: Dict[str, Any]
    social_profiles: Dict[str, str]
    technographics: List[str]
    company_news: List[Dict[str, Any]]
    enrichment_date: datetime

class LeadGenerationAgent:
    def __init__(self, openai_api_key: str, integrations: Dict[str, str], supabase_client=None):
        self.openai_client = AsyncOpenAI(api_key=openai_api_key)
        self.integrations = integrations
        self.supabase = supabase_client
        self.leads: Dict[str, Lead] = {}
        self.search_tasks: Dict[str, SearchTask] = {}
        self.enrichment_cache: Dict[str, LeadEnrichment] = {}
        self.logger = logging.getLogger(__name__)
        
        # Rate limiting
        self.rate_limits = {
            'website_scraping': 1.0,  # seconds between requests
            'linkedin': 2.0,
            'google_search': 0.5,
            'apollo': 0.1,
            'zoominfo': 0.2
        }
        
        # Initialize scrapers and data sources
        self.web_scraper = WebScraper()
        self.linkedin_scraper = LinkedInScraper(integrations.get('linkedin_api_key'))
        self.google_search = GoogleSearchClient(integrations.get('google_search_api_key'))
        self.apollo_client = ApolloClient(integrations.get('apollo_api_key'))
        self.zoominfo_client = ZoomInfoClient(integrations.get('zoominfo_api_key'))
        
        # Email verification service
        self.email_validator = EmailValidator(integrations.get('email_validation_api_key'))

    async def create_search_task(self, 
                               name: str,
                               criteria: LeadCriteria,
                               sources: List[DataSource],
                               max_leads: int = 100) -> SearchTask:
        """Create a new lead generation search task"""
        
        task_id = f"search_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        task = SearchTask(
            id=task_id,
            name=name,
            criteria=criteria,
            sources=sources,
            max_leads=max_leads,
            status="pending",
            progress=0.0,
            leads_found=0,
            created_at=datetime.now(),
            completed_at=None,
            results_summary={},
            error_log=[]
        )
        
        self.search_tasks[task_id] = task
        
        # Start the search process
        asyncio.create_task(self._execute_search_task(task_id))
        
        # Save to database
        if self.supabase:
            await self._save_search_task_to_db(task)
        
        self.logger.info(f"Created search task {task_id}: {name}")
        return task

    async def _execute_search_task(self, task_id: str):
        """Execute lead generation search task"""
        
        task = self.search_tasks[task_id]
        task.status = "running"
        
        try:
            all_leads = []
            total_sources = len(task.sources)
            
            for i, source in enumerate(task.sources):
                self.logger.info(f"Searching {source.value} for leads...")
                
                # Update progress
                task.progress = (i / total_sources) * 80  # Leave 20% for processing
                
                try:
                    source_leads = await self._search_source(source, task.criteria, task.max_leads // total_sources)
                    all_leads.extend(source_leads)
                    
                    self.logger.info(f"Found {len(source_leads)} leads from {source.value}")
                    
                    # Rate limiting
                    if source.value in self.rate_limits:
                        await asyncio.sleep(self.rate_limits[source.value])
                    
                except Exception as e:
                    error_msg = f"Error searching {source.value}: {str(e)}"
                    self.logger.error(error_msg)
                    task.error_log.append(error_msg)
                    continue
            
            # Processing phase
            task.progress = 85
            
            # Deduplicate leads
            unique_leads = await self._deduplicate_leads(all_leads)
            self.logger.info(f"After deduplication: {len(unique_leads)} unique leads")
            
            # Score and qualify leads
            task.progress = 90
            qualified_leads = []
            
            for lead in unique_leads:
                if len(qualified_leads) >= task.max_leads:
                    break
                    
                # AI-powered lead scoring
                score = await self._score_lead(lead, task.criteria)
                lead.quality_score = score
                lead.quality_level = self._get_quality_level(score)
                
                # Only include qualified leads
                if lead.quality_level != LeadQuality.UNQUALIFIED:
                    # Store lead
                    self.leads[lead.id] = lead
                    qualified_leads.append(lead)
                    
                    # Save to database
                    if self.supabase:
                        await self._save_lead_to_db(lead)
            
            # Final processing
            task.progress = 95
            
            # Generate results summary
            task.results_summary = await self._generate_results_summary(qualified_leads, task.criteria)
            
            # Update task completion
            task.status = "completed"
            task.progress = 100.0
            task.leads_found = len(qualified_leads)
            task.completed_at = datetime.now()
            
            # Update database
            if self.supabase:
                await self._save_search_task_to_db(task)
            
            self.logger.info(f"Completed search task {task_id}: {len(qualified_leads)} qualified leads")
            
        except Exception as e:
            task.status = "failed"
            task.results_summary = {"error": str(e)}
            task.error_log.append(f"Task failed: {str(e)}")
            self.logger.error(f"Search task {task_id} failed: {str(e)}")
            
            if self.supabase:
                await self._save_search_task_to_db(task)

    async def _search_source(self, source: DataSource, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search a specific data source for leads"""
        
        if source == DataSource.WEBSITE_SCRAPING:
            return await self._search_websites(criteria, max_results)
        elif source == DataSource.LINKEDIN:
            return await self._search_linkedin(criteria, max_results)
        elif source == DataSource.GOOGLE_SEARCH:
            return await self._search_google(criteria, max_results)
        elif source == DataSource.DATABASE:
            return await self._search_databases(criteria, max_results)
        else:
            return []

    async def _search_websites(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Scrape websites for lead information"""
        
        leads = []
        
        # Generate target websites based on criteria
        target_websites = await self._find_target_websites(criteria)
        
        for website in target_websites[:min(20, len(target_websites))]:  # Limit to 20 websites
            try:
                website_leads = await self.web_scraper.scrape_website(website, criteria)
                leads.extend(website_leads)
                
                if len(leads) >= max_results:
                    break
                    
                # Rate limiting
                await asyncio.sleep(self.rate_limits['website_scraping'])
                
            except Exception as e:
                self.logger.error(f"Error scraping {website}: {str(e)}")
                continue
        
        return leads[:max_results]

    async def _search_linkedin(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search LinkedIn for leads"""
        
        try:
            return await self.linkedin_scraper.search_professionals(criteria, max_results)
        except Exception as e:
            self.logger.error(f"LinkedIn search error: {str(e)}")
            return []

    async def _search_google(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Use Google Search to find leads"""
        
        # Generate search queries based on criteria
        search_queries = await self._generate_search_queries(criteria)
        
        leads = []
        for query in search_queries:
            try:
                results = await self.google_search.search(query, max_results=20)
                query_leads = await self._extract_leads_from_search_results(results, criteria)
                leads.extend(query_leads)
                
                if len(leads) >= max_results:
                    break
                    
                # Rate limiting
                await asyncio.sleep(self.rate_limits['google_search'])
                    
            except Exception as e:
                self.logger.error(f"Google search error: {str(e)}")
                continue
        
        return leads[:max_results]

    async def _search_databases(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search commercial lead databases"""
        
        leads = []
        
        # Apollo.io search
        if self.apollo_client.api_key:
            try:
                apollo_leads = await self.apollo_client.search_people(criteria, max_results // 2)
                leads.extend(apollo_leads)
                await asyncio.sleep(self.rate_limits['apollo'])
            except Exception as e:
                self.logger.error(f"Apollo search error: {str(e)}")
        
        # ZoomInfo search
        if self.zoominfo_client.api_key:
            try:
                zoominfo_leads = await self.zoominfo_client.search_contacts(criteria, max_results // 2)
                leads.extend(zoominfo_leads)
                await asyncio.sleep(self.rate_limits['zoominfo'])
            except Exception as e:
                self.logger.error(f"ZoomInfo search error: {str(e)}")
        
        return leads[:max_results]

    async def _find_target_websites(self, criteria: LeadCriteria) -> List[str]:
        """Find websites to scrape based on criteria"""
        
        # Generate search query for finding company websites
        query_parts = []
        
        if criteria.industry:
            query_parts.append(f'"{criteria.industry}" companies')
        if criteria.location:
            query_parts.append(f'in {criteria.location}')
        if criteria.keywords:
            query_parts.extend(criteria.keywords[:3])  # Limit keywords
        
        query = " ".join(query_parts) + " contact us"
        
        try:
            search_results = await self.google_search.search(query, max_results=50)
            
            websites = []
            for result in search_results:
                url = result.get('url', '')
                domain = urlparse(url).netloc
                if domain and domain not in websites and self._is_valid_business_domain(domain):
                    websites.append(domain)
            
            return websites
            
        except Exception as e:
            self.logger.error(f"Error finding target websites: {str(e)}")
            return []

    def _is_valid_business_domain(self, domain: str) -> bool:
        """Check if domain appears to be a business website"""
        
        # Filter out common non-business domains
        excluded_domains = [
            'linkedin.com', 'facebook.com', 'twitter.com', 'instagram.com',
            'youtube.com', 'google.com', 'bing.com', 'yahoo.com',
            'wikipedia.org', 'reddit.com', 'pinterest.com'
        ]
        
        return not any(excluded in domain.lower() for excluded in excluded_domains)

    async def _generate_search_queries(self, criteria: LeadCriteria) -> List[str]:
        """Generate Google search queries based on criteria"""
        
        queries = []
        
        # Job title + industry queries
        if criteria.job_titles and criteria.industry:
            for title in criteria.job_titles[:3]:  # Limit to top 3 titles
                queries.append(f'"{title}" {criteria.industry} contact email')
                queries.append(f'"{title}" {criteria.industry} LinkedIn')
        
        # Company size + location queries
        if criteria.company_size and criteria.location:
            queries.append(f'{criteria.company_size} employees {criteria.location} companies')
        
        # Technology + industry queries
        if criteria.technologies and criteria.industry:
            for tech in criteria.technologies[:2]:  # Limit to top 2 technologies
                queries.append(f'{tech} {criteria.industry} companies contact')
        
        # Keyword-based queries
        if criteria.keywords:
            for keyword in criteria.keywords[:3]:  # Limit to top 3 keywords
                queries.append(f'"{keyword}" decision maker contact')
        
        # Department-specific queries
        if criteria.department and criteria.industry:
            queries.append(f'{criteria.department} {criteria.industry} director contact')
        
        return queries[:15]  # Limit total queries

    async def _extract_leads_from_search_results(self, results: List[Dict], criteria: LeadCriteria) -> List[Lead]:
        """Extract lead information from Google search results"""
        
        leads = []
        
        for result in results[:10]:  # Limit to first 10 results
            try:
                # Scrape the page for contact information
                page_leads = await self.web_scraper.extract_contacts_from_url(result['url'], criteria)
                leads.extend(page_leads)
                
                # Rate limiting
                await asyncio.sleep(1)
                
            except Exception as e:
                self.logger.error(f"Error extracting from {result['url']}: {str(e)}")
                continue
        
        return leads

    async def _deduplicate_leads(self, leads: List[Lead]) -> List[Lead]:
        """Remove duplicate leads based on email and company"""
        
        seen = set()
        unique_leads = []
        
        for lead in leads:
            # Create multiple identifiers for better deduplication
            identifiers = []
            
            if lead.email:
                identifiers.append(f"email:{lead.email.lower()}")
            
            if lead.first_name and lead.last_name and lead.company:
                identifiers.append(f"name_company:{lead.first_name.lower()}_{lead.last_name.lower()}_{lead.company.lower()}")
            
            if lead.linkedin_url:
                identifiers.append(f"linkedin:{lead.linkedin_url.lower()}")
            
            # Check if any identifier has been seen
            is_duplicate = any(identifier in seen for identifier in identifiers)
            
            if not is_duplicate:
                # Add all identifiers to seen set
                for identifier in identifiers:
                    seen.add(identifier)
                unique_leads.append(lead)
        
        return unique_leads

    async def _score_lead(self, lead: Lead, criteria: LeadCriteria) -> float:
        """AI-powered lead scoring based on criteria match"""
        
        # Build scoring context
        scoring_context = {
            "lead": {
                "name": f"{lead.first_name} {lead.last_name}",
                "job_title": lead.job_title,
                "company": lead.company,
                "industry": lead.industry,
                "company_size": lead.company_size,
                "location": lead.location,
                "has_email": bool(lead.email),
                "has_phone": bool(lead.phone),
                "has_linkedin": bool(lead.linkedin_url)
            },
            "criteria": {
                "industry": criteria.industry,
                "company_size": criteria.company_size,
                "location": criteria.location,
                "job_titles": criteria.job_titles,
                "keywords": criteria.keywords,
                "technologies": criteria.technologies,
                "department": criteria.department,
                "seniority_level": criteria.seniority_level
            }
        }
        
        prompt = f"""
        Score this lead from 0-100 based on how well they match the ideal customer criteria:
        
        {json.dumps(scoring_context, indent=2)}
        
        Scoring criteria:
        1. Job title match (30 points)
        2. Industry match (25 points)  
        3. Company size match (15 points)
        4. Location match (10 points)
        5. Contact information completeness (10 points)
        6. Keyword/technology relevance (10 points)
        
        Additional factors:
        - Seniority level alignment
        - Department match
        - Decision-making authority
        
        Return only the numeric score (0-100).
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a lead scoring expert. Analyze leads objectively and return only numeric scores."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=10
            )
            
            score_text = response.choices[0].message.content.strip()
            score = float(re.search(r'\d+\.?\d*', score_text).group())
            return min(max(score, 0), 100)  # Clamp between 0-100
            
        except Exception as e:
            self.logger.error(f"Error scoring lead: {str(e)}")
            # Fallback scoring based on available data
            return self._fallback_scoring(lead, criteria)

    def _fallback_scoring(self, lead: Lead, criteria: LeadCriteria) -> float:
        """Fallback scoring when AI scoring fails"""
        
        score = 0
        
        # Job title match
        if lead.job_title and criteria.job_titles:
            if any(title.lower() in lead.job_title.lower() for title in criteria.job_titles):
                score += 30
        
        # Industry match
        if lead.industry and criteria.industry:
            if criteria.industry.lower() in lead.industry.lower():
                score += 25
        
        # Company size match
        if lead.company_size and criteria.company_size:
            if lead.company_size == criteria.company_size:
                score += 15
        
        # Location match
        if lead.location and criteria.location:
            if criteria.location.lower() in lead.location.lower():
                score += 10
        
        # Contact information completeness
        if lead.email:
            score += 5
        if lead.phone:
            score += 3
        if lead.linkedin_url:
            score += 2
        
        return min(score, 100)

    def _get_quality_level(self, score: float) -> LeadQuality:
        """Convert numeric score to quality level"""
        
        if score >= 80:
            return LeadQuality.HOT
        elif score >= 60:
            return LeadQuality.WARM
        elif score >= 40:
            return LeadQuality.COLD
        else:
            return LeadQuality.UNQUALIFIED

    async def _generate_results_summary(self, leads: List[Lead], criteria: LeadCriteria) -> Dict[str, Any]:
        """Generate AI summary of search results"""
        
        if not leads:
            return {"summary": "No leads found matching criteria"}
        
        # Calculate basic statistics
        quality_distribution = defaultdict(int)
        industry_distribution = defaultdict(int)
        location_distribution = defaultdict(int)
        source_distribution = defaultdict(int)
        
        for lead in leads:
            quality_distribution[lead.quality_level.value] += 1
            if lead.industry:
                industry_distribution[lead.industry] += 1
            if lead.location:
                location_distribution[lead.location] += 1
            source_distribution[lead.source.value] += 1
        
        stats = {
            "total_leads": len(leads),
            "average_score": round(sum(l.quality_score for l in leads) / len(leads), 1),
            "quality_distribution": dict(quality_distribution),
            "top_industries": dict(list(industry_distribution.items())[:5]),
            "top_locations": dict(list(location_distribution.items())[:5]),
            "source_distribution": dict(source_distribution),
            "companies": list(set([l.company for l in leads[:10]]))
        }
        
        prompt = f"""
        Analyze these lead generation results and provide strategic insights:
        
        Search Criteria:
        {json.dumps(asdict(criteria), indent=2)}
        
        Results Statistics:
        {json.dumps(stats, indent=2)}
        
        Provide analysis on:
        1. Quality assessment of results
        2. Geographic and industry insights
        3. Source effectiveness
        4. Recommended next actions
        5. Criteria optimization suggestions
        
        Format as JSON:
        {{
            "quality_assessment": "string",
            "key_insights": ["insight1", "insight2"],
            "source_performance": {{"source": "assessment"}},
            "recommendations": ["action1", "action2"],
            "optimization_suggestions": ["suggestion1", "suggestion2"]
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a lead generation analyst. Provide strategic insights based on data."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=1000
            )
            
            ai_summary = json.loads(response.choices[0].message.content)
            
            # Combine AI analysis with statistics
            return {
                "statistics": stats,
                "ai_analysis": ai_summary,
                "generated_at": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.logger.error(f"Error generating summary: {str(e)}")
            return {
                "statistics": stats,
                "ai_analysis": {"error": "Analysis unavailable"},
                "generated_at": datetime.now().isoformat()
            }

    async def enrich_lead(self, lead_id: str) -> Optional[LeadEnrichment]:
        """Enrich lead with additional data from various sources"""
        
        lead = self.leads.get(lead_id)
        if not lead:
            return None
        
        # Check cache first
        cache_key = f"{lead.email}:{lead.company}"
        if cache_key in self.enrichment_cache:
            return self.enrichment_cache[cache_key]
        
        try:
            enrichment = LeadEnrichment(
                company_info={},
                contact_info={},
                social_profiles={},
                technographics=[],
                company_news=[],
                enrichment_date=datetime.now()
            )
            
            # Enrich company information
            if lead.company_website:
                enrichment.company_info = await self._enrich_company_info(lead.company_website)
            
            # Find social profiles
            enrichment.social_profiles = await self._find_social_profiles(lead)
            
            # Get company technographics
            if lead.company_website:
                enrichment.technographics = await self._get_technographics(lead.company_website)
            
            # Get recent company news
            if lead.company:
                enrichment.company_news = await self._get_company_news(lead.company)
            
            # Verify contact information
            if lead.email:
                lead.email_verified = await self.email_validator.verify_email(lead.email)
            
            # Cache the enrichment
            self.enrichment_cache[cache_key] = enrichment
            
            # Update lead with enriched data
            lead.social_profiles = enrichment.social_profiles
            lead.updated_at = datetime.now()
            
            if self.supabase:
                await self._save_lead_to_db(lead)
            
            return enrichment
            
        except Exception as e:
            self.logger.error(f"Error enriching lead {lead_id}: {str(e)}")
            return None

    async def _enrich_company_info(self, website: str) -> Dict[str, Any]:
        """Enrich company information from website and external sources"""
        
        try:
            # Scrape basic company info
            company_info = await self.web_scraper.get_company_info(website)
            return company_info
        except:
            return {}

    async def _find_social_profiles(self, lead: Lead) -> Dict[str, str]:
        """Find social media profiles for the lead"""
        
        profiles = {}
        
        if lead.linkedin_url:
            profiles['linkedin'] = lead.linkedin_url
        
        # Search for other profiles based on name and company
        if lead.first_name and lead.last_name and lead.company:
            # This would integrate with social media APIs
            pass
        
        return profiles

    async def _get_technographics(self, website: str) -> List[str]:
        """Get technology stack information for a company"""
        
        # This would integrate with services like BuiltWith or Wappalyzer
        return []

    async def _get_company_news(self, company: str) -> List[Dict[str, Any]]:
        """Get recent news about a company"""
        
        # This would integrate with news APIs
        return []

    async def get_leads(self, 
                       quality_filter: Optional[LeadQuality] = None,
                       status_filter: Optional[LeadStatus] = None,
                       source_filter: Optional[DataSource] = None,
                       limit: int = 100,
                       offset: int = 0) -> List[Lead]:
        """Get leads with filtering and pagination"""
        
        filtered_leads = list(self.leads.values())
        
        if quality_filter:
            filtered_leads = [l for l in filtered_leads if l.quality_level == quality_filter]
        
        if status_filter:
            filtered_leads = [l for l in filtered_leads if l.status == status_filter]
        
        if source_filter:
            filtered_leads = [l for l in filtered_leads if l.source == source_filter]
        
        # Sort by quality score (highest first)
        filtered_leads.sort(key=lambda x: x.quality_score, reverse=True)
        
        # Apply pagination
        return filtered_leads[offset:offset + limit]

    async def update_lead_status(self, lead_id: str, status: LeadStatus, notes: Optional[str] = None):
        """Update lead status and add notes"""
        
        if lead_id not in self.leads:
            raise ValueError(f"Lead {lead_id} not found")
        
        lead = self.leads[lead_id]
        old_status = lead.status
        lead.status = status
        lead.updated_at = datetime.now()
        
        if status == LeadStatus.CONTACTED:
            lead.contact_attempts += 1
            lead.last_contacted = datetime.now()
        
        if notes:
            if lead.notes:
                lead.notes += f"\n{datetime.now().strftime('%Y-%m-%d %H:%M')}: {notes}"
            else:
                lead.notes = f"{datetime.now().strftime('%Y-%m-%d %H:%M')}: {notes}"
        
        # Save to database
        if self.supabase:
            await self._save_lead_to_db(lead)
        
        self.logger.info(f"Updated lead {lead_id} status from {old_status.value} to {status.value}")

    async def bulk_update_leads(self, lead_ids: List[str], updates: Dict[str, Any]) -> Dict[str, bool]:
        """Bulk update multiple leads"""
        
        results = {}
        
        for lead_id in lead_ids:
            try:
                if lead_id in self.leads:
                    lead = self.leads[lead_id]
                    
                    # Apply updates
                    for field, value in updates.items():
                        if hasattr(lead, field):
                            setattr(lead, field, value)
                    
                    lead.updated_at = datetime.now()
                    
                    # Save to database
                    if self.supabase:
                        await self._save_lead_to_db(lead)
                    
                    results[lead_id] = True
                else:
                    results[lead_id] = False
                    
            except Exception as e:
                self.logger.error(f"Error updating lead {lead_id}: {str(e)}")
                results[lead_id] = False
        
        return results

    async def add_lead_tags(self, lead_id: str, tags: List[str]) -> bool:
        """Add tags to a lead"""
        
        if lead_id not in self.leads:
            return False
        
        lead = self.leads[lead_id]
        
        # Add new tags (avoid duplicates)
        for tag in tags:
            if tag not in lead.tags:
                lead.tags.append(tag)
        
        lead.updated_at = datetime.now()
        
        # Save to database
        if self.supabase:
            await self._save_lead_to_db(lead)
        
        return True

    async def remove_lead_tags(self, lead_id: str, tags: List[str]) -> bool:
        """Remove tags from a lead"""
        
        if lead_id not in self.leads:
            return False
        
        lead = self.leads[lead_id]
        
        # Remove specified tags
        for tag in tags:
            if tag in lead.tags:
                lead.tags.remove(tag)
        
        lead.updated_at = datetime.now()
        
        # Save to database
        if self.supabase:
            await self._save_lead_to_db(lead)
        
        return True

    async def search_leads(self, 
                          query: str, 
                          fields: List[str] = None) -> List[Lead]:
        """Search leads by text query across specified fields"""
        
        if not fields:
            fields = ['first_name', 'last_name', 'email', 'company', 'job_title', 'notes']
        
        query_lower = query.lower()
        matching_leads = []
        
        for lead in self.leads.values():
            for field in fields:
                field_value = getattr(lead, field, None)
                if field_value and query_lower in str(field_value).lower():
                    matching_leads.append(lead)
                    break  # Avoid duplicate matches
        
        # Sort by quality score
        matching_leads.sort(key=lambda x: x.quality_score, reverse=True)
        return matching_leads

    async def get_lead_analytics(self) -> Dict[str, Any]:
        """Get comprehensive analytics about leads"""
        
        if not self.leads:
            return {"message": "No leads available"}
        
        leads = list(self.leads.values())
        
        # Basic statistics
        total_leads = len(leads)
        
        # Quality distribution
        quality_counts = defaultdict(int)
        for lead in leads:
            quality_counts[lead.quality_level.value] += 1
        
        # Status distribution
        status_counts = defaultdict(int)
        for lead in leads:
            status_counts[lead.status.value] += 1
        
        # Source distribution
        source_counts = defaultdict(int)
        for lead in leads:
            source_counts[lead.source.value] += 1
        
        # Conversion funnel
        conversion_rates = {
            "contact_rate": len([l for l in leads if l.status == LeadStatus.CONTACTED]) / total_leads * 100,
            "interest_rate": len([l for l in leads if l.status == LeadStatus.INTERESTED]) / total_leads * 100,
            "conversion_rate": len([l for l in leads if l.status == LeadStatus.CONVERTED]) / total_leads * 100
        }
        
        # Time-based metrics
        now = datetime.now()
        leads_last_30_days = len([l for l in leads if (now - l.created_at).days <= 30])
        leads_last_7_days = len([l for l in leads if (now - l.created_at).days <= 7])
        
        # Average scores
        avg_quality_score = sum(l.quality_score for l in leads) / total_leads
        
        # Top companies and industries
        company_counts = defaultdict(int)
        industry_counts = defaultdict(int)
        
        for lead in leads:
            company_counts[lead.company] += 1
            if lead.industry:
                industry_counts[lead.industry] += 1
        
        top_companies = dict(sorted(company_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        top_industries = dict(sorted(industry_counts.items(), key=lambda x: x[1], reverse=True)[:10])
        
        return {
            "total_leads": total_leads,
            "average_quality_score": round(avg_quality_score, 2),
            "quality_distribution": dict(quality_counts),
            "status_distribution": dict(status_counts),
            "source_distribution": dict(source_counts),
            "conversion_rates": {k: round(v, 2) for k, v in conversion_rates.items()},
            "recent_activity": {
                "leads_last_7_days": leads_last_7_days,
                "leads_last_30_days": leads_last_30_days
            },
            "top_companies": top_companies,
            "top_industries": top_industries,
            "data_quality": {
                "with_email": len([l for l in leads if l.email]),
                "with_phone": len([l for l in leads if l.phone]),
                "with_linkedin": len([l for l in leads if l.linkedin_url]),
                "email_verified": len([l for l in leads if l.email_verified])
            }
        }

    async def export_leads(self, 
                          leads: List[Lead], 
                          format: str = "csv",
                          include_fields: Optional[List[str]] = None) -> str:
        """Export leads to various formats"""
        
        if format.lower() == "csv":
            return await self._export_to_csv(leads, include_fields)
        elif format.lower() == "json":
            return await self._export_to_json(leads, include_fields)
        elif format.lower() == "xlsx":
            return await self._export_to_xlsx(leads, include_fields)
        else:
            raise ValueError(f"Unsupported export format: {format}")

    async def _export_to_csv(self, leads: List[Lead], include_fields: Optional[List[str]] = None) -> str:
        """Export leads to CSV format"""
        
        if not leads:
            return ""
        
        # Default fields to include
        if not include_fields:
            include_fields = [
                'first_name', 'last_name', 'email', 'phone', 'job_title',
                'company', 'company_website', 'industry', 'location',
                'quality_score', 'quality_level', 'status', 'source',
                'linkedin_url', 'tags', 'notes', 'created_at'
            ]
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(include_fields)
        
        # Write data
        for lead in leads:
            lead_dict = asdict(lead)
            row = []
            for field in include_fields:
                value = lead_dict.get(field, '')
                if isinstance(value, (list, dict)):
                    value = json.dumps(value)
                elif isinstance(value, datetime):
                    value = value.isoformat()
                elif hasattr(value, 'value'):  # Enum
                    value = value.value
                row.append(str(value))
            writer.writerow(row)
        
        return output.getvalue()

    async def _export_to_json(self, leads: List[Lead], include_fields: Optional[List[str]] = None) -> str:
        """Export leads to JSON format"""
        
        export_data = []
        
        for lead in leads:
            lead_dict = asdict(lead)
            
            # Convert enums and datetime objects
            for key, value in lead_dict.items():
                if hasattr(value, 'value'):  # Enum
                    lead_dict[key] = value.value
                elif isinstance(value, datetime):
                    lead_dict[key] = value.isoformat()
            
            # Filter fields if specified
            if include_fields:
                lead_dict = {k: v for k, v in lead_dict.items() if k in include_fields}
            
            export_data.append(lead_dict)
        
        return json.dumps(export_data, indent=2)

    async def _export_to_xlsx(self, leads: List[Lead], include_fields: Optional[List[str]] = None) -> bytes:
        """Export leads to Excel format"""
        
        # This would require openpyxl or xlsxwriter
        # For now, return CSV as fallback
        csv_data = await self._export_to_csv(leads, include_fields)
        return csv_data.encode('utf-8')

    async def import_leads(self, 
                          data: str, 
                          format: str = "csv",
                          source: DataSource = DataSource.MANUAL_IMPORT) -> Dict[str, Any]:
        """Import leads from various formats"""
        
        if format.lower() == "csv":
            return await self._import_from_csv(data, source)
        elif format.lower() == "json":
            return await self._import_from_json(data, source)
        else:
            raise ValueError(f"Unsupported import format: {format}")

    async def _import_from_csv(self, csv_data: str, source: DataSource) -> Dict[str, Any]:
        """Import leads from CSV data"""
        
        try:
            csv_reader = csv.DictReader(io.StringIO(csv_data))
            imported_count = 0
            skipped_count = 0
            errors = []
            
            for row_num, row in enumerate(csv_reader, start=2):
                try:
                    # Create lead from CSV row
                    lead = self._create_lead_from_import(row, source)
                    
                    if lead:
                        # Check for duplicates
                        if not self._is_duplicate_lead(lead):
                            self.leads[lead.id] = lead
                            
                            # Save to database
                            if self.supabase:
                                await self._save_lead_to_db(lead)
                            
                            imported_count += 1
                        else:
                            skipped_count += 1
                    else:
                        errors.append(f"Row {row_num}: Invalid lead data")
                        
                except Exception as e:
                    errors.append(f"Row {row_num}: {str(e)}")
            
            return {
                "imported": imported_count,
                "skipped": skipped_count,
                "errors": errors,
                "total_processed": imported_count + skipped_count + len(errors)
            }
            
        except Exception as e:
            return {"error": f"Import failed: {str(e)}"}

    async def _import_from_json(self, json_data: str, source: DataSource) -> Dict[str, Any]:
        """Import leads from JSON data"""
        
        try:
            data = json.loads(json_data)
            if not isinstance(data, list):
                data = [data]
            
            imported_count = 0
            skipped_count = 0
            errors = []
            
            for i, item in enumerate(data):
                try:
                    lead = self._create_lead_from_import(item, source)
                    
                    if lead:
                        if not self._is_duplicate_lead(lead):
                            self.leads[lead.id] = lead
                            
                            # Save to database
                            if self.supabase:
                                await self._save_lead_to_db(lead)
                            
                            imported_count += 1
                        else:
                            skipped_count += 1
                    else:
                        errors.append(f"Item {i+1}: Invalid lead data")
                        
                except Exception as e:
                    errors.append(f"Item {i+1}: {str(e)}")
            
            return {
                "imported": imported_count,
                "skipped": skipped_count,
                "errors": errors,
                "total_processed": imported_count + skipped_count + len(errors)
            }
            
        except Exception as e:
            return {"error": f"Import failed: {str(e)}"}

    def _create_lead_from_import(self, data: Dict[str, Any], source: DataSource) -> Optional[Lead]:
        """Create Lead object from imported data"""
        
        try:
            # Required fields
            first_name = data.get('first_name', '').strip()
            last_name = data.get('last_name', '').strip()
            company = data.get('company', '').strip()
            
            if not (first_name and last_name and company):
                return None
            
            # Generate ID
            lead_id = f"import_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(f'{first_name}{last_name}{company}')}"
            
            # Create lead
            lead = Lead(
                id=lead_id,
                first_name=first_name,
                last_name=last_name,
                email=data.get('email', '').strip() or None,
                phone=data.get('phone', '').strip() or None,
                job_title=data.get('job_title', '').strip() or None,
                company=company,
                company_website=data.get('company_website', '').strip() or None,
                company_size=data.get('company_size', '').strip() or None,
                industry=data.get('industry', '').strip() or None,
                location=data.get('location', '').strip() or None,
                linkedin_url=data.get('linkedin_url', '').strip() or None,
                source=source,
                quality_score=float(data.get('quality_score', 50.0)),
                quality_level=LeadQuality.COLD,  # Default, will be recalculated
                status=LeadStatus.NEW,
                notes=data.get('notes', '').strip() or None,
                tags=data.get('tags', []) if isinstance(data.get('tags'), list) else [],
                contact_attempts=int(data.get('contact_attempts', 0)),
                last_contacted=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                custom_fields=data.get('custom_fields', {}),
                confidence_score=float(data.get('confidence_score', 0.8)),
                email_verified=bool(data.get('email_verified', False)),
                phone_verified=bool(data.get('phone_verified', False)),
                social_profiles=data.get('social_profiles', {})
            )
            
            # Recalculate quality level based on score
            lead.quality_level = self._get_quality_level(lead.quality_score)
            
            return lead
            
        except Exception as e:
            self.logger.error(f"Error creating lead from import data: {str(e)}")
            return None

    def _is_duplicate_lead(self, lead: Lead) -> bool:
        """Check if lead is a duplicate of existing leads"""
        
        for existing_lead in self.leads.values():
            # Check email match
            if lead.email and existing_lead.email:
                if lead.email.lower() == existing_lead.email.lower():
                    return True
            
            # Check name + company match
            if (lead.first_name.lower() == existing_lead.first_name.lower() and
                lead.last_name.lower() == existing_lead.last_name.lower() and
                lead.company.lower() == existing_lead.company.lower()):
                return True
        
        return False

    async def get_search_task(self, task_id: str) -> Optional[SearchTask]:
        """Get search task by ID"""
        return self.search_tasks.get(task_id)

    async def list_search_tasks(self, status: Optional[str] = None) -> List[SearchTask]:
        """List search tasks with optional status filter"""
        
        tasks = list(self.search_tasks.values())
        
        if status:
            tasks = [t for t in tasks if t.status == status]
        
        # Sort by creation date (newest first)
        tasks.sort(key=lambda x: x.created_at, reverse=True)
        return tasks

    async def cancel_search_task(self, task_id: str) -> bool:
        """Cancel a running search task"""
        
        task = self.search_tasks.get(task_id)
        if not task:
            return False
        
        if task.status == "running":
            task.status = "cancelled"
            return True
        
        return False

    async def _save_lead_to_db(self, lead: Lead):
        """Save lead to database"""
        
        if not self.supabase:
            return
        
        try:
            lead_data = asdict(lead)
            
            # Convert enums and datetime objects
            for key, value in lead_data.items():
                if hasattr(value, 'value'):  # Enum
                    lead_data[key] = value.value
                elif isinstance(value, datetime):
                    lead_data[key] = value.isoformat()
            
            self.supabase.table('leads').upsert(lead_data).execute()
            
        except Exception as e:
            self.logger.error(f"Error saving lead to database: {str(e)}")

    async def _save_search_task_to_db(self, task: SearchTask):
        """Save search task to database"""
        
        if not self.supabase:
            return
        
        try:
            task_data = asdict(task)
            
            # Convert datetime objects and enums
            task_data['created_at'] = task.created_at.isoformat()
            if task.completed_at:
                task_data['completed_at'] = task.completed_at.isoformat()
            
            # Convert criteria and sources
            task_data['criteria'] = asdict(task.criteria)
            task_data['sources'] = [s.value for s in task.sources]
            
            self.supabase.table('search_tasks').upsert(task_data).execute()
            
        except Exception as e:
            self.logger.error(f"Error saving search task to database: {str(e)}")

    def get_lead(self, lead_id: str) -> Optional[Lead]:
        """Get lead by ID"""
        return self.leads.get(lead_id)

    async def delete_lead(self, lead_id: str) -> bool:
        """Delete a lead"""
        
        if lead_id not in self.leads:
            return False
        
        del self.leads[lead_id]
        
        # Delete from database
        if self.supabase:
            try:
                self.supabase.table('leads').delete().eq('id', lead_id).execute()
            except Exception as e:
                self.logger.error(f"Error deleting lead from database: {str(e)}")
        
        return True


# Data Source Client Classes

class WebScraper:
    def __init__(self):
        self.session = httpx.AsyncClient(
            timeout=30.0,
            headers={
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        )

    async def scrape_website(self, domain: str, criteria: LeadCriteria) -> List[Lead]:
        """Scrape a website for contact information"""
        
        leads = []
        
        # Common contact pages
        contact_pages = [
            f"https://{domain}/contact",
            f"https://{domain}/contact-us", 
            f"https://{domain}/about",
            f"https://{domain}/team",
            f"https://{domain}/leadership",
            f"https://{domain}/staff"
        ]
        
        for url in contact_pages:
            try:
                page_leads = await self.extract_contacts_from_url(url, criteria)
                leads.extend(page_leads)
                
                # Avoid overwhelming the server
                await asyncio.sleep(1)
                
            except Exception as e:
                continue
        
        return leads

    async def extract_contacts_from_url(self, url: str, criteria: LeadCriteria) -> List[Lead]:
        """Extract contact information from a specific URL"""
        
        try:
            response = await self.session.get(url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract emails
            emails = re.findall(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', soup.text)
            
            # Filter out common non-personal emails
            filtered_emails = [
                email for email in emails 
                if not any(generic in email.lower() for generic in [
                    'info@', 'support@', 'sales@', 'admin@', 'webmaster@',
                    'contact@', 'hello@', 'help@', 'noreply@'
                ])
            ]
            
            # Extract names and titles from common patterns
            contacts = self._extract_contact_info(soup, filtered_emails)
            
            # Convert to Lead objects
            leads = []
            for contact in contacts:
                lead = self._create_lead_from_contact(contact, url, criteria)
                if lead:
                    leads.append(lead)
            
            return leads
            
        except Exception as e:
            raise Exception(f"Error scraping {url}: {str(e)}")

    def _extract_contact_info(self, soup: BeautifulSoup, emails: List[str]) -> List[Dict]:
        """Extract structured contact information from HTML"""
        
        contacts = []
        
        # Look for structured contact information
        for email in emails:
            contact = {'email': email}
            
            # Try to find name and title near email
            email_element = soup.find(string=re.compile(email))
            if email_element:
                parent = email_element.parent
                
                # Look for nearby text that might be name/title
                siblings = parent.find_all_next(string=True, limit=10)
                preceding = parent.find_all_previous(string=True, limit=10)
                
                nearby_text = siblings + preceding
                
                # Extract potential names and titles
                for text in nearby_text:
                    text = text.strip()
                    if len(text) > 2 and text not in email:
                        # Simple heuristics for job titles
                        if any(title in text.lower() for title in [
                            'ceo', 'president', 'director', 'manager', 'head',
                            'vp', 'vice president', 'founder', 'owner', 'chief',
                            'coordinator', 'specialist', 'analyst', 'executive'
                        ]):
                            contact['job_title'] = text
                        # Simple heuristics for names
                        elif (len(text.split()) == 2 and 
                              text[0].isupper() and 
                              not any(char.isdigit() for char in text)):
                            contact['name'] = text
            
            contacts.append(contact)
        
        return contacts

    def _create_lead_from_contact(self, contact: Dict, source_url: str, criteria: LeadCriteria) -> Optional[Lead]:
        """Create Lead object from extracted contact info"""
        
        try:
            # Parse name
            name_parts = contact.get('name', '').split() if contact.get('name') else ['', '']
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            
            # Extract company from domain
            domain = urlparse(source_url).netloc
            company = domain.replace('www.', '').split('.')[0].title()
            
            # Generate unique ID
            email = contact.get('email', '')
            lead_id = f"web_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{hash(email)}"
            
            return Lead(
                id=lead_id,
                first_name=first_name,
                last_name=last_name,
                email=email,
                phone=contact.get('phone'),
                job_title=contact.get('job_title'),
                company=company,
                company_website=f"https://{domain}",
                company_size=None,
                industry=criteria.industry,
                location=criteria.location,
                linkedin_url=None,
                source=DataSource.WEBSITE_SCRAPING,
                quality_score=0.0,
                quality_level=LeadQuality.COLD,
                status=LeadStatus.NEW,
                notes=f"Found on {source_url}",
                tags=['web_scraped'],
                contact_attempts=0,
                last_contacted=None,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                custom_fields={},
                confidence_score=0.6,  # Lower confidence for scraped data
                email_verified=False,
                phone_verified=False,
                social_profiles={}
            )
            
        except Exception as e:
            return None

    async def get_company_info(self, website: str) -> Dict[str, Any]:
        """Extract company information from website"""
        
        try:
            response = await self.session.get(f"https://{website}")
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract company information
            company_info = {}
            
            # Get title
            title = soup.find('title')
            if title:
                company_info['title'] = title.text.strip()
            
            # Get meta description
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            if meta_desc:
                company_info['description'] = meta_desc.get('content', '')
            
            # Look for company size indicators
            text_content = soup.get_text().lower()
            if 'employees' in text_content:
                # Simple extraction of employee count
                employee_matches = re.findall(r'(\d+)[+-]?\s*employees', text_content)
                if employee_matches:
                    company_info['employee_estimate'] = employee_matches[0]
            
            return company_info
            
        except Exception as e:
            return {}


class LinkedInScraper:
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key

    async def search_professionals(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search LinkedIn for professionals matching criteria"""
        
        if not self.api_key:
            return []
        
        # This would integrate with LinkedIn Sales Navigator API
        # For demo purposes, returning empty list
        # Real implementation would use LinkedIn's People Search API
        
        return []


class GoogleSearchClient:
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key
        self.search_engine_id = None  # Would be configured

    async def search(self, query: str, max_results: int = 10) -> List[Dict]:
        """Perform Google search and return results"""
        
        if not self.api_key:
            # Return empty results for demo
            return []
        
        # Real implementation would use Google Custom Search API
        # https://developers.google.com/custom-search/v1/overview
        
        return []


class ApolloClient:
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key

    async def search_people(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search Apollo.io database for people"""
        
        if not self.api_key:
            return []
        
        # This would integrate with Apollo.io API
        # Real implementation would use Apollo's People Search API
        
        return []


class ZoomInfoClient:
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key

    async def search_contacts(self, criteria: LeadCriteria, max_results: int) -> List[Lead]:
        """Search ZoomInfo database for contacts"""
        
        if not self.api_key:
            return []
        
        # This would integrate with ZoomInfo API
        # Real implementation would use ZoomInfo's Contact Search API
        
        return []


class EmailValidator:
    def __init__(self, api_key: Optional[str]):
        self.api_key = api_key

    async def verify_email(self, email: str) -> bool:
        """Verify if email address is valid and deliverable"""
        
        if not self.api_key:
            # Basic email format validation
            email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}
            return bool(re.match(email_pattern, email))
        
        # Real implementation would use email verification service
        # like Hunter.io, ZeroBounce, or NeverBounce
        return True
