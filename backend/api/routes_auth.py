from fastapi import APIRouter, HTTPException
from schemas.models import OTPSendRequest, OTPVerifyRequest, TokenResponse
from services.dynamodb_service import create_or_update_user

router = APIRouter()

# In-memory OTP store + name cache for development.
_otp_store: dict = {}
_name_store: dict = {}  # phone -> name, so verify-otp can upsert with name

@router.post("/send-otp", summary="Send an OTP to the user's phone")
async def send_otp(request: OTPSendRequest):
    mock_otp = "123456"
    _otp_store[request.phone_number] = mock_otp
    if request.name:
        _name_store[request.phone_number] = request.name
    print(f"[MOCK] Sending OTP {mock_otp} to {request.phone_number}")
    return {"message": "OTP sent successfully."}

@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP and return auth token")
async def verify_otp(request: OTPVerifyRequest):
    stored_otp = _otp_store.get(request.phone_number)

    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")

    del _otp_store[request.phone_number]

    # Upsert user in DynamoDB with name captured from send-otp step
    name = _name_store.pop(request.phone_number, request.phone_number)
    try:
        create_or_update_user(user_id=request.phone_number, name=name)
    except Exception as e:
        print(f"[WARN] DynamoDB upsert failed (non-fatal): {e}")

    mock_token = f"mock_jwt_for_{request.phone_number}"
    return TokenResponse(
        access_token=mock_token,
        user_id=request.phone_number,
        name=name,
    )
