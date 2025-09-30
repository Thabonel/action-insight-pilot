import os
import logging
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Marketing Automation API", version="1.0.2")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aiboostcampaign.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wheels-wins-orchestrator.onrender.com",  
        "https://lovable.dev",
        "https://app.lovable.dev",
        "*",  # Allow all origins during deployment debugging
    ],
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
)

# ─────────────────────────── MINIMAL ROUTER IMPORTS ─────────────────────────── #
# Start with minimal imports for stable deployment

# Only load essential routers that don't have complex dependencies
essential_routers = [
    ("routes.system_health", "router"),
]

loaded_routers = []

# Load essential routers first
for module_path, router_name in essential_routers:
    try:
        module = __import__(module_path, fromlist=[router_name])
        if hasattr(module, "router"):
            router = getattr(module, "router")
            app.include_router(router)
            loaded_routers.append(module_path)
            logger.info(f"✅ Loaded essential router: {module_path}")
        else:
            logger.warning(f"⚠️ Router {module_path} exists but has no 'router' attribute")
    except Exception as e:
        logger.error(f"❌ Failed to load essential router {module_path}: {str(e)}")

# Try to load other routers with better error handling
optional_routers = [
    ("routes.unified_agents", "router"),
    ("routes.campaigns", "router"),
    ("routes.email", "router"),
    ("routes.workflows", "router"),
    ("routes.brand", "router"),
    ("routes.keyword_research", "router"),
    ("routes.research", "router"),
]

for module_path, router_name in optional_routers:
    try:
        # Test import first
        module = __import__(module_path, fromlist=[router_name])
        if hasattr(module, "router"):
            router = getattr(module, "router")
            app.include_router(router)
            loaded_routers.append(module_path)
            logger.info(f"✅ Loaded optional router: {module_path}")
        else:
            logger.warning(f"⚠️ Router {module_path} exists but has no 'router' attribute")
    except ImportError as e:
        logger.warning(f"⚠️ Could not import router {module_path} (missing dependency): {str(e)}")
    except AttributeError as e:
        logger.warning(f"⚠️ Router {module_path} missing expected attributes: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Failed to load optional router {module_path}: {str(e)}")

logger.info(f"📋 Loaded {len(loaded_routers)} out of {len(essential_routers) + len(optional_routers)} routers")

# ───────────────────────────── TASK SCHEDULER ───────────────────────── #

task_scheduler = None

@app.on_event("startup")
async def startup_event():
    """Initialize services on application startup"""
    global task_scheduler
    try:
        from database import get_supabase
        from config import agent_manager
        from services.task_scheduler import initialize_task_scheduler

        # Initialize task scheduler with agents
        task_scheduler = initialize_task_scheduler(
            supabase_client=get_supabase(),
            email_agent=getattr(agent_manager, 'email_agent', None) if hasattr(agent_manager, 'agents_available') and agent_manager.agents_available else None,
            social_agent=getattr(agent_manager, 'social_agent', None) if hasattr(agent_manager, 'agents_available') and agent_manager.agents_available else None,
            content_agent=getattr(agent_manager, 'content_agent', None) if hasattr(agent_manager, 'agents_available') and agent_manager.agents_available else None
        )
        logger.info("✅ Task scheduler initialized successfully")
    except Exception as e:
        logger.error(f"❌ Failed to initialize task scheduler: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup services on application shutdown"""
    try:
        from services.task_scheduler import shutdown_task_scheduler
        shutdown_task_scheduler()
        logger.info("✅ Task scheduler shut down successfully")
    except Exception as e:
        logger.error(f"❌ Failed to shutdown task scheduler: {e}")

# ───────────────────────────── ROOT ENDPOINTS ───────────────────────── #

@app.get("/")
async def root():
    return {"message": "Marketing Automation Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "version": "1.0.1", 
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production"),
        "agents_status": "operational"
    }
