from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import route modules
from routes import campaigns, leads, content, proposals, internal_publishing, email, integrations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic AI Marketing Platform API", version="1.0.0")

# Configure CORS with more permissive settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Production URLs
        "https://main--agentic-ai-marketing.netlify.app",
        "https://wheels-wins-orchestrator.onrender.com",
        # Development URLs
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        # Lovable URLs (more comprehensive)
        "https://lovable.dev",
        "https://app.lovable.dev",
        "https://preview.lovable.dev",
        "https://deploy.lovable.dev",
        # Add wildcard for Lovable subdomains in development
        "*"  # Temporary - remove in production
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
    ],
    expose_headers=["*"],
)

# Add explicit OPTIONS handler for troubleshooting
@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle OPTIONS requests explicitly"""
    return {"message": "OK"}

# Include routers
app.include_router(campaigns.router)
app.include_router(leads.router)
app.include_router(content.router)
app.include_router(proposals.router)
app.include_router(internal_publishing.router)
app.include_router(email.router)
app.include_router(integrations.router)

@app.get("/")
async def root():
    return {"message": "Agentic AI Marketing Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "marketing-platform-api"}

# Add a test endpoint for CORS debugging
@app.get("/api/test")
async def test_cors():
    return {"message": "CORS test successful", "timestamp": "2025-06-13"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
