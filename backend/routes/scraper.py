"""
Web Scraper API Routes

Provides endpoints for web scraping functionality.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, HttpUrl
import logging

from backend.models import APIResponse
from backend.auth import verify_token
from backend.database import get_supabase
from backend.agents.web_scraper_agent import WebScraperAgent

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/scraper", tags=["scraper"])

# Global agent instance
_scraper_agent = None


def get_scraper_agent():
    """Get or create scraper agent instance"""
    global _scraper_agent
    if _scraper_agent is None:
        supabase = get_supabase()
        _scraper_agent = WebScraperAgent(agent_id=100, supabase_client=supabase)
    return _scraper_agent


# Request Models
class ScrapePageRequest(BaseModel):
    url: str
    extract_links: bool = True
    extract_images: bool = True
    custom_selectors: Optional[Dict[str, str]] = None


class ScrapeMultiplePagesRequest(BaseModel):
    urls: List[str]
    max_concurrent: int = 5
    delay_between: float = 0.5
    extract_links: bool = False
    extract_images: bool = False


class CrawlSiteRequest(BaseModel):
    start_url: str
    max_pages: int = 10
    same_domain_only: bool = True
    max_depth: int = 2


class ExtractStructuredDataRequest(BaseModel):
    url: str
    extract_prices: bool = True
    extract_ratings: bool = True
    extract_contacts: bool = True
    extract_addresses: bool = True
    extract_json_ld: bool = True


class ScrapeProductRequest(BaseModel):
    url: str
    custom_selectors: Optional[Dict[str, str]] = None


class ScrapeProductListingRequest(BaseModel):
    url: str
    product_selector: str = ".product, .product-item, [data-product]"
    max_products: int = 20
    pagination_selector: Optional[str] = None
    max_pages: int = 1


class CompareProductsRequest(BaseModel):
    urls: List[str]


# Endpoints

@router.post("/page", response_model=APIResponse)
async def scrape_page(request: ScrapePageRequest, token: str = Depends(verify_token)):
    """
    Scrape a single webpage and extract content

    Returns page content, meta tags, headings, links, images, and contact info.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("scrape_page", request.model_dump())

        if result.get("success"):
            logger.info(f"Successfully scraped: {request.url}")
            return APIResponse(success=True, data=result)
        else:
            logger.warning(f"Failed to scrape: {request.url} - {result.get('error')}")
            return APIResponse(success=False, error=result.get("error", "Scraping failed"))

    except Exception as e:
        logger.error(f"Error scraping page: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/pages", response_model=APIResponse)
async def scrape_multiple_pages(request: ScrapeMultiplePagesRequest, token: str = Depends(verify_token)):
    """
    Scrape multiple webpages concurrently

    Processes URLs in batches with configurable concurrency and delay.
    """
    try:
        if len(request.urls) > 50:
            return APIResponse(success=False, error="Maximum 50 URLs allowed per request")

        agent = get_scraper_agent()
        result = await agent.execute_task("scrape_multiple_pages", request.model_dump())

        logger.info(f"Scraped {result.get('successful', 0)}/{len(request.urls)} pages")
        return APIResponse(success=True, data=result)

    except Exception as e:
        logger.error(f"Error scraping multiple pages: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/crawl", response_model=APIResponse)
async def crawl_site(request: CrawlSiteRequest, token: str = Depends(verify_token)):
    """
    Crawl a website starting from a URL

    Discovers and scrapes pages following links, with configurable depth and limits.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("crawl_site", request.model_dump())

        logger.info(f"Crawled {result.get('pages_crawled', 0)} pages from {request.start_url}")
        return APIResponse(success=True, data=result)

    except Exception as e:
        logger.error(f"Error crawling site: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/structured-data", response_model=APIResponse)
async def extract_structured_data(request: ExtractStructuredDataRequest, token: str = Depends(verify_token)):
    """
    Extract structured data from a webpage

    Extracts prices, ratings, contacts, addresses, JSON-LD schema, and more.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("extract_structured_data", request.model_dump())

        if result.get("success"):
            logger.info(f"Extracted structured data from: {request.url}")
            return APIResponse(success=True, data=result)
        else:
            return APIResponse(success=False, error=result.get("error", "Extraction failed"))

    except Exception as e:
        logger.error(f"Error extracting structured data: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/contact-info", response_model=APIResponse)
