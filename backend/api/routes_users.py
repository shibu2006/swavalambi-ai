"""
routes_users.py — User registration and profile retrieval.

POST /api/users/register  → upsert user in DynamoDB, return user_id
GET  /api/users/{user_id} → fetch full profile from DynamoDB
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional
from schemas.models import UserRegisterRequest, UserRegisterResponse
from services.dynamodb_service import create_or_update_user, get_user, clear_chat_history, delete_user, reset_assessment
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
    Automatically regenerates fresh presigned S3 URLs for any work sample photos.
    """
    import boto3, os
    try:
        user = get_user(user_id)
        if not user:
            return {"chat_history": []}
        
        chat_history = user.get("chat_history", [])
        
        # Regenerate fresh presigned URLs for any messages with S3 keys
        has_s3_images = any(msg.get("s3Key") for msg in chat_history)
        if has_s3_images:
            try:
                session = boto3.Session(
                    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
                    region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
                )
                s3_client = session.client("s3")
                
                for msg in chat_history:
                    if msg.get("s3Key") and msg.get("s3Bucket"):
                        # Regenerate a fresh 7-day presigned URL
                        msg["imagePreviewUrl"] = s3_client.generate_presigned_url(
                            "get_object",
                            Params={"Bucket": msg["s3Bucket"], "Key": msg["s3Key"]},
                            ExpiresIn=604800
                        )
            except Exception as e:
                print(f"[WARN] Failed to regenerate presigned URLs: {e}")
        
        return {"chat_history": chat_history}
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


@router.post("/{user_id}/reset-assessment", summary="Reset user's assessment data")
async def reset_user_assessment(user_id: str):
    """
    Completely resets a user's assessment data for retaking the assessment.
    Clears: skill, skill_rating, theory_score, intent, chat_history, session_id
    Keeps: name, created_at, profile_picture, vision_upload_history
    """
    try:
        reset_assessment(user_id)
        return {
            "message": "Assessment data reset successfully",
            "reset_fields": [
                "skill",
                "skill_rating",
                "theory_score",
                "intent",
                "chat_history",
                "session_id"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to reset assessment: {e}")
