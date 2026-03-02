"""
setup_voice_services.py — Setup script for voice services (S3 bucket creation)

Run from the backend directory:
    python scripts/setup_voice_services.py

Requires valid AWS credentials in .env or ~/.aws/credentials.
"""

import boto3
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Load .env from the backend/ directory
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

BUCKET_NAME = os.getenv("AWS_S3_BUCKET", "swavalambi-voice")
REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")


def create_s3_bucket():
    """Create S3 bucket for temporary voice audio files"""
    session = boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
        region_name=REGION,
    )
    s3_client = session.client("s3")

    try:
        # Check if bucket already exists
        try:
            s3_client.head_bucket(Bucket=BUCKET_NAME)
            print(f"✅  Bucket '{BUCKET_NAME}' already exists — nothing to do.")
            return True
        except:
            pass  # Bucket doesn't exist, create it

        print(f"Creating S3 bucket '{BUCKET_NAME}' in {REGION} ...")
        
        # Create bucket
        if REGION == "us-east-1":
            # us-east-1 doesn't need LocationConstraint
            s3_client.create_bucket(Bucket=BUCKET_NAME)
        else:
            s3_client.create_bucket(
                Bucket=BUCKET_NAME,
                CreateBucketConfiguration={"LocationConstraint": REGION}
            )

        # Add lifecycle policy to auto-delete temp files after 1 day
        lifecycle_policy = {
            "Rules": [
                {
                    "ID": "DeleteTempAudioFiles",
                    "Status": "Enabled",
                    "Prefix": "temp/",
                    "Expiration": {"Days": 1},
                }
            ]
        }
        s3_client.put_bucket_lifecycle_configuration(
            Bucket=BUCKET_NAME, LifecycleConfiguration=lifecycle_policy
        )

        # Block public access (security best practice)
        s3_client.put_public_access_block(
            Bucket=BUCKET_NAME,
            PublicAccessBlockConfiguration={
                "BlockPublicAcls": True,
                "IgnorePublicAcls": True,
                "BlockPublicPolicy": True,
                "RestrictPublicBuckets": True,
            },
        )

        print(f"✅  Bucket '{BUCKET_NAME}' created successfully!")
        print(f"    Region: {REGION}")
        print(f"    Lifecycle: Auto-delete temp files after 1 day")
        print(f"    Public Access: Blocked")
        return True

    except Exception as e:
        print(f"❌  Failed to create bucket: {e}", file=sys.stderr)
        return False


def verify_aws_permissions():
    """Verify AWS credentials and permissions"""
    print("\n🔍 Verifying AWS credentials and permissions...")
    
    session = boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
        region_name=REGION,
    )
    
    try:
        # Test S3 access
        s3_client = session.client("s3")
        s3_client.list_buckets()
        print("✅  S3 access: OK")
    except Exception as e:
        print(f"❌  S3 access: FAILED - {e}")
        return False
    
    try:
        # Test Transcribe access
        transcribe_client = session.client("transcribe")
        transcribe_client.list_transcription_jobs(MaxResults=1)
        print("✅  Transcribe access: OK")
    except Exception as e:
        print(f"⚠️  Transcribe access: FAILED - {e}")
        print("    Note: Transcribe permissions may need to be added")
    
    try:
        # Test Polly access
        polly_client = session.client("polly")
        polly_client.describe_voices(LanguageCode="hi-IN")
        print("✅  Polly access: OK")
    except Exception as e:
        print(f"⚠️  Polly access: FAILED - {e}")
        print("    Note: Polly permissions may need to be added")
    
    try:
        # Test Translate access
        translate_client = session.client("translate")
        translate_client.translate_text(
            Text="test", SourceLanguageCode="en", TargetLanguageCode="hi"
        )
        print("✅  Translate access: OK")
    except Exception as e:
        print(f"⚠️  Translate access: FAILED - {e}")
        print("    Note: Translate permissions may need to be added")
    
    return True


def check_sarvam_api_key():
    """Check if Sarvam API key is configured"""
    print("\n🔍 Checking Sarvam AI configuration...")
    
    api_key = os.getenv("SARVAM_API_KEY")
    if not api_key or api_key == "your_sarvam_api_key_here":
        print("⚠️  Sarvam API key not configured")
        print("    To use Sarvam AI as fallback, add your API key to .env:")
        print("    SARVAM_API_KEY=your_actual_key")
        return False
    else:
        print(f"✅  Sarvam API key configured: {api_key[:10]}...")
        return True


def main():
    print("=" * 60)
    print("Voice Services Setup")
    print("=" * 60)
    
    print(f"\nConfiguration:")
    print(f"  S3 Bucket: {BUCKET_NAME}")
    print(f"  Region: {REGION}")
    print(f"  Voice Provider: {os.getenv('VOICE_PROVIDER', 'aws')}")
    
    # Verify AWS permissions
    if not verify_aws_permissions():
        print("\n❌ AWS permissions check failed. Please verify your credentials.")
        sys.exit(1)
    
    # Create S3 bucket
    print("\n" + "=" * 60)
    if not create_s3_bucket():
        print("\n❌ Failed to create S3 bucket.")
        sys.exit(1)
    
    # Check Sarvam API key
    print("\n" + "=" * 60)
    check_sarvam_api_key()
    
    print("\n" + "=" * 60)
    print("✅ Voice services setup complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. If using Sarvam AI, add your API key to .env")
    print("2. Start the backend: uvicorn main:app --reload")
    print("3. Test voice features in the frontend")
    print("\nFor more info, see: VOICE_IMPLEMENTATION_GUIDE.md")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Setup interrupted by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)
