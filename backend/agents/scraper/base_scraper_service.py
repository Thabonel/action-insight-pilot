"""
Base Scraper Service

Provides common scraping functionality shared across all scraper services.
"""

import asyncio
import logging
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urlparse, urljoin
import aiohttp
from bs4 import BeautifulSoup

logger = logging.getLogger(__name__)


class BaseScraperService:
    """Base service for web scraping operations"""

    # Common user agents for rotation
    USER_AGENTS = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15",
    ]

    def __init__(self, supabase_client, agent_id: int, ai_service=None):
        self.supabase = supabase_client
        self.agent_id = agent_id
        self.ai_service = ai_service
        self.logger = logging.getLogger(f"{self.__class__.__name__}_{agent_id}")
        self._session: Optional[aiohttp.ClientSession] = None
        self._user_agent_index = 0

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session"""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=30)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session

    async def close(self):
        """Close the aiohttp session"""
        if self._session and not self._session.closed:
            await self._session.close()

    def _get_headers(self, custom_headers: Dict[str, str] = None) -> Dict[str, str]:
        """Get request headers with rotating user agent"""
        self._user_agent_index = (self._user_agent_index + 1) % len(self.USER_AGENTS)
        headers = {
            "User-Agent": self.USER_AGENTS[self._user_agent_index],
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }
        if custom_headers:
            headers.update(custom_headers)
        return headers

    async def fetch_page(
        self,
        url: str,
        headers: Dict[str, str] = None,
        retry_count: int = 3,
        delay_between_retries: float = 1.0,
    ) -> Dict[str, Any]:
        """
        Fetch a webpage with retry logic

        Returns:
            Dict with keys: success, html, status_code, error, url, fetch_time_ms
        """
        session = await self._get_session()
        request_headers = self._get_headers(headers)
        start_time = datetime.now()

        for attempt in range(retry_count):
            try:
                async with session.get(url, headers=request_headers, allow_redirects=True) as response:
                    html = await response.text()
                    fetch_time = (datetime.now() - start_time).total_seconds() * 1000

                    if response.status == 200:
                        return {
                            "success": True,
                            "html": html,
                            "status_code": response.status,
                            "url": str(response.url),
                            "fetch_time_ms": round(fetch_time, 2),
                        }
                    elif response.status == 403:
                        self.logger.warning(f"Access forbidden (403) for {url}")
                        return {
                            "success": False,
                            "error": "Access forbidden - site may be blocking scrapers",
                            "status_code": 403,
                            "url": url,
                            "fetch_time_ms": round(fetch_time, 2),
                        }
                    elif response.status == 429:
                        self.logger.warning(f"Rate limited (429) for {url}, waiting...")
                        await asyncio.sleep(delay_between_retries * (attempt + 1) * 2)
                        continue
                    else:
                        self.logger.warning(f"HTTP {response.status} for {url}")
                        if attempt < retry_count - 1:
                            await asyncio.sleep(delay_between_retries)
                            continue
                        return {
                            "success": False,
                            "error": f"HTTP error: {response.status}",
                            "status_code": response.status,
                            "url": url,
                            "fetch_time_ms": round(fetch_time, 2),
                        }

            except asyncio.TimeoutError:
                self.logger.warning(f"Timeout fetching {url}, attempt {attempt + 1}/{retry_count}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(delay_between_retries)
                    continue
                return {
                    "success": False,
                    "error": "Request timeout",
                    "url": url,
                    "fetch_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
                }
            except aiohttp.ClientError as e:
                self.logger.error(f"Client error fetching {url}: {str(e)}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(delay_between_retries)
                    continue
                return {
                    "success": False,
                    "error": f"Connection error: {str(e)}",
                    "url": url,
                    "fetch_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
                }

        return {
            "success": False,
            "error": "Max retries exceeded",
            "url": url,
            "fetch_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
        }

    def parse_html(self, html: str) -> BeautifulSoup:
        """Parse HTML content into BeautifulSoup object"""
        return BeautifulSoup(html, "lxml")

    def extract_text(self, soup: BeautifulSoup, selector: str) -> Optional[str]:
        """Extract text from element matching CSS selector"""
        element = soup.select_one(selector)
        return element.get_text(strip=True) if element else None

    def extract_all_text(self, soup: BeautifulSoup, selector: str) -> List[str]:
        """Extract text from all elements matching CSS selector"""
        elements = soup.select(selector)
        return [el.get_text(strip=True) for el in elements if el.get_text(strip=True)]

    def extract_attribute(self, soup: BeautifulSoup, selector: str, attribute: str) -> Optional[str]:
        """Extract attribute value from element matching CSS selector"""
        element = soup.select_one(selector)
        return element.get(attribute) if element else None

    def extract_links(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract all links from the page"""
        links = []
        for a in soup.find_all("a", href=True):
            href = a["href"]
            absolute_url = urljoin(base_url, href)
            text = a.get_text(strip=True)
            links.append({"url": absolute_url, "text": text})
        return links

    def extract_images(self, soup: BeautifulSoup, base_url: str) -> List[Dict[str, str]]:
        """Extract all images from the page"""
        images = []
        for img in soup.find_all("img"):
            src = img.get("src", "")
            if src:
                absolute_url = urljoin(base_url, src)
                alt = img.get("alt", "")
                images.append({"url": absolute_url, "alt": alt})
        return images

    def extract_meta_tags(self, soup: BeautifulSoup) -> Dict[str, str]:
        """Extract common meta tags"""
        meta = {}

        # Title
        title_tag = soup.find("title")
        if title_tag:
            meta["title"] = title_tag.get_text(strip=True)

        # Meta description
        desc = soup.find("meta", attrs={"name": "description"})
        if desc:
            meta["description"] = desc.get("content", "")

        # Open Graph tags
        for og_tag in soup.find_all("meta", attrs={"property": re.compile(r"^og:")}):
            prop = og_tag.get("property", "").replace("og:", "og_")
            meta[prop] = og_tag.get("content", "")

        # Twitter cards
        for tw_tag in soup.find_all("meta", attrs={"name": re.compile(r"^twitter:")}):
            name = tw_tag.get("name", "").replace("twitter:", "twitter_")
            meta[name] = tw_tag.get("content", "")

        return meta

    def clean_text(self, text: str) -> str:
        """Clean extracted text by removing extra whitespace"""
        if not text:
            return ""
        # Remove extra whitespace
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def extract_emails(self, text: str) -> List[str]:
        """Extract email addresses from text"""
        email_pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
        return list(set(re.findall(email_pattern, text)))

    def extract_phones(self, text: str) -> List[str]:
        """Extract phone numbers from text"""
        phone_patterns = [
            r"\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}",
            r"\+?[0-9]{1,3}[-.\s]?[0-9]{2,4}[-.\s]?[0-9]{3,4}[-.\s]?[0-9]{3,4}",
        ]
        phones = []
        for pattern in phone_patterns:
            matches = re.findall(pattern, text)
            phones.extend(matches)
        return list(set(phones))

    async def save_scrape_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Save scrape result to database"""
        try:
            data = {
                "agent_id": self.agent_id,
                "url": result.get("url"),
                "scrape_type": result.get("scrape_type", "generic"),
                "data": result.get("data", {}),
                "status": "success" if result.get("success") else "failed",
                "error_message": result.get("error"),
                "created_at": datetime.utcnow().isoformat(),
            }

            response = self.supabase.table("scrape_results").insert(data).execute()

            if response.data:
                return {"success": True, "id": response.data[0].get("id")}
            return {"success": False, "error": "Failed to save result"}

        except Exception as e:
            self.logger.error(f"Error saving scrape result: {str(e)}")
            return {"success": False, "error": str(e)}
