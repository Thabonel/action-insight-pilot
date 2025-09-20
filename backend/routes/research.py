from fastapi import APIRouter, Depends, HTTPException
from typing import Optional, Dict, Any

from auth import verify_token
from database import get_supabase
from models import APIResponse

router = APIRouter(prefix="/api/research", tags=["research"])

@router.get("/")
async def list_notes(conversation_id: Optional[str] = None, token: Dict[str, Any] = Depends(verify_token)):
    """List research notes for the authenticated user"""
    supabase = get_supabase()
    query = supabase.table('research_notes').select('*')
    if conversation_id:
        query = query.eq('conversation_id', conversation_id)
    result = query.order('created_at', desc=True).execute()
    return APIResponse(success=True, data=result.data)

@router.post("/")
async def create_note(note: Dict[str, Any], token: Dict[str, Any] = Depends(verify_token)):
    """Create a research note from a chat message"""
    conversation_id = note.get('conversation_id')
    content = note.get('content')
    if not conversation_id or not content:
        raise HTTPException(status_code=400, detail="conversation_id and content required")
    source_refs = note.get('source_refs')
    supabase = get_supabase()
    result = supabase.table('research_notes').insert({
        'conversation_id': conversation_id,
        'content': content,
        'source_refs': source_refs
    }).select('*').single().execute()
    return APIResponse(success=True, data=result.data)
