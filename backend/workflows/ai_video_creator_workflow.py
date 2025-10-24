"""
AI Video Creator workflow — FastAPI + MCP edition
Runs every 24 h (startup-scheduled) or via POST /workflows/ai-video-creator/run.
Reads ideas & assets from Google Sheets, generates a script with OpenAI,
renders a video with json2video, then returns the finished URL.
External publishing (Blotato/YouTube/etc.) will be added in later steps.
"""

import os, json, asyncio, logging
from datetime import datetime

import httpx
import openai
from fastapi import APIRouter, BackgroundTasks, HTTPException
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from google.oauth2.service_account import Credentials
from googleapiclient.discovery import build
from pydantic import BaseModel

# ───────────────────────────── CONFIG ───────────────────────────── #

SHEET_ID_IDEAS  = "1l_bEb3UfoM7Ko_zd6PScA9H-Mk9Dq6_EpzQyZQsfoAU"
SHEET_ID_MEDIA  = "1M2RZEIxkm7_UHrl3tgjhgnOePkcmjTNFz1hz_bH4-_E"
IDEAS_RANGE     = "Sheet1!A2:E"   # id | idea | caption | production | …
MEDIA_RANGE     = "Sheet1!A2:B"   # Music URL | Intro Video URL

GOOGLE_SA_JSON          = os.getenv("GOOGLE_SA_JSON")          # service-account creds (JSON string)
OPENAI_API_KEY          = os.getenv("OPENAI_API_KEY")          # OpenAI key
JSON2VIDEO_API_KEY      = os.getenv("JSON2VIDEO_API_KEY")      # json2video key
JSON2VIDEO_TEMPLATE_ID  = os.getenv("JSON2VIDEO_TEMPLATE_ID")  # json2video template

if not all([GOOGLE_SA_JSON, OPENAI_API_KEY, JSON2VIDEO_API_KEY, JSON2VIDEO_TEMPLATE_ID]):
    # When environment variables are missing (e.g., during testing), skip workflow setup
    WORKFLOW_ENABLED = False
else:
    WORKFLOW_ENABLED = True

# ───────────────────────────── FASTAPI SETUP ────────────────────── #

router    = APIRouter(prefix="/workflows/ai-video-creator", tags=["workflows"])
scheduler = AsyncIOScheduler()
logger    = logging.getLogger(__name__)

# ───────────────────────────── HELPERS ──────────────────────────── #

def sheets_service():
    creds = Credentials.from_service_account_info(
        json.loads(GOOGLE_SA_JSON),
        scopes=["https://www.googleapis.com/auth/spreadsheets.readonly"],
    )
    return build("sheets", "v4", credentials=creds, cache_discovery=False)

async def read_ideas():
    svc  = sheets_service()
    rows = (
        svc.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID_IDEAS, range=IDEAS_RANGE)
        .execute()
        .get("values", [])
    )
    return [
        {"id": r[0], "idea": r[1], "caption": r[2]}
        for r in rows
        if r and (len(r) < 4 or r[3] != "done")
    ]

async def read_media():
    svc  = sheets_service()
    rows = (
        svc.spreadsheets()
        .values()
        .get(spreadsheetId=SHEET_ID_MEDIA, range=MEDIA_RANGE)
        .execute()
        .get("values", [])
    )
    if not rows:
        raise RuntimeError("No media assets found.")
    return {"Music URL": rows[0][0], "Intro Video URL": rows[0][1]}

async def generate_script(idea: str) -> dict:
    openai.api_key = OPENAI_API_KEY
    chat = await openai.ChatCompletion.acreate(
        model="gpt-5",
        temperature=0.7,
        response_format={"type": "json_object"},
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a professional video scriptwriter. "
                    "Return JSON with keys: title (string) and scenes (array of strings)."
                ),
            },
            {"role": "user", "content": f"Write a short faceless POV video script about: {idea}"},
        ],
    )
    return json.loads(chat.choices[0].message.content)

async def create_video(script: dict, media: dict) -> str:
    payload = {
        "template": JSON2VIDEO_TEMPLATE_ID,
        "data": {
            "background_music": media["Music URL"],
            "intro_video":     media["Intro Video URL"],
            **script,
            "resolution": "full-hd",
            "quality":    "high",
        },
    }
    async with httpx.AsyncClient(timeout=60) as client:
        resp = await client.post(
            "https://api.json2video.com/v2/movies",
            headers={"x-api-key": JSON2VIDEO_API_KEY},
            json=payload,
        )
        resp.raise_for_status()
        return resp.json()["project"]

async def wait_for_video(project_id: str, retries: int = 15, delay: int = 20) -> str:
    url = f"https://api.json2video.com/v2/movies/{project_id}"
    async with httpx.AsyncClient(timeout=30) as client:
        for _ in range(retries):
            r = await client.get(url, headers={"x-api-key": JSON2VIDEO_API_KEY})
            r.raise_for_status()
            data = r.json()
            if data.get("status") == "done":
                return data["url"]
            await asyncio.sleep(delay)
    raise RuntimeError("Video rendering timed out.")

# ───────────────────────────── MAIN WORKFLOW ────────────────────── #

async def run_workflow():
    ideas  = await read_ideas()
    if not ideas:
        logger.info("No new ideas found")
        return
    media  = await read_media()
    for idea in ideas:
        try:
            script      = await generate_script(idea["idea"])
            project_id  = await create_video(script, media)
            video_url   = await wait_for_video(project_id)
            # TODO: publishing & sheet updates (next step)
            logger.info(f"Video created for idea '{idea['idea']}': {video_url}")
        except Exception as e:
            logger.error(f"Error creating video for idea '{idea['idea']}': {e}")

# ───────────────────────────── SCHEDULER & ENDPOINTS ────────────── #

@router.on_event("startup")
async def _schedule_job():
    scheduler.add_job(run_workflow, "interval", hours=24, next_run_time=datetime.utcnow())
    scheduler.start()

@router.post("/run")
async def trigger_now(bg: BackgroundTasks):
    bg.add_task(run_workflow)
    return {"detail": "AI Video Creator workflow queued."}
