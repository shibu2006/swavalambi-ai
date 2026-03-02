from pydantic import BaseModel, Field
from typing import Optional

class UserProfile(BaseModel):
    phone_number: str
    name: Optional[str] = None
    profession_skill: Optional[str] = None
    intent: Optional[str] = Field(None, description="job | upskill | loan")
    theory_score: Optional[int] = Field(0, ge=0, le=5)
    vision_score: Optional[int] = Field(0, ge=0, le=5)
    skill_rating: Optional[int] = Field(0, ge=0, le=5, description="Final combined score")
    
class OTPSendRequest(BaseModel):
    phone_number: str
    email: Optional[str] = None
    name: Optional[str] = None

class OTPVerifyRequest(BaseModel):
    phone_number: str
    email: Optional[str] = None
    name: Optional[str] = None
    otp: str

class LoginRequest(BaseModel):
    identifier: str # Email or phone number
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    phone_number: Optional[str] = None
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: Optional[str] = None
    name: Optional[str] = None

class UserRegisterRequest(BaseModel):
    phone: str
    name: str

class UserRegisterResponse(BaseModel):
    user_id: str
    name: str


class ChatRequest(BaseModel):
    session_id: str
    message: str
    user_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    is_ready_for_photo: bool = False
    is_complete: bool = False
    intent_extracted: Optional[str] = None
    profession_skill_extracted: Optional[str] = None
    theory_score_extracted: Optional[int] = None

class VisionScoreResponse(BaseModel):
    vision_score: int
    skill_rating: int
    feedback: str
