"""
Setup script for AWS Cognito User Pool and Client.
Creates a Cognito User Pool with email-based authentication for Swavalambi.

Run this script once to set up authentication:
    python scripts/setup_cognito.py

The script will:
1. Create a Cognito User Pool with email verification
2. Create an App Client for the frontend
3. Configure password policies and security settings
4. Output the User Pool ID and Client ID to add to .env file
"""

import boto3
import os
from botocore.exceptions import ClientError

# AWS Configuration
REGION = os.getenv('AWS_DEFAULT_REGION', 'us-east-1')
USER_POOL_NAME = 'swavalambi-users'
CLIENT_NAME = 'swavalambi-web-client'

def create_cognito_user_pool():
    """
    Create a Cognito User Pool with email-based authentication.
    Returns the User Pool ID and Client ID.
    """
    cognito_client = boto3.client('cognito-idp', region_name=REGION)
    
    try:
        print(f"[INFO] Creating Cognito User Pool: {USER_POOL_NAME}")
        
        # Create User Pool
        response = cognito_client.create_user_pool(
            PoolName=USER_POOL_NAME,
            Policies={
                'PasswordPolicy': {
                    'MinimumLength': 8,
                    'RequireUppercase': True,
                    'RequireLowercase': True,
                    'RequireNumbers': True,
                    'RequireSymbols': False,
                    'TemporaryPasswordValidityDays': 7
                }
            },
            AutoVerifiedAttributes=['email'],
            UsernameAttributes=['email'],
            UsernameConfiguration={
                'CaseSensitive': False
            },
            MfaConfiguration='OFF',
            AccountRecoverySetting={
                'RecoveryMechanisms': [
                    {
                        'Priority': 1,
                        'Name': 'verified_email'
                    }
                ]
            },
            EmailConfiguration={
                'EmailSendingAccount': 'COGNITO_DEFAULT'
            },
            VerificationMessageTemplate={
                'DefaultEmailOption': 'CONFIRM_WITH_CODE',
                'EmailSubject': 'Swavalambi - Verify your email',
                'EmailMessage': 'Welcome to Swavalambi! Your verification code is {####}'
            },
            UserAttributeUpdateSettings={
                'AttributesRequireVerificationBeforeUpdate': ['email']
            },
            Schema=[
                {
                    'Name': 'email',
                    'AttributeDataType': 'String',
                    'Required': True,
                    'Mutable': True
                },
                {
                    'Name': 'name',
                    'AttributeDataType': 'String',
                    'Required': True,
                    'Mutable': True
                },
                {
                    'Name': 'phone_number',
                    'AttributeDataType': 'String',
                    'Required': False,
                    'Mutable': True
                }
            ]
        )
        
        user_pool_id = response['UserPool']['Id']
        print(f"[SUCCESS] User Pool created: {user_pool_id}")
        
        # Create App Client
        print(f"[INFO] Creating App Client: {CLIENT_NAME}")
        client_response = cognito_client.create_user_pool_client(
            UserPoolId=user_pool_id,
            ClientName=CLIENT_NAME,
            GenerateSecret=False,  # No secret for web/mobile apps
            RefreshTokenValidity=30,  # 30 days
            AccessTokenValidity=60,  # 60 minutes
            IdTokenValidity=60,  # 60 minutes
            TokenValidityUnits={
                'AccessToken': 'minutes',
                'IdToken': 'minutes',
                'RefreshToken': 'days'
            },
            ReadAttributes=['email', 'name', 'phone_number'],
            WriteAttributes=['email', 'name', 'phone_number'],
            ExplicitAuthFlows=[
                'ALLOW_USER_PASSWORD_AUTH',
                'ALLOW_REFRESH_TOKEN_AUTH',
                'ALLOW_USER_SRP_AUTH'
            ],
            PreventUserExistenceErrors='ENABLED',
            EnableTokenRevocation=True,
            EnablePropagateAdditionalUserContextData=False
        )
        
        client_id = client_response['UserPoolClient']['ClientId']
        print(f"[SUCCESS] App Client created: {client_id}")
        
        # Print configuration
        print("\n" + "="*70)
        print("COGNITO SETUP COMPLETE!")
        print("="*70)
        print("\nAdd these values to your backend/.env file:")
        print(f"\nCOGNITO_USER_POOL_ID={user_pool_id}")
        print(f"COGNITO_CLIENT_ID={client_id}")
        print(f"AWS_REGION={REGION}")
        print("\n" + "="*70)
        print("\nNext steps:")
        print("1. Update backend/.env with the values above")
        print("2. Restart your backend server")
        print("3. Test user registration at http://localhost:3000")
        print("="*70 + "\n")
        
        return {
            'user_pool_id': user_pool_id,
            'client_id': client_id,
            'region': REGION
        }
        
    except ClientError as e:
        error_code = e.response['Error']['Code']
        
        if error_code == 'UserPoolTaggingException':
            print("[ERROR] Failed to create User Pool - check IAM permissions")
        elif error_code == 'LimitExceededException':
            print("[ERROR] User Pool limit exceeded - delete unused pools or request limit increase")
        else:
            print(f"[ERROR] Failed to create User Pool: {e.response['Error']['Message']}")
        
        raise
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        raise


