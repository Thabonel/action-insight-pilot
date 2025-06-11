
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import route modules
from routes import campaigns, leads, content, proposals, internal_publishing, email

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Agentic AI Marketing Platform API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://srv-d0sjalqli9vc73d20vqg.onrender.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "https://lovable.dev",
        "https://*.lovable.dev",
        "https://*.lovable.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(campaigns.router)
app.include_router(leads.router)
app.include_router(content.router)
app.include_router(proposals.router)
app.include_router(internal_publishing.router)
app.include_router(email.router)

@app.get("/")
async def root():
    return {"message": "Agentic AI Marketing Platform API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "marketing-platform-api"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
