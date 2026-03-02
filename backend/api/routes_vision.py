from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from schemas.models import VisionScoreResponse
from agents.vision_agent import VisionAgent
from services.dynamodb_service import save_assessment

router = APIRouter()
_vision_agent = None

def get_vision_agent():
    global _vision_agent
    if _vision_agent is None:
        _vision_agent = VisionAgent()
    return _vision_agent

@router.post("/analyze-vision", response_model=VisionScoreResponse, summary="Analyze uploaded work sample using Bedrock Vision")
async def analyze_vision(
    session_id: str = Form(...),
    photo: UploadFile = File(...),
    user_id: Optional[str] = Form(None),
    skill: Optional[str] = Form(None),
    intent: Optional[str] = Form(None),
    theory_score: Optional[int] = Form(None),
):
    content = await photo.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file uploaded")

    mime_type = photo.content_type or "image/jpeg"
    result = get_vision_agent().analyze_image(content, mime_type)
    vision_score = result["vision_score"]
    
    # Combine theory_score (from chat) with vision_score (from image analysis)
    # If theory_score is provided, use weighted average: 40% theory + 60% vision
    # This ensures beginners don't get high scores just from a good photo
    if theory_score is not None and theory_score > 0:
        final_skill_rating = round((theory_score * 0.4) + (vision_score * 0.6))
        # Ensure it stays within 1-5 range
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
            print(f"[WARN] DynamoDB save_assessment failed (non-fatal): {e}")

    return VisionScoreResponse(
        vision_score=vision_score,
        skill_rating=final_skill_rating,
        feedback=result["feedback"]
    )

