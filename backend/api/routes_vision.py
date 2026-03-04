import os
import boto3
import uuid
import time
from PIL import Image
from io import BytesIO

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from schemas.models import VisionScoreResponse
from agents.vision_agent import VisionAgent
from services.dynamodb_service import save_assessment, get_user, update_chat_history
import logging

logger = logging.getLogger(__name__)

router = APIRouter()
_vision_agent = None

# Configuration
MAX_FILE_SIZE_MB = int(os.getenv("VISION_MAX_FILE_SIZE_MB", "10"))
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
MAX_UPLOADS_PER_HOUR = int(os.getenv("VISION_MAX_UPLOADS_PER_HOUR", "5"))
MAX_UPLOADS_PER_10MIN = int(os.getenv("VISION_MAX_UPLOADS_PER_10MIN", "3"))
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"]
MAX_IMAGE_DIMENSION = 4096

def get_vision_agent():
    global _vision_agent
    if _vision_agent is None:
        _vision_agent = VisionAgent()
    return _vision_agent

def validate_image_file(content: bytes, content_type: str) -> tuple[bool, str]:
    """
    Validate uploaded image file.
    Returns (is_valid, error_message)
    """
    # Check file size
    if len(content) > MAX_FILE_SIZE_BYTES:
        return False, f"File size exceeds {MAX_FILE_SIZE_MB}MB limit"
    
    # Check content type
    if content_type not in ALLOWED_TYPES:
        return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_TYPES)}"
    
    # Verify it's actually an image by trying to open it
    try:
        image = Image.open(BytesIO(content))
        
        # Check dimensions
        width, height = image.size
        if width > MAX_IMAGE_DIMENSION or height > MAX_IMAGE_DIMENSION:
            return False, f"Image dimensions exceed {MAX_IMAGE_DIMENSION}x{MAX_IMAGE_DIMENSION} limit"
        
        # Verify format matches content type
        image_format = image.format.lower() if image.format else ""
        if content_type == "image/jpeg" and image_format not in ["jpeg", "jpg"]:
            return False, "File content doesn't match JPEG type"
        elif content_type == "image/png" and image_format != "png":
            return False, "File content doesn't match PNG type"
        elif content_type == "image/webp" and image_format != "webp":
            return False, "File content doesn't match WebP type"
        
        return True, ""
    except Exception as e:
        logger.error(f"Image validation error: {e}")
        return False, "Invalid image file or corrupted data"

def check_rate_limit(user_id: str) -> tuple[bool, str]:
    """
    Check if user has exceeded upload rate limits.
    Returns (is_allowed, error_message)
    """
    try:
        user_record = get_user(user_id)
        if not user_record:
            return True, ""  # New user, allow upload
        
        upload_history = user_record.get("vision_upload_history", [])
        current_time = int(time.time())
        
        # Filter uploads from last hour
        uploads_last_hour = [ts for ts in upload_history if current_time - ts < 3600]
        
        # Filter uploads from last 10 minutes
        uploads_last_10min = [ts for ts in upload_history if current_time - ts < 600]
        
        # Check limits
        if len(uploads_last_hour) >= MAX_UPLOADS_PER_HOUR:
            return False, f"Upload limit exceeded. Maximum {MAX_UPLOADS_PER_HOUR} uploads per hour"
        
        if len(uploads_last_10min) >= MAX_UPLOADS_PER_10MIN:
            return False, f"Upload limit exceeded. Maximum {MAX_UPLOADS_PER_10MIN} uploads per 10 minutes"
        
        return True, ""
    except Exception as e:
        logger.error(f"Rate limit check error: {e}")
        return True, ""  # Allow upload if rate limit check fails

