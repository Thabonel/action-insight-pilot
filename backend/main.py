
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
    "https://wheels-wins.vercel.app",
    "https://wheels-wins-git-staging-wheels-wins.vercel.app",
    "https://wheels-wins-git-dev-wheels-wins.vercel.app",
    os.getenv("FRONTEND_URL")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in origins if origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from routes.user_aware_agents import router as user_aware_router
from routes.system_health import router as system_health_router
from routes.email import router as email_router

# Add all routers
app.include_router(user_aware_router)
app.include_router(system_health_router)
app.include_router(email_router)
