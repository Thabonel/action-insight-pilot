from fastapi import APIRouter, UploadFile, File, HTTPException
import openai
import os

router = APIRouter(prefix="/api/brand", tags=["brand"])

openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/documents")
async def upload_document(file: UploadFile = File(...)):
   return {"message": "Brand Ambassador endpoint working", "filename": file.filename}

@router.get("/documents")
async def get_documents():
   return []

@router.post("/chat")
async def chat_with_brand(message: dict):
   return {"response": "Brand Ambassador is working! Your message: " + message.get("message", "")}
