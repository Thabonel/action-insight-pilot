"""
Webpage Scraper Service

Handles generic webpage scraping with full content extraction.
"""

import logging
from typing import Dict, Any, List
from datetime import datetime
from .base_scraper_service import BaseScraperService

logger = logging.getLogger(__name__)


class WebpageScraperService(BaseScraperService):
    """Service for scraping generic webpages"""

    async def scrape_page(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape a single webpage and extract all available data

        Args:
            input_data: Dict containing:
                - url: Target URL to scrape
                - extract_links: Whether to extract links (default: True)
                - extract_images: Whether to extract images (default: True)
                - custom_selectors: Dict of name -> CSS selector for custom extraction

        Returns:
            Dict with scraped data
        """
        url = input_data.get("url")
        if not url:
            return {"success": False, "error": "URL is required"}

        extract_links = input_data.get("extract_links", True)
        extract_images = input_data.get("extract_images", True)
        custom_selectors = input_data.get("custom_selectors", {})

        self.logger.info(f"Scraping webpage: {url}")

        # Fetch the page
        fetch_result = await self.fetch_page(url)
        if not fetch_result.get("success"):
            return fetch_result

        # Parse HTML
        soup = self.parse_html(fetch_result["html"])

        # Extract data
        result = {
            "success": True,
            "url": fetch_result["url"],
            "fetch_time_ms": fetch_result["fetch_time_ms"],
            "scraped_at": datetime.utcnow().isoformat(),
            "scrape_type": "webpage",
        }

        # Meta tags
        result["meta"] = self.extract_meta_tags(soup)

        # Main content
        main_content = soup.find("main") or soup.find("article") or soup.find("body")
        if main_content:
            # Remove script and style elements
            for element in main_content.find_all(["script", "style", "nav", "footer", "header"]):
                element.decompose()
            result["content"] = self.clean_text(main_content.get_text())
        else:
            result["content"] = ""

        # Headings
        result["headings"] = {
            "h1": self.extract_all_text(soup, "h1"),
            "h2": self.extract_all_text(soup, "h2"),
            "h3": self.extract_all_text(soup, "h3"),
        }

        # Links
        if extract_links:
            result["links"] = self.extract_links(soup, url)
            result["link_count"] = len(result["links"])

        # Images
        if extract_images:
            result["images"] = self.extract_images(soup, url)
            result["image_count"] = len(result["images"])

        # Contact info
        page_text = soup.get_text()
        result["emails"] = self.extract_emails(page_text)
        result["phones"] = self.extract_phones(page_text)

        # Custom selectors
        if custom_selectors:
            result["custom_data"] = {}
            for name, selector in custom_selectors.items():
                result["custom_data"][name] = self.extract_text(soup, selector)

        # Word count
        if result["content"]:
            result["word_count"] = len(result["content"].split())

        return result

    async def scrape_multiple_pages(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape multiple pages

        Args:
            input_data: Dict containing:
                - urls: List of URLs to scrape
                - max_concurrent: Max concurrent requests (default: 5)
                - delay_between: Delay between requests in seconds (default: 0.5)

        Returns:
            Dict with results for each URL
        """
        urls = input_data.get("urls", [])
        if not urls:
            return {"success": False, "error": "URLs list is required"}

        max_concurrent = min(input_data.get("max_concurrent", 5), 10)
        delay = input_data.get("delay_between", 0.5)

        self.logger.info(f"Scraping {len(urls)} pages with concurrency {max_concurrent}")

        results = []
        failed = []

        # Process in batches
        for i in range(0, len(urls), max_concurrent):
            batch = urls[i : i + max_concurrent]

            import asyncio

            tasks = [self.scrape_page({"url": url, **input_data}) for url in batch]
            batch_results = await asyncio.gather(*tasks, return_exceptions=True)

            for url, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    failed.append({"url": url, "error": str(result)})
                elif result.get("success"):
                    results.append(result)
                else:
                    failed.append({"url": url, "error": result.get("error", "Unknown error")})

            # Delay between batches
            if i + max_concurrent < len(urls):
                await asyncio.sleep(delay)

        return {
            "success": True,
            "total_urls": len(urls),
            "successful": len(results),
            "failed": len(failed),
            "results": results,
            "errors": failed,
            "scraped_at": datetime.utcnow().isoformat(),
        }

    async def crawl_site(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Crawl a website starting from a URL

        Args:
            input_data: Dict containing:
                - start_url: Starting URL
                - max_pages: Maximum pages to crawl (default: 10)
                - same_domain_only: Only crawl same domain (default: True)
                - max_depth: Maximum crawl depth (default: 2)

        Returns:
            Dict with crawled pages data
        """
        from urllib.parse import urlparse

        start_url = input_data.get("start_url")
        if not start_url:
            return {"success": False, "error": "start_url is required"}

        max_pages = min(input_data.get("max_pages", 10), 50)
        same_domain_only = input_data.get("same_domain_only", True)
        max_depth = min(input_data.get("max_depth", 2), 3)

        parsed_start = urlparse(start_url)
        start_domain = parsed_start.netloc

        self.logger.info(f"Crawling site from {start_url}, max {max_pages} pages")

        visited = set()
        to_visit = [(start_url, 0)]  # (url, depth)
        results = []

        while to_visit and len(results) < max_pages:
            url, depth = to_visit.pop(0)

            if url in visited:
                continue

            visited.add(url)

            # Scrape the page
            result = await self.scrape_page({"url": url, "extract_links": True, "extract_images": False})

            if result.get("success"):
                result["depth"] = depth
                results.append(result)

                # Add discovered links to queue
                if depth < max_depth:
                    for link in result.get("links", []):
                        link_url = link["url"]
                        parsed_link = urlparse(link_url)

                        # Filter links
                        if link_url in visited:
                            continue
                        if same_domain_only and parsed_link.netloc != start_domain:
                            continue
                        if not parsed_link.scheme.startswith("http"):
                            continue
                        if any(ext in link_url.lower() for ext in [".pdf", ".jpg", ".png", ".gif", ".css", ".js"]):
                            continue

                        to_visit.append((link_url, depth + 1))

            # Small delay to be respectful
            import asyncio

            await asyncio.sleep(0.3)

        return {
            "success": True,
            "start_url": start_url,
            "pages_crawled": len(results),
            "pages_discovered": len(visited),
            "max_depth_reached": max(r.get("depth", 0) for r in results) if results else 0,
            "results": results,
            "crawled_at": datetime.utcnow().isoformat(),
        }
