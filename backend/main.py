from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime
import logging
import uuid
import os
from typing import Dict, Any

from config import agent_manager, get_environment_config
from models import APIResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Agentic AI Marketing Platform",
    version="1.0.0",
    description="AI-powered marketing automation platform with intelligent agents",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS with specific allowed origins
origins = [
    "https://aiboostcampaign.com",
    "https://www.aiboostcampaign.com", 
    "https://6f5cbaff-337b-4343-bac3-e1fb48a7ef5d.lovableproject.com",
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173"
]

# Add additional origins from environment if provided
additional_origins = os.getenv("CORS_ORIGINS", "")
if additional_origins:
    origins.extend([origin.strip() for origin in additional_origins.split(",") if origin.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400  # Cache preflight requests for 24 hours
)

# Add request logging middleware for debugging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all incoming requests for debugging"""
    # Only log in development
    if os.getenv("ENVIRONMENT", "development") == "development":
        logger.info(f"{request.method} {request.url.path} - Origin: {request.headers.get('origin', 'No origin')}")
    
    response = await call_next(request)
    return response

# Import and include routers with /api prefix
try:
    from routes import campaigns, leads, content, proposals
    
    # Include routers with /api prefix - CRITICAL for frontend compatibility
    app.include_router(campaigns.router, prefix="/api", tags=["campaigns"])
    app.include_router(leads.router, prefix="/api", tags=["leads"])
    app.include_router(content.router, prefix="/api", tags=["content"])
    app.include_router(proposals.router, prefix="/api", tags=["proposals"])
    
    logger.info("✅ All routers loaded successfully with /api prefix")
except ImportError as e:
    logger.error(f"❌ Error importing routers: {e}")
    logger.warning("Running without some routes - check imports")
except Exception as e:
    logger.error(f"❌ Error loading routers: {e}")

# ================== HEALTH CHECK & INFO ENDPOINTS ==================

@app.get("/health", tags=["system"])
async def health_check():
    """Health check endpoint for monitoring"""
    try:
        return {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "agents_available": agent_manager.agents_available if hasattr(agent_manager, 'agents_available') else False,
            "version": "1.0.0",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "cors_origins": origins
        }
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "degraded",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

@app.get("/", tags=["system"])
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Agentic AI Marketing Platform API",
        "version": "1.0.0",
        "status": "operational",
        "agents_status": "loaded" if hasattr(agent_manager, 'agents_available') and agent_manager.agents_available else "using_mock_data",
        "documentation": {
            "swagger": "/docs",
            "redoc": "/redoc"
        },
        "health_check": "/health",
        "api_status": "/api/status"
    }

@app.get("/api/health", tags=["system"])
async def api_health():
    """API health endpoint - duplicate for compatibility"""
    return await health_check()

