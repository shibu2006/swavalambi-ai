"""
AWS Cognito integration service for user authentication.
"""
import os
import boto3
from botocore.exceptions import ClientError
from typing import Dict, Optional

# Cognito configuration from environment variables
USER_POOL_ID = os.getenv('COGNITO_USER_POOL_ID')
CLIENT_ID = os.getenv('COGNITO_CLIENT_ID')
REGION = os.getenv('AWS_REGION', os.getenv('AWS_DEFAULT_REGION', 'us-east-1'))

# Check if Cognito is configured
COGNITO_ENABLED = bool(USER_POOL_ID and CLIENT_ID)

# Initialize Cognito client only if configured
cognito_client = None
if COGNITO_ENABLED:
    cognito_client = boto3.client('cognito-idp', region_name=REGION)
else:
    print("[WARN] Cognito not configured. Set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID in .env to enable authentication.")


def register_user(email: str, password: str, name: str, phone_number: Optional[str] = None) -> Dict:
    """
    Register a new user in Cognito.
    
    Args:
        email: User's email address (used as username)
        password: User's password
        name: User's full name
        phone_number: Optional phone number
        
    Returns:
        Dict with user_sub and confirmation status
        
    Raises:
        ClientError: If registration fails
    """
    if not COGNITO_ENABLED:
        raise Exception("Cognito authentication is not configured. Please set COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID in .env file.")
    
    try:
        user_attributes = [
            {'Name': 'email', 'Value': email},
            {'Name': 'name', 'Value': name}
        ]
        
        if phone_number:
            # Cognito requires E.164 format (e.g., +919876543210)
            if not phone_number.startswith('+'):
                # Default to India (+91) if no country code provided
                formatted_phone = f"+91{phone_number}"
            else:
                formatted_phone = phone_number
                
            user_attributes.append({'Name': 'phone_number', 'Value': formatted_phone})
        
        response = cognito_client.sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            Password=password,
            UserAttributes=user_attributes
        )
        
        return {
            'user_sub': response['UserSub'],
            'user_confirmed': response.get('UserConfirmed', False),
            'code_delivery_details': response.get('CodeDeliveryDetails', {})
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'UsernameExistsException':
            raise ValueError("User with this email already exists")
        elif error_code == 'InvalidPasswordException':
            raise ValueError("Password does not meet requirements (min 8 chars, uppercase, lowercase, number)")
        elif error_code == 'InvalidParameterException':
            raise ValueError(f"Invalid parameter: {e.response['Error']['Message']}")
        else:
            raise Exception(f"Registration failed: {e.response['Error']['Message']}")


def verify_email(email: str, code: str) -> bool:
    """
    Verify user's email with confirmation code.
    
    Args:
        email: User's email address
        code: 6-digit verification code from email
        
    Returns:
        True if verification successful
        
    Raises:
        ValueError: If code is invalid or expired
    """
    try:
        cognito_client.confirm_sign_up(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code
        )
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'CodeMismatchException':
            raise ValueError("Invalid verification code")
        elif error_code == 'ExpiredCodeException':
            raise ValueError("Verification code has expired")
        elif error_code == 'NotAuthorizedException':
            raise ValueError("User is already confirmed")
        else:
            raise Exception(f"Verification failed: {e.response['Error']['Message']}")


def resend_verification_code(email: str) -> Dict:
    """
    Resend verification code to user's email.
    
    Args:
        email: User's email address
        
    Returns:
        Dict with code delivery details
    """
    try:
        response = cognito_client.resend_confirmation_code(
            ClientId=CLIENT_ID,
            Username=email
        )
        return response.get('CodeDeliveryDetails', {})
    except ClientError as e:
        raise Exception(f"Failed to resend code: {e.response['Error']['Message']}")


def login_user(email: str, password: str) -> Dict:
    """
    Authenticate user and get JWT tokens.
    
    Args:
        email: User's email address
        password: User's password
        
    Returns:
        Dict with access_token, id_token, refresh_token, and expires_in
        
    Raises:
        ValueError: If credentials are invalid
    """
    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password
            }
        )
        
        auth_result = response['AuthenticationResult']
        return {
            'access_token': auth_result['AccessToken'],
            'id_token': auth_result['IdToken'],
            'refresh_token': auth_result.get('RefreshToken'),
            'expires_in': auth_result['ExpiresIn'],
            'token_type': auth_result['TokenType']
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NotAuthorizedException':
            raise ValueError("Invalid email or password")
        elif error_code == 'UserNotConfirmedException':
            raise ValueError("Email not verified. Please check your email for verification code.")
        elif error_code == 'UserNotFoundException':
            raise ValueError("User not found")
        else:
            raise Exception(f"Login failed: {e.response['Error']['Message']}")


def get_user_info(access_token: str) -> Dict:
    """
    Get user information from access token.
    
    Args:
        access_token: Cognito access token
        
    Returns:
        Dict with user attributes (email, name, sub, etc.)
    """
    try:
        response = cognito_client.get_user(AccessToken=access_token)
        
        # Convert attributes list to dict
        user_attrs = {}
        for attr in response['UserAttributes']:
            user_attrs[attr['Name']] = attr['Value']
        
        return {
            'username': response['Username'],
            'email': user_attrs.get('email'),
            'name': user_attrs.get('name'),
            'phone_number': user_attrs.get('phone_number'),
            'sub': user_attrs.get('sub'),
            'email_verified': user_attrs.get('email_verified') == 'true'
        }
    except ClientError as e:
        raise Exception(f"Failed to get user info: {e.response['Error']['Message']}")


def refresh_token(refresh_token: str) -> Dict:
    """
    Refresh access token using refresh token.
    
    Args:
        refresh_token: Cognito refresh token
        
    Returns:
        Dict with new access_token and id_token
    """
    try:
        response = cognito_client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )
        
        auth_result = response['AuthenticationResult']
        return {
            'access_token': auth_result['AccessToken'],
            'id_token': auth_result['IdToken'],
            'expires_in': auth_result['ExpiresIn'],
            'token_type': auth_result['TokenType']
        }
    except ClientError as e:
        raise Exception(f"Token refresh failed: {e.response['Error']['Message']}")


