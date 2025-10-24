from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
import logging
import uuid
from pydantic import BaseModel, EmailStr
from database import get_supabase_client

router = APIRouter(prefix="/api/support", tags=["support"])
logger = logging.getLogger(__name__)

class SupportTicketCreate(BaseModel):
    email: EmailStr
    name: str
    subject: str
    message: str
    user_id: Optional[str] = None

class SupportTicketUpdate(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    admin_notes: Optional[str] = None

@router.post("/ticket")
async def create_support_ticket(ticket: SupportTicketCreate):
    """
    Create a new support ticket.
    Can be called by authenticated users or anonymous visitors.
    """
    try:
        supabase = get_supabase_client()

        ticket_data = {
            "email": ticket.email,
            "name": ticket.name,
            "subject": ticket.subject,
            "message": ticket.message,
            "status": "open",
            "priority": "normal"
        }

        if ticket.user_id:
            ticket_data["user_id"] = ticket.user_id

        result = supabase.table("support_tickets").insert(ticket_data).execute()

        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create support ticket")

        logger.info(f"Support ticket created: {result.data[0]['id']} from {ticket.email}")

        return {
            "status": "success",
            "message": "Support ticket created successfully",
            "ticket_id": result.data[0]["id"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating support ticket: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to create support ticket. Please try again."
        )

@router.get("/tickets")
async def get_all_tickets():
    """
    Get all support tickets (admin only).
    Returns tickets ordered by creation date (newest first).
    """
    try:
        supabase = get_supabase_client()

        result = supabase.table("support_tickets")\
            .select("*")\
            .order("created_at", desc=True)\
            .execute()

        return {
            "status": "success",
            "tickets": result.data
        }

    except Exception as e:
        logger.error(f"Error fetching support tickets: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch support tickets"
        )

@router.patch("/ticket/{ticket_id}")
async def update_support_ticket(ticket_id: str, update: SupportTicketUpdate):
    """
    Update a support ticket (admin only).
    Can update status, priority, and admin notes.
    """
    try:
        supabase = get_supabase_client()

        update_data = {}
        if update.status:
            update_data["status"] = update.status
            if update.status in ["resolved", "closed"]:
                update_data["resolved_at"] = "NOW()"
        if update.priority:
            update_data["priority"] = update.priority
        if update.admin_notes is not None:
            update_data["admin_notes"] = update.admin_notes

        if not update_data:
            raise HTTPException(status_code=400, detail="No update data provided")

        result = supabase.table("support_tickets")\
            .update(update_data)\
            .eq("id", ticket_id)\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")

        logger.info(f"Support ticket updated: {ticket_id}")

        return {
            "status": "success",
            "message": "Support ticket updated successfully",
            "ticket": result.data[0]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating support ticket: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to update support ticket"
        )

@router.get("/ticket/{ticket_id}")
async def get_ticket(ticket_id: str):
    """
    Get a specific support ticket by ID.
    """
    try:
        supabase = get_supabase_client()

        result = supabase.table("support_tickets")\
            .select("*")\
            .eq("id", ticket_id)\
            .single()\
            .execute()

        if not result.data:
            raise HTTPException(status_code=404, detail="Ticket not found")

        return {
            "status": "success",
            "ticket": result.data
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching support ticket: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch support ticket"
        )
