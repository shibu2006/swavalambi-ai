from fastapi import APIRouter, UploadFile, File, HTTPException
from services.s3_service import S3Service
from services import dynamodb_service
from schemas.models import ProfilePictureUploadResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

s3_service = S3Service()

ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

@router.post("/users/{user_id}/profile-picture", response_model=ProfilePictureUploadResponse)
async def upload_profile_picture(
    user_id: str,
    file: UploadFile = File(...)
):
    """
    Upload profile picture to S3 and update user profile.
    """
    try:
        # Validate file type
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_TYPES)}"
            )
        
        # Read file content
        file_content = await file.read()
        
        # Validate file size
        if len(file_content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="File size exceeds 5MB limit"
            )
        
        # Get existing profile to delete old picture
        existing_user = dynamodb_service.get_user(user_id)
        old_picture_url = existing_user.get('profile_picture') if existing_user else None
        
        # Upload to S3
        s3_url = s3_service.upload_profile_picture(
            user_id=user_id,
            file_content=file_content,
            content_type=file.content_type
        )
        
        # Update DynamoDB using update_item directly
        from datetime import datetime, timezone
        table = dynamodb_service._get_table()
        now = datetime.now(timezone.utc).isoformat()
        
        table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="SET profile_picture = :pic, updated_at = :now",
            ExpressionAttributeValues={
                ":pic": s3_url,
                ":now": now
            }
        )
        
        # Delete old picture from S3 if exists and is an S3 URL
        if old_picture_url and old_picture_url.startswith('https://') and 's3.amazonaws.com' in old_picture_url:
            s3_service.delete_profile_picture(old_picture_url)
        
        return ProfilePictureUploadResponse(
            profile_picture_url=s3_url,
            message="Profile picture uploaded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading profile picture: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload profile picture")

@router.delete("/users/{user_id}/profile-picture")
async def delete_profile_picture(user_id: str):
    """
    Delete profile picture from S3 and user profile.
    """
    try:
        # Get user profile
        user = dynamodb_service.get_user(user_id)
        if not user or not user.get('profile_picture'):
            raise HTTPException(status_code=404, detail="Profile picture not found")
        
        # Delete from S3
        s3_service.delete_profile_picture(user['profile_picture'])
        
        # Update DynamoDB
        from datetime import datetime, timezone
        table = dynamodb_service._get_table()
        now = datetime.now(timezone.utc).isoformat()
        
        table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="REMOVE profile_picture SET updated_at = :now",
            ExpressionAttributeValues={":now": now}
        )
        
        return {"message": "Profile picture deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting profile picture: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete profile picture")
