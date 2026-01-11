"""
Pytest configuration for backend tests.
Sets up test environment before app import.
"""
import os

# Enable test fallback routers before any test modules are imported
# This must happen at conftest.py load time, before test_main.py imports backend.main
os.environ["ENABLE_TEST_FALLBACK_ROUTERS"] = "1"
