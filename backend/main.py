import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI()

# CORS settings
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:5173",
    "https://wheels-wins.vercel.app",
    "https://wheels-wins-git-staging-wheels-wins.vercel.app",
    "https://wheels-wins-git-dev-wheels-wins.vercel.app",
    os.getenv("FRONTEND_URL"),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aiboostcampaign.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wheels-wins-orchestrator.onrender.com",
        "https://lovable.dev",
        "https://app.lovable.dev",
    ],
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
)

# ─────────────────────────── ROUTER IMPORTS ─────────────────────────── #
# Fixed import paths for deployment - absolute imports required for Render

from routes.unified_agents import router as unified_agents_router
from routes.system_health import router as system_health_router
from routes.email import router as email_router
from routes.workflows import router as workflows_router
from routes.brand import router as brand_router
from routes.keyword_research import router as keyword_research_router
from routes.research import router as research_router
from workflows.ai_video_creator_workflow import (
    router as ai_video_creator_router,
    WORKFLOW_ENABLED as AI_VIDEO_WORKFLOW_ENABLED,
)

# ─────────────────────────── ROUTER REGISTRY ────────────────────────── #

app.include_router(unified_agents_router)
app.include_router(system_health_router)
app.include_router(email_router)
app.include_router(workflows_router)
app.include_router(brand_router)
app.include_router(keyword_research_router)
app.include_router(research_router)
if AI_VIDEO_WORKFLOW_ENABLED:
    app.include_router(ai_video_creator_router)

# ───────────────────────────── ROOT ENDPOINTS ───────────────────────── #

@app.get("/")
async def root():
    return {"message": "Marketing Automation Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