async def extract_contact_info(request: ScrapePageRequest, token: str = Depends(verify_token)):
    """
    Extract contact information from a webpage

    Finds emails, phone numbers, addresses, and social media links.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("extract_contact_info", {"url": request.url})

        if result.get("success"):
            logger.info(f"Extracted contact info from: {request.url}")
            return APIResponse(success=True, data=result)
        else:
            return APIResponse(success=False, error=result.get("error", "Extraction failed"))

    except Exception as e:
        logger.error(f"Error extracting contact info: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/product", response_model=APIResponse)
async def scrape_product_page(request: ScrapeProductRequest, token: str = Depends(verify_token)):
    """
    Scrape a product page

    Extracts product name, price, description, images, ratings, and availability.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("scrape_product_page", request.model_dump())

        if result.get("success"):
            logger.info(f"Scraped product from: {request.url}")
            return APIResponse(success=True, data=result)
        else:
            return APIResponse(success=False, error=result.get("error", "Product scraping failed"))

    except Exception as e:
        logger.error(f"Error scraping product: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/product-listing", response_model=APIResponse)
async def scrape_product_listing(request: ScrapeProductListingRequest, token: str = Depends(verify_token)):
    """
    Scrape a product listing/category page

    Extracts multiple products from a listing page with optional pagination.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("scrape_product_listing", request.model_dump())

        logger.info(f"Scraped {result.get('product_count', 0)} products from listing")
        return APIResponse(success=True, data=result)

    except Exception as e:
        logger.error(f"Error scraping product listing: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/compare-products", response_model=APIResponse)
async def compare_products(request: CompareProductsRequest, token: str = Depends(verify_token)):
    """
    Compare multiple products

    Scrapes multiple product pages and provides a comparison summary.
    """
    try:
        if len(request.urls) > 10:
            return APIResponse(success=False, error="Maximum 10 products allowed for comparison")

        agent = get_scraper_agent()
        result = await agent.execute_task("compare_products", request.model_dump())

        logger.info(f"Compared {result.get('product_count', 0)} products")
        return APIResponse(success=True, data=result)

    except Exception as e:
        logger.error(f"Error comparing products: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.post("/test", response_model=APIResponse)
async def test_scraper(token: str = Depends(verify_token)):
    """
    Test scraper connectivity

    Performs a test scrape to verify the scraper is working correctly.
    """
    try:
        agent = get_scraper_agent()
        result = await agent.execute_task("test_scraper", {})

        return APIResponse(success=result.get("success", False), data=result)

    except Exception as e:
        logger.error(f"Error testing scraper: {str(e)}")
        return APIResponse(success=False, error=str(e))


@router.get("/tasks", response_model=APIResponse)
async def get_supported_tasks(token: str = Depends(verify_token)):
    """
    Get list of supported scraping tasks

    Returns all available task types and their descriptions.
    """
    tasks = {
        "scrape_page": "Scrape a single webpage and extract all content",
        "scrape_multiple_pages": "Scrape multiple pages concurrently",
        "crawl_site": "Crawl a website following links",
        "extract_structured_data": "Extract structured data (prices, ratings, contacts)",
        "extract_contact_info": "Extract contact information only",
        "scrape_product_page": "Scrape an e-commerce product page",
        "scrape_product_listing": "Scrape a product listing/category page",
        "compare_products": "Compare multiple products",
        "test_scraper": "Test scraper connectivity",
    }

    return APIResponse(success=True, data={"tasks": tasks})
