from fastapi import APIRouter, UploadFile, File, HTTPException
import openai
import os

DOCUMENTS_DIR = "brand_documents"
os.makedirs(DOCUMENTS_DIR, exist_ok=True)

router = APIRouter(prefix="/api/brand", tags=["brand"])

openai.api_key = os.getenv("OPENAI_API_KEY")

@router.post("/documents")
async def upload_document(file: UploadFile = File(...)):
    """Save uploaded brand document to disk."""
    try:
        contents = await file.read()
        dest = os.path.join(DOCUMENTS_DIR, file.filename)
        with open(dest, "wb") as f:
            f.write(contents)
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/documents")
async def get_documents():
    """List uploaded brand documents."""
    try:
        return {"files": os.listdir(DOCUMENTS_DIR)}
    except Exception:
        return {"files": []}

@router.post("/chat")
async def chat_with_brand(message: dict):
    """Interact with the brand ambassador powered by OpenAI."""
    prompt = message.get("message")
    if not prompt:
        raise HTTPException(status_code=400, detail="Message is required")
    if not openai.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured")
    try:
        chat = await openai.ChatCompletion.acreate(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are a helpful brand ambassador assistant."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
        )
        return {"response": chat.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
