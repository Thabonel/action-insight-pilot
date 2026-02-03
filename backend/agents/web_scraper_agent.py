"""
Web Scraper Agent

AI-powered web scraping agent that can extract data from websites
including generic webpages, structured data, and e-commerce products.
"""

from datetime import datetime
from typing import Dict, Any, List
import logging
from .base_agent import BaseAgent
from .ai_service import AIService
from .scraper import (
    WebpageScraperService,
    StructuredDataService,
    EcommerceScraperService,
)

logger = logging.getLogger(__name__)


class WebScraperAgent(BaseAgent):
    """AI-powered web scraping agent"""

    def __init__(self, agent_id: int, supabase_client, config: Dict[str, Any] = None):
        super().__init__(agent_id, supabase_client, config)
        self.ai_service = None
        self._services = {}

    async def _initialize_ai_service(self):
        """Initialize AI service for intelligent data extraction"""
        if self.ai_service is None:
            try:
                import json

                result = await self.supabase.functions.invoke(
                    "manage-user-secrets",
                    {
                        "body": json.dumps({"serviceName": "openai_api_key"}),
                        "headers": {"Content-Type": "application/json"},
                    },
                )

                if result.get("data") and result["data"].get("value"):
                    api_key = result["data"]["value"]
                    self.ai_service = AIService(api_key)
                    self.logger.info("AI service initialized for web scraper")
                else:
                    self.logger.warning("OpenAI API key not found - AI features disabled")

            except Exception as e:
                self.logger.warning(f"AI service not available: {str(e)}")

    async def _get_service(self, service_class):
        """Get or create service instance"""
        service_name = service_class.__name__
        if service_name not in self._services:
            await self._initialize_ai_service()
            self._services[service_name] = service_class(
                self.supabase, self.agent_id, self.ai_service
            )
        return self._services[service_name]

    def get_supported_tasks(self) -> List[str]:
        """Return list of supported task types"""
        return [
            # Generic webpage scraping
            "scrape_page",
            "scrape_multiple_pages",
            "crawl_site",
            # Structured data extraction
            "extract_structured_data",
            "extract_contact_info",
            # E-commerce scraping
            "scrape_product_page",
            "scrape_product_listing",
            "compare_products",
            # Utility
            "test_scraper",
        ]

    async def execute_task(self, task_type: str, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Execute web scraping tasks"""

        # Generic webpage scraping
        if task_type == "scrape_page":
            service = await self._get_service(WebpageScraperService)
            return await service.scrape_page(input_data)

        elif task_type == "scrape_multiple_pages":
            service = await self._get_service(WebpageScraperService)
            return await service.scrape_multiple_pages(input_data)

        elif task_type == "crawl_site":
            service = await self._get_service(WebpageScraperService)
            return await service.crawl_site(input_data)

        # Structured data extraction
        elif task_type == "extract_structured_data":
            service = await self._get_service(StructuredDataService)
            return await service.extract_structured_data(input_data)

        elif task_type == "extract_contact_info":
            service = await self._get_service(StructuredDataService)
            return await service.extract_contact_info(input_data)

        # E-commerce scraping
        elif task_type == "scrape_product_page":
            service = await self._get_service(EcommerceScraperService)
            return await service.scrape_product_page(input_data)

        elif task_type == "scrape_product_listing":
            service = await self._get_service(EcommerceScraperService)
            return await service.scrape_product_listing(input_data)

        elif task_type == "compare_products":
            service = await self._get_service(EcommerceScraperService)
            return await service.compare_products(input_data)

        # Utility
        elif task_type == "test_scraper":
            return await self._test_scraper(input_data)

        else:
            raise ValueError(f"Unsupported task type: {task_type}")

    async def _test_scraper(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """Test scraper connectivity and basic functionality"""
        url = input_data.get("url", "https://httpbin.org/html")

        self.logger.info(f"Testing scraper with URL: {url}")

        service = await self._get_service(WebpageScraperService)
        result = await service.scrape_page({"url": url})

        return {
            "success": result.get("success", False),
            "test_url": url,
            "fetch_time_ms": result.get("fetch_time_ms"),
            "content_length": len(result.get("content", "")),
            "title": result.get("meta", {}).get("title"),
            "message": "Scraper is working correctly" if result.get("success") else result.get("error"),
            "tested_at": datetime.utcnow().isoformat(),
        }

    async def cleanup(self):
        """Clean up resources"""
        for service in self._services.values():
            if hasattr(service, "close"):
                await service.close()
        self._services.clear()
