# src/main.py - Entry point for uvicorn
from backend.main import app

# This file allows uvicorn to run 'main:app' from the src directory
# while keeping all the actual code in the backend package