def update_upload_history(user_id: str):
    """
    Update user's upload history with current timestamp.
    """
    try:
        from datetime import datetime, timezone
        
        session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        )
        dynamodb = session.resource("dynamodb")
        table = dynamodb.Table(os.getenv("DYNAMODB_TABLE", "swavalambi_users"))
        
        current_time = int(time.time())
        now = datetime.now(timezone.utc).isoformat()
        
        # Get existing history
        user_record = get_user(user_id)
        upload_history = user_record.get("vision_upload_history", []) if user_record else []
        
        # Keep only last 24 hours of history
        upload_history = [ts for ts in upload_history if current_time - ts < 86400]
        upload_history.append(current_time)
        
        # Update DynamoDB
        table.update_item(
            Key={"user_id": user_id},
            UpdateExpression="SET vision_upload_history = :history, updated_at = :now",
            ExpressionAttributeValues={
                ":history": upload_history,
                ":now": now
            }
        )
    except Exception as e:
        logger.error(f"Failed to update upload history: {e}")

@router.post("/analyze-vision", response_model=VisionScoreResponse, summary="Analyze uploaded work sample using Bedrock Vision")
async def analyze_vision(
    session_id: str = Form(...),
    photo: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    skill: Optional[str] = Form(None),
    intent: Optional[str] = Form(None),
    theory_score: Optional[int] = Form(None),
):
    # Read file content
    content = await photo.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")
    
    # Validate file
    mime_type = photo.content_type or "image/jpeg"
    is_valid, error_msg = validate_image_file(content, mime_type)
    if not is_valid:
        logger.warning(f"Invalid file upload attempt: {error_msg}")
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Check rate limit if user_id provided
    if user_id:
        is_allowed, rate_limit_msg = check_rate_limit(user_id)
        if not is_allowed:
            logger.warning(f"Rate limit exceeded for user {user_id}")
            raise HTTPException(status_code=429, detail=rate_limit_msg)
    
    # Analyze image
    result = get_vision_agent().analyze_image(content, mime_type)
    vision_score = result["vision_score"]
    
    if theory_score is not None and theory_score > 0:
        final_skill_rating = round((theory_score * 0.4) + (vision_score * 0.6))
        final_skill_rating = max(1, min(5, final_skill_rating))
    else:
        final_skill_rating = vision_score

    # Persist assessment to DynamoDB if we have a user_id
    if user_id:
        try:
            save_assessment(
                user_id=user_id,
                skill=skill or "",
                intent=intent or "job",
                skill_rating=final_skill_rating,
                theory_score=theory_score or 0,
                session_id=session_id,
            )
        except Exception as e:
            logger.warning(f"DynamoDB save_assessment failed (non-fatal): {e}")
        
        # Update upload history for rate limiting
        update_upload_history(user_id)
            
        try:
            # Upload photo to S3
            session = boto3.Session(
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
                region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            )
            s3_client = session.client("s3")
            bucket_name = os.getenv("AWS_S3_BUCKET", "swavalambi-voice")
            
            file_ext = photo.filename.split(".")[-1] if photo.filename else "jpg"
            file_key = f"work-samples/{user_id}/{uuid.uuid4().hex}.{file_ext}"
            
            s3_client.put_object(
                Bucket=bucket_name,
                Key=file_key,
                Body=content,
                ContentType=mime_type
            )
            
            # Generate a presigned URL valid for 7 days
            # The key is also stored in DynamoDB so it can be refreshed
            s3_url = s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": bucket_name, "Key": file_key},
                ExpiresIn=604800  # 7 days, regenerated each time from the stored key
            )
            
            # Update chat history with photo upload and AI response
            user_record = get_user(user_id)
            if user_record:
                chat_history = user_record.get("chat_history", [])
                
                chat_history.append({
                    "role": "user",
                    "content": "Uploaded work sample",
                    "imagePreviewUrl": s3_url,
                    "s3Key": file_key,        # stored to regenerate presigned URL after expiry
                    "s3Bucket": bucket_name
                })
                chat_history.append({
                    "role": "assistant",
                    "content": f"I've analyzed your work! {result['feedback']} You have been assigned **Level {final_skill_rating}**."
                })
                
                update_chat_history(user_id, chat_history)
        except Exception as e:
            logger.warning(f"Failed to upload photo or update chat history: {e}")

    return VisionScoreResponse(
        vision_score=vision_score,
        skill_rating=final_skill_rating,
        feedback=result["feedback"]
    )