def change_password(access_token: str, old_password: str, new_password: str) -> bool:
    """
    Change user's password.
    
    Args:
        access_token: User's access token
        old_password: Current password
        new_password: New password
        
    Returns:
        True if password changed successfully
    """
    try:
        cognito_client.change_password(
            AccessToken=access_token,
            PreviousPassword=old_password,
            ProposedPassword=new_password
        )
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NotAuthorizedException':
            raise ValueError("Current password is incorrect")
        elif error_code == 'InvalidPasswordException':
            raise ValueError("New password does not meet requirements")
        else:
            raise Exception(f"Password change failed: {e.response['Error']['Message']}")


def forgot_password(email: str) -> Dict:
    """
    Initiate forgot password flow.
    
    Args:
        email: User's email address
        
    Returns:
        Dict with code delivery details
    """
    try:
        response = cognito_client.forgot_password(
            ClientId=CLIENT_ID,
            Username=email
        )
        return response.get('CodeDeliveryDetails', {})
    except ClientError as e:
        raise Exception(f"Forgot password failed: {e.response['Error']['Message']}")


def confirm_forgot_password(email: str, code: str, new_password: str) -> bool:
    """
    Confirm forgot password with code and set new password.
    
    Args:
        email: User's email address
        code: Verification code from email
        new_password: New password
        
    Returns:
        True if password reset successful
    """
    try:
        cognito_client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=email,
            ConfirmationCode=code,
            Password=new_password
        )
        return True
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'CodeMismatchException':
            raise ValueError("Invalid verification code")
        elif error_code == 'ExpiredCodeException':
            raise ValueError("Verification code has expired")
        elif error_code == 'InvalidPasswordException':
            raise ValueError("Password does not meet requirements")
        else:
            raise Exception(f"Password reset failed: {e.response['Error']['Message']}")


def admin_delete_user(email: str) -> None:
    """
    Admin-delete a user from Cognito by their email (username).
    Requires COGNITO_USER_POOL_ID to be set in env.
    """
    if not COGNITO_ENABLED:
        raise Exception("Cognito not configured")
    try:
        cognito_client.admin_delete_user(
            UserPoolId=USER_POOL_ID,
            Username=email
        )
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'UserNotFoundException':
            return  # already gone — treat as success
        raise Exception(f"Cognito delete failed: {e.response['Error']['Message']}")
