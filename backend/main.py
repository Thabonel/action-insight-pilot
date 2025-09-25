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
app = FastAPI(title="Marketing Automation API", version="1.0.1")

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

# ─────────────────────────── ROUTER IMPORTS ─────────────────────────── #
# Import routers with graceful error handling

routers_to_load = [
    ("routes.unified_agents", "router"),
    ("routes.system_health", "router"),
    ("routes.email", "router"),
    ("routes.workflows", "router"),
    ("routes.brand", "router"),
    ("routes.keyword_research", "router"),
    ("routes.research", "router"),
]

loaded_routers = []

for module_path, router_name in routers_to_load:
    try:
        module = __import__(module_path, fromlist=[router_name])
        if hasattr(module, "router"):
            router = getattr(module, "router")
            app.include_router(router)
            loaded_routers.append(module_path)
            logger.info(f"✅ Loaded router: {module_path}")
        else:
            logger.warning(f"⚠️ Router {module_path} exists but has no 'router' attribute")
    except ImportError as e:
        logger.warning(f"⚠️ Could not import router {module_path}: {str(e)}")
    except Exception as e:
        logger.error(f"❌ Failed to load router {module_path}: {str(e)}")

# Try to load AI video creator workflow
try:
    from workflows.ai_video_creator_workflow import (
        router as ai_video_creator_router,
        WORKFLOW_ENABLED as AI_VIDEO_WORKFLOW_ENABLED,
    )
    if AI_VIDEO_WORKFLOW_ENABLED:
        app.include_router(ai_video_creator_router)
        logger.info("✅ Loaded AI video creator workflow")
except Exception as e:
    logger.warning(f"⚠️ AI video creator workflow not available: {str(e)}")

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
