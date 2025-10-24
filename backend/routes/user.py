from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
import logging
import uuid
from database import get_supabase_client
from auth import get_current_user

router = APIRouter(prefix="/api/user", tags=["user"])
logger = logging.getLogger(__name__)

@router.delete("/account")
async def delete_account(current_user: Dict = Depends(get_current_user)):
    """
    Delete user account and all associated data (GDPR compliance).
    This is a permanent operation and cannot be undone.
    """
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")

        supabase = get_supabase_client()

        # Delete user data from various tables
        tables_to_clean = [
            "user_preferences",
            "user_secrets",
            "marketing_autopilot_config",
            "autopilot_activity_log",
            "autopilot_weekly_reports",
            "campaigns",
            "leads",
            "content_library",
            "ai_video_projects",
            "brand_positioning_analyses",
            "funnel_designs",
            "competitive_gap_analyses",
            "performance_tracking_frameworks"
        ]

        # Delete from each table
        for table in tables_to_clean:
            try:
                supabase.table(table).delete().eq("user_id", user_id).execute()
                logger.info(f"Deleted user data from {table} for user {user_id}")
            except Exception as e:
                # Log error but continue - some tables might not exist or have no data
                logger.warning(f"Could not delete from {table}: {str(e)}")

        # Delete the user from auth.users (Supabase Auth)
        # Note: This requires service role key, which should be configured in database.py
        try:
            # Using admin API to delete user
            supabase.auth.admin.delete_user(user_id)
            logger.info(f"Successfully deleted user account: {user_id}")
        except Exception as e:
            logger.error(f"Error deleting user from auth: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to delete account. Please contact support."
            )

        return {
            "status": "success",
            "message": "Account deleted successfully",
            "user_id": user_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting account: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while deleting your account. Please contact support."
        )

@router.get("/data-export")
async def export_user_data(current_user: Dict = Depends(get_current_user)):
    """
    Export all user data (GDPR compliance).
    Returns all data associated with the user account.
    """
    try:
        user_id = current_user.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="User not authenticated")

        supabase = get_supabase_client()

        # Collect data from all tables
        user_data = {
            "user_id": user_id,
            "email": current_user.get("email"),
            "export_date": str(uuid.uuid4()),  # Placeholder for datetime
            "data": {}
        }

        # Tables to export
        tables_to_export = [
            "user_preferences",
            "marketing_autopilot_config",
            "campaigns",
            "leads",
            "content_library",
            "ai_video_projects"
        ]

        for table in tables_to_export:
            try:
                result = supabase.table(table).select("*").eq("user_id", user_id).execute()
                user_data["data"][table] = result.data
            except Exception as e:
                logger.warning(f"Could not export from {table}: {str(e)}")
                user_data["data"][table] = []

        return user_data

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error exporting user data: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while exporting your data"
        )
