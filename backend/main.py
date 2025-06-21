
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
    os.getenv("FRONTEND_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://aiboostcampaign.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://wheels-wins-orchestrator.onrender.com",
        "https://lovable.dev",
        "https://app.lovable.dev"
    ],
    allow_headers=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"],
)

from routes.user_aware_agents import router as user_aware_router
from routes.system_health import router as system_health_router
from routes.email import router as email_router
from routes.workflows import router as workflows_router
from routes.ai_agents import router as ai_agents_router

# Add all routers
app.include_router(user_aware_router)
app.include_router(system_health_router)
app.include_router(email_router)
app.include_router(workflows_router)
app.include_router(ai_agents_router)

@app.get("/")
async def root():
    return {"message": "Marketing Automation Backend API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2024-01-01T00:00:00Z"}
