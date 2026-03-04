"""
Setup S3 lifecycle policy to auto-delete old work sample images.
This helps control storage costs and maintain user privacy.
"""

import boto3
import os
import json
from dotenv import load_dotenv

load_dotenv()

def setup_lifecycle_policy():
    """
    Configure S3 lifecycle policy to delete work samples after 30 days.
    """
    session = boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
    )
    
    s3_client = session.client("s3")
    bucket_name = os.getenv("AWS_S3_BUCKET", "swavalambi-voice")
    
    lifecycle_policy = {
        "Rules": [
            {
                "Id": "DeleteOldWorkSamples",
                "Status": "Enabled",
                "Filter": {
                    "Prefix": "work-samples/"
                },
                "Expiration": {
                    "Days": 30
                }
            }
        ]
    }
    
    try:
        s3_client.put_bucket_lifecycle_configuration(
            Bucket=bucket_name,
            LifecycleConfiguration=lifecycle_policy
        )
        print(f"✓ Successfully configured lifecycle policy for bucket: {bucket_name}")
        print(f"  - Work samples in 'work-samples/' will be deleted after 30 days")
        print(f"  - This helps control storage costs and maintain user privacy")
    except Exception as e:
        print(f"✗ Error configuring lifecycle policy: {e}")
        print(f"  You may need to configure this manually in AWS Console")

if __name__ == "__main__":
    print("Setting up S3 lifecycle policy for work samples...")
    setup_lifecycle_policy()