@app.get("/api/status", tags=["system"])
async def api_status():
    """Detailed API status with agent information"""
    agents_available = hasattr(agent_manager, 'agents_available') and agent_manager.agents_available
    
    if agents_available:
        agents = {
            "campaign_agent": "active",
            "lead_generation_agent": "active", 
            "content_agent": "active",
            "social_media_agent": "active",
            "email_automation_agent": "active",
            "analytics_agent": "active",
            "proposal_generator": "active"
        }
        mode = "production"
    else:
        agents = {
            "campaign_agent": "mock_mode",
            "lead_generation_agent": "mock_mode",
            "content_agent": "mock_mode", 
            "social_media_agent": "mock_mode",
            "email_automation_agent": "mock_mode",
            "analytics_agent": "mock_mode",
            "proposal_generator": "mock_mode"
        }
        mode = "development"
    
    return {
        "api_version": "1.0.0",
        "status": "operational",
        "mode": mode,
        "agents": agents,
        "endpoints": {
            "campaigns": "/api/campaigns/*",
            "leads": "/api/leads/*", 
            "content": "/api/content/*",
            "proposals": "/api/proposals/*",
            "health": "/health, /api/health",
            "status": "/api/status"
        },
        "features": {
            "ai_agents": agents_available,
            "mock_data": not agents_available,
            "cors_enabled": True,
            "authentication": "supabase" if os.getenv("SUPABASE_URL") else "none"
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/config", tags=["system"])
async def get_config():
    """Get non-sensitive configuration information"""
    config = get_environment_config()
    
    return {
        "environment": config.get("environment", "development"),
        "features": {
            "openai_configured": bool(config.get("openai_key")),
            "supabase_configured": bool(config.get("supabase_url") and config.get("supabase_key")),
            "email_configured": bool(os.getenv("SENDGRID_API_KEY") or os.getenv("SMTP_HOST")),
            "social_configured": bool(os.getenv("LINKEDIN_ACCESS_TOKEN") or os.getenv("TWITTER_BEARER_TOKEN"))
        },
        "api_version": "1.0.0",
        "cors_origins_count": len(origins)
    }

# ================== ERROR HANDLERS ==================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Custom 404 handler"""
    return JSONResponse(
        status_code=404,
        content={
            "success": False,
            "error": f"Endpoint not found: {request.url.path}",
            "suggestion": "Check API documentation at /docs",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unexpected errors"""
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    
    # Don't expose internal errors in production
    if os.getenv("ENVIRONMENT") == "production":
        error_detail = "An unexpected error occurred. Please try again later."
    else:
        error_detail = f"Internal server error: {str(exc)}"
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": error_detail,
            "request_id": str(uuid.uuid4()),  # For tracking in logs
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ================== STARTUP & SHUTDOWN EVENTS ==================

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("🚀 Starting Agentic AI Marketing Platform API...")
    
    try:
        config = get_environment_config()
        
        # Log configuration status
        logger.info(f"📍 Environment: {config.get('environment', 'development')}")
        logger.info(f"📍 Host: {config.get('host', '0.0.0.0')}:{config.get('port', 8000)}")
        logger.info(f"📍 CORS enabled for {len(origins)} origins")
        
        # Check agent availability
        if hasattr(agent_manager, 'agents_available') and agent_manager.agents_available:
            # Check API keys
            if config.get("openai_key"):
                logger.info("✅ OpenAI API key configured")
            else:
                logger.warning("⚠️  No OpenAI API key found - AI features will be limited")
            
            # Check database
            if config.get("supabase_url") and config.get("supabase_key"):
                logger.info("✅ Supabase database configured")
            else:
                logger.warning("⚠️  No Supabase configuration - using in-memory storage")
            
            # Check email service
            if os.getenv("SENDGRID_API_KEY"):
                logger.info("✅ SendGrid email service configured")
            elif os.getenv("SMTP_HOST"):
                logger.info("✅ SMTP email service configured")
            else:
                logger.warning("⚠️  No email service configured")
            
            # Check social media
            social_configured = []
            if os.getenv("LINKEDIN_ACCESS_TOKEN"):
                social_configured.append("LinkedIn")
            if os.getenv("TWITTER_BEARER_TOKEN"):
                social_configured.append("Twitter")
            if os.getenv("FACEBOOK_ACCESS_TOKEN"):
                social_configured.append("Facebook")
            
            if social_configured:
                logger.info(f"✅ Social media configured: {', '.join(social_configured)}")
            else:
                logger.warning("⚠️  No social media platforms configured")
            
            # Initialize MCP if available
            if hasattr(agent_manager, 'initialize_mcp'):
                await agent_manager.initialize_mcp()
                logger.info("✅ MCP integration initialized")
            
            logger.info("✅ All agents initialized successfully")
        else:
            logger.info("🔧 Running in mock mode - agents not available")
            logger.info("💡 To enable agents, ensure all required dependencies are installed")
        
        logger.info("✅ API startup complete - ready to serve requests")
        
    except Exception as e:
        logger.error(f"❌ Error during startup: {e}", exc_info=True)
        logger.warning("⚠️  API started with errors - some features may not work")

@app.on_event("shutdown") 
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("🛑 Shutting down Agentic AI Marketing Platform API...")
    
    try:
        # Cleanup any agent resources
        if hasattr(agent_manager, 'cleanup'):
            await agent_manager.cleanup()
            logger.info("✅ Agent cleanup completed")
        
        # Any other cleanup tasks
        logger.info("✅ Shutdown complete")
        
    except Exception as e:
        logger.error(f"❌ Error during shutdown: {e}", exc_info=True)

# ================== UTILITY ENDPOINTS ==================

@app.get("/api/ping", tags=["system"])
async def ping():
    """Simple ping endpoint for connection testing"""
    return {"ping": "pong", "timestamp": datetime.utcnow().isoformat()}

@app.post("/api/echo", tags=["system"])
async def echo(data: Dict[str, Any]):
    """Echo endpoint for testing request/response"""
    return {
        "echo": data,
        "received_at": datetime.utcnow().isoformat()
    }

# ================== MAIN ==================

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration
    config = get_environment_config()
    
    # Configure uvicorn
    uvicorn_config = {
        "host": config.get("host", "0.0.0.0"),
        "port": config.get("port", 8000),
        "reload": config.get("environment") == "development",
        "log_level": "info" if config.get("environment") == "production" else "debug",
        "access_log": True
    }
    
    logger.info(f"Starting server with config: {uvicorn_config}")
    
    # Run the application
    uvicorn.run(app, **uvicorn_config)
