"""
routes_users.py — User registration and profile retrieval.

POST /api/users/register  → upsert user in DynamoDB, return user_id
GET  /api/users/{user_id} → fetch full profile from DynamoDB
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.models import UserRegisterRequest, UserRegisterResponse
from services.dynamodb_service import create_or_update_user, get_user, clear_chat_history, delete_user
from services.cognito_service import admin_delete_user, COGNITO_ENABLED

router = APIRouter()


@router.post("/register", response_model=UserRegisterResponse, summary="Register or update a user")
async def register_user(req: UserRegisterRequest):
    """
    Creates a new user or updates the name of an existing one.
    Called when the user verifies their OTP on the Login page.
    """
    try:
        result = create_or_update_user(user_id=req.phone, name=req.name)
        return UserRegisterResponse(user_id=result["user_id"], name=result["name"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to register user: {e}")


@router.get("/{user_id}", summary="Get user profile from DynamoDB")
async def get_user_profile(user_id: str):
    """
    Returns the full user profile (name, skill, rating, intent) for the given user_id.
    Frontend uses this to populate the Profile page.
    """
    try:
        user = get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {e}")


@router.delete("/{user_id}", summary="Delete a user from DynamoDB (and optionally Cognito)")
async def delete_user_endpoint(
    user_id: str,
    email: Optional[str] = Query(None, description="User's email to also delete from Cognito")
):
    """
    Deletes a user from DynamoDB. If an email is provided, also removes them from Cognito.
    Use this when a user registered via email/password (Cognito) and you want to fully reset them.
    """
    try:
        # Delete from DynamoDB (warn if not found but don't block)
        user = get_user(user_id)
        if user:
            delete_user(user_id)

        # Optionally delete from Cognito
        cognito_result = None
        if email and COGNITO_ENABLED:
            try:
                admin_delete_user(email)
                cognito_result = f"Also deleted '{email}' from Cognito"
            except Exception as e:
                cognito_result = f"DynamoDB deleted, but Cognito delete failed: {e}"

        return {
            "message": f"User '{user_id}' deleted from DynamoDB",
            "cognito": cognito_result or "Cognito not touched (no email provided)",
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {e}")


@router.get("/{user_id}/chat-history", summary="Get user's chat history")
async def get_user_chat_history(user_id: str):
    """
    Returns just the chat_history field for the given user_id.
    Used by the Assistant page to restore previous conversations.
    """
    try:
        user = get_user(user_id)
        if not user:
            return {"chat_history": []}
        return {"chat_history": user.get("chat_history", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chat history: {e}")


@router.delete("/{user_id}/chat-history", summary="Clear user's chat history")
async def clear_user_chat_history(user_id: str):
    """
    Clears the chat history for the given user_id.
    Used when user clicks "Retake Assessment" to start fresh.
    """
    try:
        clear_chat_history(user_id)
        return {"message": "Chat history cleared successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to clear chat history: {e}")
