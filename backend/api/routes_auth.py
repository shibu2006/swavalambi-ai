from fastapi import APIRouter, HTTPException
from schemas.models import OTPSendRequest, OTPVerifyRequest, TokenResponse, LoginRequest, RegisterRequest
from services.dynamodb_service import create_or_update_user
from services.cognito_service import (
    register_user as cognito_register,
    verify_email as cognito_verify,
    login_user as cognito_login,
    get_user_info,
    resend_verification_code,
    forgot_password,
    confirm_forgot_password
)

router = APIRouter()

# Keep OTP endpoints for backward compatibility (can be removed later)
_otp_store: dict = {}
_name_store: dict = {}

@router.post("/send-otp", summary="Send an OTP to the user's phone (DEPRECATED - use email registration)")
async def send_otp(request: OTPSendRequest):
    """Legacy OTP endpoint - use /register instead"""
    mock_otp = "123456"
    _otp_store[request.phone_number] = mock_otp
    if request.name:
        _name_store[request.phone_number] = request.name
    if request.email:
        _name_store[f"{request.phone_number}_email"] = request.email
    print(f"[MOCK] Sending OTP {mock_otp} to {request.phone_number}")
    return {"message": "OTP sent successfully."}

@router.post("/verify-otp", response_model=TokenResponse, summary="Verify OTP (DEPRECATED - use email verification)")
async def verify_otp(request: OTPVerifyRequest):
    """Legacy OTP endpoint - use /verify-email instead"""
    stored_otp = _otp_store.get(request.phone_number)

    if not stored_otp or stored_otp != request.otp:
        raise HTTPException(status_code=401, detail="Invalid or expired OTP.")

    del _otp_store[request.phone_number]
    name = request.name or _name_store.pop(request.phone_number, request.phone_number)

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


# --- Real Cognito-Based Authentication ---

@router.post("/register", summary="Register a new user with email and password")
async def register_user_endpoint(request: RegisterRequest):
    """
    Register a new user using AWS Cognito.
    User will receive a verification code via email.
    """
    try:
        # Register in Cognito
        result = cognito_register(
            email=request.email,
            password=request.password,
            name=request.name,
            phone_number=request.phone_number if request.phone_number else None
        )
        
        # Also create user record in DynamoDB
        try:
            create_or_update_user(user_id=request.email, name=request.name)
        except Exception as e:
            print(f"[WARN] DynamoDB upsert failed (non-fatal): {e}")
        
        return {
            "message": "User registered successfully. Please check your email for verification code.",
            "user_id": request.email,
            "email": request.email,
            "code_delivery": result.get('code_delivery_details', {})
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[ERROR] Registration failed: {e}")
        raise HTTPException(status_code=500, detail="Registration failed. Please try again.")


@router.post("/verify-email", summary="Verify email with confirmation code")
async def verify_email_endpoint(email: str, code: str):
    """
    Verify user's email address with the 6-digit code sent during registration.
    """
    try:
        cognito_verify(email=email, code=code)
        return {
            "message": "Email verified successfully. You can now login.",
            "email": email
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[ERROR] Email verification failed: {e}")
        raise HTTPException(status_code=500, detail="Verification failed. Please try again.")


@router.post("/resend-code", summary="Resend verification code")
async def resend_code_endpoint(email: str):
    """
    Resend verification code to user's email.
    """
    try:
        result = resend_verification_code(email=email)
        return {
            "message": "Verification code sent successfully.",
            "code_delivery": result
        }
    except Exception as e:
        print(f"[ERROR] Resend code failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend code. Please try again.")


@router.post("/login", response_model=TokenResponse, summary="Login with email and password")
async def login_user_endpoint(request: LoginRequest):
    """
    Authenticate user with email and password using AWS Cognito.
    Returns JWT tokens for authenticated requests.
    """
    try:
        # Login via Cognito
        tokens = cognito_login(email=request.identifier, password=request.password)
        
        # Get user info from access token
        user_info = get_user_info(access_token=tokens['access_token'])
        
        # Update DynamoDB with latest info
        try:
            create_or_update_user(
                user_id=user_info['email'],
                name=user_info.get('name', 'User')
            )
        except Exception as e:
            print(f"[WARN] DynamoDB update failed (non-fatal): {e}")
        
        return TokenResponse(
            access_token=tokens['id_token'],  # Use ID token for frontend
            token_type="bearer",
            user_id=user_info['email'],
            name=user_info.get('name', 'User')
        )
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        print(f"[ERROR] Login failed: {e}")
        raise HTTPException(status_code=500, detail="Login failed. Please try again.")


@router.post("/forgot-password", summary="Initiate forgot password flow")
async def forgot_password_endpoint(email: str):
    """
    Send password reset code to user's email.
    """
    try:
        result = forgot_password(email=email)
        return {
            "message": "Password reset code sent to your email.",
            "code_delivery": result
        }
    except Exception as e:
        print(f"[ERROR] Forgot password failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to send reset code. Please try again.")


@router.post("/reset-password", summary="Reset password with code")
async def reset_password_endpoint(email: str, code: str, new_password: str):
    """
    Reset password using verification code from email.
    """
    try:
        confirm_forgot_password(email=email, code=code, new_password=new_password)
        return {
            "message": "Password reset successfully. You can now login with your new password."
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"[ERROR] Password reset failed: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed. Please try again.")


@router.get("/me", summary="Get current user info")
async def get_current_user(access_token: str):
    """
    Get current user information from access token.
    """
    try:
        user_info = get_user_info(access_token=access_token)
        return user_info
    except Exception as e:
        print(f"[ERROR] Get user info failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid or expired token")

