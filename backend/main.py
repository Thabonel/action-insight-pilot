
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import logging
import uuid

from config import agent_manager, get_environment_config
from models import APIResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic AI Marketing Platform", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aiboostcampaign.com",
        "https://www.aiboostcampaign.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Import and include routers
try:
    from routes import campaigns, leads, content, proposals
    app.include_router(campaigns.router)
    app.include_router(leads.router)
    app.include_router(content.router)
    app.include_router(proposals.router)
    logger.info("All routers loaded successfully")
except Exception as e:
    logger.error(f"Error loading routers: {e}")

# ================== HEALTH CHECK & INFO ENDPOINTS ==================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "agents_available": agent_manager.agents_available,
        "version": "1.0.0"
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic AI Marketing Platform API",
        "version": "1.0.0",
        "agents_status": "loaded" if agent_manager.agents_available else "using_mock_data",
        "documentation": "/docs",
        "health_check": "/health"
    }

@app.get("/api/status")
async def api_status():
    """API status endpoint with agent information"""
    if agent_manager.agents_available:
        agents = {
            "campaign_agent": "loaded",
            "lead_generation_agent": "loaded", 
            "content_agent": "loaded",
            "social_media_agent": "loaded",
            "email_automation_agent": "loaded",
            "analytics_agent": "loaded",
            "proposal_generator": "loaded"
        }
    else:
        agents = {
            "campaign_agent": "mock_data",
            "lead_generation_agent": "mock_data",
            "content_agent": "mock_data", 
            "social_media_agent": "mock_data",
            "email_automation_agent": "mock_data",
            "analytics_agent": "mock_data",
            "proposal_generator": "mock_data"
        }
    
    return {
        "api_version": "1.0.0",
        "status": "operational",
        "agents": agents,
        "endpoints": {
            "campaigns": 6,
            "leads": 4, 
            "content": 2,
            "proposals": 5,
        },
        "total_endpoints": 17,
        "timestamp": datetime.now().isoformat()
    }

# ================== ERROR HANDLERS ==================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Custom HTTP exception handler"""
    return APIResponse(
        success=False,
        error=f"HTTP {exc.status_code}: {exc.detail}"
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """General exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return APIResponse(
        success=False,
        error="An unexpected error occurred. Please try again later."
    )

# ================== STARTUP EVENTS ==================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Agentic AI Marketing Platform API...")
    
    config = get_environment_config()
    
    if agent_manager.agents_available:
        try:
            if config["openai_key"]:
                logger.info("OpenAI API key found")
            else:
                logger.warning("No OpenAI API key found - agents may have limited functionality")
                
            if config["supabase_url"] and config["supabase_key"]:
                logger.info("Supabase configuration found")
            else:
                logger.warning("No Supabase configuration found - using in-memory storage")
            
            logger.info("All agents initialized successfully")
            await agent_manager.initialize_mcp()
        except Exception as e:
            logger.error(f"Error initializing agents: {e}")
    else:
        logger.info("Running in mock mode - agents not available")
    
    logger.info("API startup complete")

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Agentic AI Marketing Platform API...")

# ================== MAIN ==================

if __name__ == "__main__":
    import uvicorn
    config = get_environment_config()
    
    uvicorn.run(
        app, 
        host=config["host"], 
        port=config["port"],
        reload=config["environment"] == "development"
    )
