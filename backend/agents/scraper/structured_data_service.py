"""
Structured Data Service

Extracts structured data like prices, ratings, contacts, addresses from webpages.
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from .base_scraper_service import BaseScraperService

logger = logging.getLogger(__name__)


class StructuredDataService(BaseScraperService):
    """Service for extracting structured data from webpages"""

    # Common price patterns
    PRICE_PATTERNS = [
        r"\$[\d,]+\.?\d*",  # $123.45 or $1,234
        r"USD\s*[\d,]+\.?\d*",  # USD 123.45
        r"[\d,]+\.?\d*\s*(?:USD|EUR|GBP|dollars?)",  # 123.45 USD
        r"£[\d,]+\.?\d*",  # British pounds
        r"€[\d,]+\.?\d*",  # Euros
    ]

    # Rating patterns
    RATING_PATTERNS = [
        r"(\d+\.?\d*)\s*(?:out of|\/)\s*(\d+)",  # 4.5 out of 5, 4/5
        r"(\d+\.?\d*)\s*stars?",  # 4.5 stars
        r"rating[:\s]*(\d+\.?\d*)",  # rating: 4.5
    ]

    async def extract_structured_data(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract all structured data from a webpage

        Args:
            input_data: Dict containing:
                - url: Target URL
                - extract_prices: Extract price data (default: True)
                - extract_ratings: Extract ratings (default: True)
                - extract_contacts: Extract contact info (default: True)
                - extract_addresses: Extract addresses (default: True)
                - extract_json_ld: Extract JSON-LD schema data (default: True)

        Returns:
            Dict with extracted structured data
        """
        url = input_data.get("url")
        if not url:
            return {"success": False, "error": "URL is required"}

        self.logger.info(f"Extracting structured data from: {url}")

        # Fetch the page
        fetch_result = await self.fetch_page(url)
        if not fetch_result.get("success"):
            return fetch_result

        soup = self.parse_html(fetch_result["html"])
        page_text = soup.get_text()

        result = {
            "success": True,
            "url": fetch_result["url"],
            "fetch_time_ms": fetch_result["fetch_time_ms"],
            "scraped_at": datetime.utcnow().isoformat(),
            "scrape_type": "structured_data",
            "data": {},
        }

        # Extract JSON-LD structured data
        if input_data.get("extract_json_ld", True):
            result["data"]["json_ld"] = self._extract_json_ld(soup)

        # Extract prices
        if input_data.get("extract_prices", True):
            result["data"]["prices"] = self._extract_prices(soup, page_text)

        # Extract ratings
        if input_data.get("extract_ratings", True):
            result["data"]["ratings"] = self._extract_ratings(soup, page_text)

        # Extract contacts
        if input_data.get("extract_contacts", True):
            result["data"]["contacts"] = {
                "emails": self.extract_emails(page_text),
                "phones": self.extract_phones(page_text),
            }

        # Extract addresses
        if input_data.get("extract_addresses", True):
            result["data"]["addresses"] = self._extract_addresses(soup, page_text)

        # Extract social links
        result["data"]["social_links"] = self._extract_social_links(soup, url)

        # Extract business hours
        result["data"]["business_hours"] = self._extract_business_hours(soup, page_text)

        return result

    def _extract_json_ld(self, soup) -> List[Dict[str, Any]]:
        """Extract JSON-LD structured data from script tags"""
        json_ld_data = []

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, list):
                    json_ld_data.extend(data)
                else:
                    json_ld_data.append(data)
            except (json.JSONDecodeError, TypeError):
                continue

        return json_ld_data

    def _extract_prices(self, soup, page_text: str) -> List[Dict[str, Any]]:
        """Extract price information"""
        prices = []

        # Check JSON-LD first for product prices
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    price = self._get_price_from_schema(data)
                    if price:
                        prices.append(price)
            except (json.JSONDecodeError, TypeError):
                continue

        # Check common price selectors
        price_selectors = [
            "[itemprop='price']",
            ".price",
            ".product-price",
            ".sale-price",
            ".current-price",
            "[data-price]",
        ]

        for selector in price_selectors:
            elements = soup.select(selector)
            for el in elements:
                price_text = el.get_text(strip=True)
                price_value = el.get("content") or el.get("data-price")

                if price_text or price_value:
                    prices.append({
                        "text": price_text,
                        "value": price_value,
                        "source": selector,
                    })

        # Extract prices from text using regex
        for pattern in self.PRICE_PATTERNS:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            for match in matches[:5]:  # Limit to first 5 matches per pattern
                if match not in [p.get("text") for p in prices]:
                    prices.append({"text": match, "source": "regex"})

        return prices[:20]  # Limit total prices

    def _get_price_from_schema(self, data: Dict) -> Optional[Dict[str, Any]]:
        """Extract price from JSON-LD schema"""
        if data.get("@type") in ["Product", "Offer"]:
            offers = data.get("offers", data)
            if isinstance(offers, list):
                offers = offers[0] if offers else {}

            price = offers.get("price")
            currency = offers.get("priceCurrency", "USD")

            if price:
                return {
                    "value": price,
                    "currency": currency,
                    "source": "json-ld",
                }
        return None

    def _extract_ratings(self, soup, page_text: str) -> List[Dict[str, Any]]:
        """Extract rating information"""
        ratings = []

        # Check JSON-LD for ratings
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    rating = self._get_rating_from_schema(data)
                    if rating:
                        ratings.append(rating)
            except (json.JSONDecodeError, TypeError):
                continue

        # Check common rating selectors
        rating_selectors = [
            "[itemprop='ratingValue']",
            ".rating",
            ".star-rating",
            ".review-rating",
            "[data-rating]",
        ]

        for selector in rating_selectors:
            elements = soup.select(selector)
            for el in elements:
                rating_text = el.get_text(strip=True)
                rating_value = el.get("content") or el.get("data-rating")

                if rating_text or rating_value:
                    ratings.append({
                        "text": rating_text,
                        "value": rating_value,
                        "source": selector,
                    })

        # Extract ratings from text using regex
        for pattern in self.RATING_PATTERNS:
            matches = re.findall(pattern, page_text, re.IGNORECASE)
            for match in matches[:3]:
                if isinstance(match, tuple):
                    ratings.append({
                        "value": match[0],
                        "max": match[1] if len(match) > 1 else "5",
                        "source": "regex",
                    })

        return ratings[:10]

    def _get_rating_from_schema(self, data: Dict) -> Optional[Dict[str, Any]]:
        """Extract rating from JSON-LD schema"""
        aggregate_rating = data.get("aggregateRating", {})
        if aggregate_rating:
            return {
                "value": aggregate_rating.get("ratingValue"),
                "max": aggregate_rating.get("bestRating", "5"),
                "count": aggregate_rating.get("ratingCount"),
                "source": "json-ld",
            }
        return None

    def _extract_addresses(self, soup, page_text: str) -> List[Dict[str, Any]]:
        """Extract address information"""
        addresses = []

        # Check JSON-LD for addresses
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    address = data.get("address", {})
                    if address and isinstance(address, dict):
                        addresses.append({
                            "street": address.get("streetAddress"),
                            "city": address.get("addressLocality"),
                            "state": address.get("addressRegion"),
                            "postal_code": address.get("postalCode"),
                            "country": address.get("addressCountry"),
                            "source": "json-ld",
                        })
            except (json.JSONDecodeError, TypeError):
                continue

        # Check common address selectors
        address_selectors = [
            "[itemprop='address']",
            ".address",
            ".location",
            "address",
        ]

        for selector in address_selectors:
            elements = soup.select(selector)
            for el in elements:
                address_text = self.clean_text(el.get_text())
                if address_text and len(address_text) > 10:
                    addresses.append({
                        "text": address_text,
                        "source": selector,
                    })

        return addresses[:5]

    def _extract_social_links(self, soup, base_url: str) -> Dict[str, str]:
        """Extract social media links"""
        social_patterns = {
            "facebook": r"facebook\.com",
            "twitter": r"twitter\.com|x\.com",
            "instagram": r"instagram\.com",
            "linkedin": r"linkedin\.com",
            "youtube": r"youtube\.com",
            "tiktok": r"tiktok\.com",
            "pinterest": r"pinterest\.com",
        }

        social_links = {}

        for a in soup.find_all("a", href=True):
            href = a["href"]
            for platform, pattern in social_patterns.items():
                if re.search(pattern, href, re.IGNORECASE):
                    if platform not in social_links:
                        social_links[platform] = href

        return social_links

    def _extract_business_hours(self, soup, page_text: str) -> Optional[Dict[str, Any]]:
        """Extract business hours if available"""
        # Check JSON-LD
        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    hours = data.get("openingHours") or data.get("openingHoursSpecification")
                    if hours:
                        return {"hours": hours, "source": "json-ld"}
            except (json.JSONDecodeError, TypeError):
                continue

        # Check for hours in specific elements
        hours_selectors = [
            ".hours",
            ".opening-hours",
            ".business-hours",
            "[itemprop='openingHours']",
        ]

        for selector in hours_selectors:
            element = soup.select_one(selector)
            if element:
                return {
                    "text": self.clean_text(element.get_text()),
                    "source": selector,
                }

        return None

    async def extract_contact_info(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Extract only contact information from a webpage

        Args:
            input_data: Dict containing:
                - url: Target URL

        Returns:
            Dict with contact information
        """
        url = input_data.get("url")
        if not url:
            return {"success": False, "error": "URL is required"}

        fetch_result = await self.fetch_page(url)
        if not fetch_result.get("success"):
            return fetch_result

        soup = self.parse_html(fetch_result["html"])
        page_text = soup.get_text()

        return {
            "success": True,
            "url": fetch_result["url"],
            "scrape_type": "contact_info",
            "data": {
                "emails": self.extract_emails(page_text),
                "phones": self.extract_phones(page_text),
                "addresses": self._extract_addresses(soup, page_text),
                "social_links": self._extract_social_links(soup, url),
            },
            "scraped_at": datetime.utcnow().isoformat(),
        }
