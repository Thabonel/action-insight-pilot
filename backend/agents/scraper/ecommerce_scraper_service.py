"""
E-commerce Scraper Service

Specialized scraper for e-commerce product pages and listings.
"""

import re
import json
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime
from urllib.parse import urljoin, urlparse
from .base_scraper_service import BaseScraperService

logger = logging.getLogger(__name__)


class EcommerceScraperService(BaseScraperService):
    """Service for scraping e-commerce websites"""

    # Common e-commerce selectors by site type
    PRODUCT_SELECTORS = {
        "generic": {
            "title": ["h1", "[itemprop='name']", ".product-title", ".product-name"],
            "price": ["[itemprop='price']", ".price", ".product-price", ".current-price"],
            "description": ["[itemprop='description']", ".product-description", ".description"],
            "image": ["[itemprop='image']", ".product-image img", ".gallery img"],
            "rating": ["[itemprop='ratingValue']", ".rating", ".star-rating"],
            "reviews": ["[itemprop='reviewCount']", ".review-count", ".num-reviews"],
            "sku": ["[itemprop='sku']", ".sku", ".product-sku"],
            "availability": ["[itemprop='availability']", ".availability", ".stock-status"],
        },
    }

    async def scrape_product_page(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape a single product page

        Args:
            input_data: Dict containing:
                - url: Product page URL
                - custom_selectors: Optional custom CSS selectors

        Returns:
            Dict with product data
        """
        url = input_data.get("url")
        if not url:
            return {"success": False, "error": "URL is required"}

        custom_selectors = input_data.get("custom_selectors", {})

        self.logger.info(f"Scraping product page: {url}")

        fetch_result = await self.fetch_page(url)
        if not fetch_result.get("success"):
            return fetch_result

        soup = self.parse_html(fetch_result["html"])

        # Try to extract from JSON-LD first (most reliable)
        json_ld_product = self._extract_product_from_json_ld(soup)

        # Extract using HTML selectors
        html_product = self._extract_product_from_html(soup, url, custom_selectors)

        # Merge results (JSON-LD takes priority)
        product = {**html_product, **{k: v for k, v in json_ld_product.items() if v}}

        return {
            "success": True,
            "url": fetch_result["url"],
            "fetch_time_ms": fetch_result["fetch_time_ms"],
            "scraped_at": datetime.utcnow().isoformat(),
            "scrape_type": "product",
            "product": product,
        }

    def _extract_product_from_json_ld(self, soup) -> Dict[str, Any]:
        """Extract product data from JSON-LD structured data"""
        product = {}

        for script in soup.find_all("script", type="application/ld+json"):
            try:
                data = json.loads(script.string)

                # Handle array of schemas
                if isinstance(data, list):
                    for item in data:
                        if item.get("@type") == "Product":
                            data = item
                            break
                    else:
                        continue

                if data.get("@type") != "Product":
                    continue

                product["name"] = data.get("name")
                product["description"] = data.get("description")
                product["sku"] = data.get("sku")
                product["brand"] = data.get("brand", {}).get("name") if isinstance(data.get("brand"), dict) else data.get("brand")
                product["category"] = data.get("category")

                # Image
                image = data.get("image")
                if isinstance(image, list):
                    product["images"] = image
                elif isinstance(image, str):
                    product["images"] = [image]

                # Offers/Price
                offers = data.get("offers", {})
                if isinstance(offers, list):
                    offers = offers[0] if offers else {}

                product["price"] = offers.get("price")
                product["currency"] = offers.get("priceCurrency", "USD")
                product["availability"] = offers.get("availability", "").replace("https://schema.org/", "")

                # Rating
                rating = data.get("aggregateRating", {})
                if rating:
                    product["rating"] = {
                        "value": rating.get("ratingValue"),
                        "count": rating.get("ratingCount"),
                        "max": rating.get("bestRating", "5"),
                    }

                product["data_source"] = "json-ld"
                break

            except (json.JSONDecodeError, TypeError, AttributeError):
                continue

        return product

    def _extract_product_from_html(self, soup, base_url: str, custom_selectors: Dict = None) -> Dict[str, Any]:
        """Extract product data from HTML using selectors"""
        selectors = {**self.PRODUCT_SELECTORS["generic"]}
        if custom_selectors:
            for key, value in custom_selectors.items():
                if isinstance(value, str):
                    selectors[key] = [value]
                else:
                    selectors[key] = value

        product = {}

        # Title
        for sel in selectors.get("title", []):
            title = self.extract_text(soup, sel)
            if title:
                product["name"] = title
                break

        # Price
        for sel in selectors.get("price", []):
            element = soup.select_one(sel)
            if element:
                product["price_text"] = element.get_text(strip=True)
                product["price"] = element.get("content") or self._parse_price(product["price_text"])
                break

        # Description
        for sel in selectors.get("description", []):
            desc = self.extract_text(soup, sel)
            if desc:
                product["description"] = desc[:1000]  # Limit length
                break

        # Images
        images = []
        for sel in selectors.get("image", []):
            for img in soup.select(sel)[:5]:  # Limit to 5 images
                src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
                if src:
                    images.append(urljoin(base_url, src))
        product["images"] = images

        # Rating
        for sel in selectors.get("rating", []):
            element = soup.select_one(sel)
            if element:
                rating_text = element.get("content") or element.get_text(strip=True)
                product["rating"] = {"text": rating_text}
                break

        # Review count
        for sel in selectors.get("reviews", []):
            reviews = self.extract_text(soup, sel)
            if reviews:
                product["review_count"] = reviews
                break

        # SKU
        for sel in selectors.get("sku", []):
            sku = self.extract_text(soup, sel)
            if sku:
                product["sku"] = sku
                break

        # Availability
        for sel in selectors.get("availability", []):
            element = soup.select_one(sel)
            if element:
                product["availability"] = element.get("content") or element.get_text(strip=True)
                break

        product["data_source"] = "html"
        return product

    def _parse_price(self, price_text: str) -> Optional[str]:
        """Parse price value from text"""
        if not price_text:
            return None

        # Remove currency symbols and extract number
        match = re.search(r"[\d,]+\.?\d*", price_text.replace(",", ""))
        if match:
            return match.group()
        return None

    async def scrape_product_listing(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape a product listing/category page

        Args:
            input_data: Dict containing:
                - url: Listing page URL
                - product_selector: CSS selector for product items
                - max_products: Maximum products to extract (default: 20)
                - pagination_selector: CSS selector for next page link
                - max_pages: Maximum pages to scrape (default: 1)

        Returns:
            Dict with list of products
        """
        url = input_data.get("url")
        if not url:
            return {"success": False, "error": "URL is required"}

        product_selector = input_data.get("product_selector", ".product, .product-item, [data-product]")
        max_products = min(input_data.get("max_products", 20), 100)
        pagination_selector = input_data.get("pagination_selector")
        max_pages = min(input_data.get("max_pages", 1), 5)

        self.logger.info(f"Scraping product listing: {url}")

        all_products = []
        current_url = url
        pages_scraped = 0

        while pages_scraped < max_pages and len(all_products) < max_products:
            fetch_result = await self.fetch_page(current_url)
            if not fetch_result.get("success"):
                break

            soup = self.parse_html(fetch_result["html"])

            # Extract products from this page
            product_elements = soup.select(product_selector)

            for element in product_elements:
                if len(all_products) >= max_products:
                    break

                product = self._extract_listing_product(element, current_url)
                if product.get("name") or product.get("url"):
                    all_products.append(product)

            pages_scraped += 1

            # Check for next page
            if pagination_selector and pages_scraped < max_pages:
                next_link = soup.select_one(pagination_selector)
                if next_link and next_link.get("href"):
                    current_url = urljoin(url, next_link["href"])
                    import asyncio
                    await asyncio.sleep(0.5)  # Delay between pages
                else:
                    break
            else:
                break

        return {
            "success": True,
            "url": url,
            "scraped_at": datetime.utcnow().isoformat(),
            "scrape_type": "product_listing",
            "pages_scraped": pages_scraped,
            "product_count": len(all_products),
            "products": all_products,
        }

    def _extract_listing_product(self, element, base_url: str) -> Dict[str, Any]:
        """Extract product info from a listing item element"""
        product = {}

        # Name/Title
        title_el = element.select_one("h2, h3, h4, .title, .name, .product-name, [itemprop='name']")
        if title_el:
            product["name"] = title_el.get_text(strip=True)

        # URL
        link = element.select_one("a[href]")
        if link:
            product["url"] = urljoin(base_url, link["href"])

        # Price
        price_el = element.select_one(".price, [itemprop='price'], .product-price")
        if price_el:
            product["price_text"] = price_el.get_text(strip=True)
            product["price"] = price_el.get("content") or self._parse_price(product["price_text"])

        # Image
        img = element.select_one("img")
        if img:
            src = img.get("src") or img.get("data-src") or img.get("data-lazy-src")
            if src:
                product["image"] = urljoin(base_url, src)

        # Rating
        rating_el = element.select_one(".rating, .stars, [itemprop='ratingValue']")
        if rating_el:
            product["rating"] = rating_el.get("content") or rating_el.get_text(strip=True)

        return product

    async def compare_products(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Scrape and compare multiple product pages

        Args:
            input_data: Dict containing:
                - urls: List of product URLs to compare

        Returns:
            Dict with comparison data
        """
        urls = input_data.get("urls", [])
        if not urls:
            return {"success": False, "error": "URLs list is required"}

        if len(urls) > 10:
            urls = urls[:10]  # Limit to 10 products

        self.logger.info(f"Comparing {len(urls)} products")

        import asyncio
        tasks = [self.scrape_product_page({"url": url}) for url in urls]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        products = []
        errors = []

        for url, result in zip(urls, results):
            if isinstance(result, Exception):
                errors.append({"url": url, "error": str(result)})
            elif result.get("success"):
                products.append(result.get("product", {}))
            else:
                errors.append({"url": url, "error": result.get("error", "Unknown error")})

        # Build comparison summary
        comparison = {
            "price_range": self._get_price_range(products),
            "rating_range": self._get_rating_range(products),
            "availability_summary": self._get_availability_summary(products),
        }

        return {
            "success": True,
            "scraped_at": datetime.utcnow().isoformat(),
            "scrape_type": "product_comparison",
            "product_count": len(products),
            "products": products,
            "comparison": comparison,
            "errors": errors,
        }

    def _get_price_range(self, products: List[Dict]) -> Dict[str, Any]:
        """Calculate price range from products"""
        prices = []
        for p in products:
            price = p.get("price")
            if price:
                try:
                    prices.append(float(str(price).replace(",", "")))
                except ValueError:
                    pass

        if not prices:
            return {"min": None, "max": None, "avg": None}

        return {
            "min": min(prices),
            "max": max(prices),
            "avg": round(sum(prices) / len(prices), 2),
            "count": len(prices),
        }

    def _get_rating_range(self, products: List[Dict]) -> Dict[str, Any]:
        """Calculate rating range from products"""
        ratings = []
        for p in products:
            rating = p.get("rating", {})
            if isinstance(rating, dict):
                val = rating.get("value")
            else:
                val = rating

            if val:
                try:
                    ratings.append(float(str(val)))
                except ValueError:
                    pass

        if not ratings:
            return {"min": None, "max": None, "avg": None}

        return {
            "min": min(ratings),
            "max": max(ratings),
            "avg": round(sum(ratings) / len(ratings), 2),
            "count": len(ratings),
        }

    def _get_availability_summary(self, products: List[Dict]) -> Dict[str, int]:
        """Summarize product availability"""
        summary = {"in_stock": 0, "out_of_stock": 0, "unknown": 0}

        for p in products:
            avail = str(p.get("availability", "")).lower()
            if "instock" in avail or "in stock" in avail:
                summary["in_stock"] += 1
            elif "outofstock" in avail or "out of stock" in avail:
                summary["out_of_stock"] += 1
            else:
                summary["unknown"] += 1

        return summary
