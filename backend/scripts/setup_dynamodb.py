"""
setup_dynamodb.py — One-time script to create the swavalambi_users DynamoDB table.

Run from the backend directory:
    python scripts/setup_dynamodb.py

Requires valid AWS credentials in .env or ~/.aws/credentials.
"""

import boto3
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Always load .env from the backend/ directory, regardless of CWD
# override=True ensures .env wins over any shell-level env vars (e.g. AWS_DEFAULT_REGION)
_env_path = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

TABLE_NAME = os.getenv("DYNAMODB_TABLE", "swavalambi_users")
REGION     = os.getenv("AWS_DEFAULT_REGION", "us-east-1")


def create_table():
    session = boto3.Session(
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
        region_name=REGION,
    )
    dynamodb = session.client("dynamodb")

    # Check if table already exists
    existing = dynamodb.list_tables().get("TableNames", [])
    if TABLE_NAME in existing:
        print(f"✅  Table '{TABLE_NAME}' already exists — nothing to do.")
        return

    print(f"Creating DynamoDB table '{TABLE_NAME}' in {REGION} ...")
    resp = dynamodb.create_table(
        TableName=TABLE_NAME,
        AttributeDefinitions=[
            {"AttributeName": "user_id", "AttributeType": "S"},
        ],
        KeySchema=[
            {"AttributeName": "user_id", "KeyType": "HASH"},
        ],
        BillingMode="PAY_PER_REQUEST",   # on-demand — no provisioned capacity needed
        Tags=[
            {"Key": "Project", "Value": "Swavalambi"},
            {"Key": "Environment", "Value": "dev"},
        ],
    )

    # Wait until table is active
    waiter = dynamodb.get_waiter("table_exists")
    print("Waiting for table to become ACTIVE ...")
    waiter.wait(TableName=TABLE_NAME)

    status = resp["TableDescription"]["TableStatus"]
    print(f"✅  Table '{TABLE_NAME}' created successfully (status: {status}).")
    print(f"    ARN: {resp['TableDescription']['TableArn']}")


if __name__ == "__main__":
    try:
        create_table()
    except Exception as e:
        print(f"❌  Failed to create table: {e}", file=sys.stderr)
        sys.exit(1)