def check_existing_user_pool():
    """
    Check if a User Pool with the same name already exists.
    """
    cognito_client = boto3.client('cognito-idp', region_name=REGION)
    
    try:
        print(f"[INFO] Checking for existing User Pool: {USER_POOL_NAME}")
        
        # List all user pools
        paginator = cognito_client.get_paginator('list_user_pools')
        for page in paginator.paginate(MaxResults=60):
            for pool in page.get('UserPools', []):
                if pool['Name'] == USER_POOL_NAME:
                    print(f"[FOUND] Existing User Pool: {pool['Id']}")
                    
                    # List clients for this pool
                    clients = cognito_client.list_user_pool_clients(
                        UserPoolId=pool['Id'],
                        MaxResults=60
                    )
                    
                    if clients.get('UserPoolClients'):
                        client = clients['UserPoolClients'][0]
                        print(f"[FOUND] Existing Client: {client['ClientId']}")
                        
                        print("\n" + "="*70)
                        print("EXISTING COGNITO CONFIGURATION FOUND")
                        print("="*70)
                        print("\nAdd these values to your backend/.env file:")
                        print(f"\nCOGNITO_USER_POOL_ID={pool['Id']}")
                        print(f"COGNITO_CLIENT_ID={client['ClientId']}")
                        print(f"AWS_REGION={REGION}")
                        print("\n" + "="*70 + "\n")
                        
                        return {
                            'user_pool_id': pool['Id'],
                            'client_id': client['ClientId'],
                            'region': REGION
                        }
        
        print("[INFO] No existing User Pool found")
        return None
        
    except ClientError as e:
        print(f"[WARN] Could not check existing pools: {e.response['Error']['Message']}")
        return None


def main():
    """
    Main setup function.
    """
    print("\n" + "="*70)
    print("SWAVALAMBI - COGNITO SETUP")
    print("="*70 + "\n")
    
    # Check for existing User Pool
    existing = check_existing_user_pool()
    
    if existing:
        response = input("\nUser Pool already exists. Create a new one? (y/N): ")
        if response.lower() != 'y':
            print("[INFO] Using existing User Pool")
            return existing
    
    # Create new User Pool
    return create_cognito_user_pool()


if __name__ == '__main__':
    try:
        result = main()
        print("[SUCCESS] Cognito setup complete!")
    except KeyboardInterrupt:
        print("\n[INFO] Setup cancelled by user")
    except Exception as e:
        print(f"\n[ERROR] Setup failed: {e}")
        print("\nTroubleshooting:")
        print("1. Check your AWS credentials: aws sts get-caller-identity")
        print("2. Verify IAM permissions for cognito-idp:CreateUserPool")
        print("3. Check AWS region is correct in .env file")
        exit(1)
