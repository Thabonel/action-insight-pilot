"""
Input validation utilities for backend API endpoints.
Provides consistent validation across all backend services.
"""

import re
from typing import Dict, List, Optional, Tuple


def validate_email(email: str) -> Tuple[bool, Optional[str]]:
    """
    Validate email address format.

    Uses RFC 5322 compliant regex pattern.

    Args:
        email: Email address to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not email or not isinstance(email, str):
        return False, "Email is required"

    if len(email) > 320:
        return False, "Email address is too long (maximum 320 characters)"

    email_pattern = re.compile(
        r'^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+'
        r'@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?'
        r'(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$'
    )

    if not email_pattern.match(email):
        return False, "Invalid email format"

    return True, None


def validate_password_strength(password: str) -> Dict[str, any]:
    """
    Validate password meets security requirements.

    Requirements:
    - Minimum 8 characters
    - At least one lowercase letter
    - At least one uppercase letter
    - At least one number
    - At least one special character
    - Maximum 128 characters

    Args:
        password: Password to validate

    Returns:
        Dict with keys:
        - is_valid: bool
        - errors: List[str]
        - score: int (0-5)
    """
    errors: List[str] = []
    score = 0

    if not password or not isinstance(password, str):
        return {
            "is_valid": False,
            "errors": ["Password is required"],
            "score": 0
        }

    if len(password) > 128:
        errors.append("Password is too long (maximum 128 characters)")
        return {
            "is_valid": False,
            "errors": errors,
            "score": 0
        }

    if len(password) < 8:
        errors.append("Password must be at least 8 characters long")
    else:
        score += 1

    if not re.search(r'[a-z]', password):
        errors.append("Password must contain at least one lowercase letter")
    else:
        score += 1

    if not re.search(r'[A-Z]', password):
        errors.append("Password must contain at least one uppercase letter")
    else:
        score += 1

    if not re.search(r'\d', password):
        errors.append("Password must contain at least one number")
    else:
        score += 1

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        errors.append("Password must contain at least one special character")
    else:
        score += 1

    return {
        "is_valid": len(errors) == 0,
        "errors": errors,
        "score": score
    }


def sanitize_text_input(text: str, max_length: int = 500) -> str:
    """
    Sanitize text input by removing control characters and limiting length.

    Args:
        text: Input text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized text string
    """
    if not text or not isinstance(text, str):
        return ""

    sanitized = text.strip()
    sanitized = re.sub(r'[\x00-\x1F\x7F]', '', sanitized)

    return sanitized[:max_length]


def validate_uuid(uuid_string: str) -> bool:
    """
    Validate UUID format.

    Args:
        uuid_string: String to validate as UUID

    Returns:
        True if valid UUID, False otherwise
    """
    if not uuid_string or not isinstance(uuid_string, str):
        return False

    uuid_pattern = re.compile(
        r'^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
        re.IGNORECASE
    )

    return bool(uuid_pattern.match(uuid_string))


def validate_url(url: str) -> bool:
    """
    Validate URL format and protocol.

    Args:
        url: URL string to validate

    Returns:
        True if valid HTTP/HTTPS URL, False otherwise
    """
    if not url or not isinstance(url, str):
        return False

    url_pattern = re.compile(
        r'^https?://'
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'
        r'localhost|'
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'
        r'(?::\d+)?'
        r'(?:/?|[/?]\S+)$',
        re.IGNORECASE
    )

    return bool(url_pattern.match(url))


def sanitize_sql_input(input_string: str) -> str:
    """
    Basic SQL injection prevention through sanitization.
    Note: This is a defense-in-depth measure. Always use parameterized queries.

    Args:
        input_string: String to sanitize

    Returns:
        Sanitized string
    """
    if not input_string or not isinstance(input_string, str):
        return ""

    dangerous_patterns = [
        r"['\";\\]",
        r'\b(DROP|DELETE|INSERT|UPDATE|SELECT|UNION|ALTER|CREATE|EXEC|EXECUTE)\b'
    ]

    sanitized = input_string
    for pattern in dangerous_patterns:
        sanitized = re.sub(pattern, '', sanitized, flags=re.IGNORECASE)

    return sanitized.strip()[:1000]


class ValidationError(Exception):
    """Custom exception for validation errors."""
    def __init__(self, message: str, field: Optional[str] = None):
        self.message = message
        self.field = field
        super().__init__(self.message)
