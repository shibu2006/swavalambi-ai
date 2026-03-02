#!/usr/bin/env python3
"""
Test script to verify chat history is being saved to DynamoDB
"""
import os
from dotenv import load_dotenv
import json
import boto3

# Force reload .env with override=True to ensure it takes precedence
load_dotenv(override=True)

# Test user ID from your logs
user_id = "999999999"

# Explicitly set region to us-east-1
region = "us-east-1"
table_name = os.getenv('DYNAMODB_TABLE', 'swavalambi_users')

print(f"Fetching user data for user_id: {user_id}")
print(f"Table: {table_name}")
print(f"Region: {region}")
print(f"AWS_ACCESS_KEY_ID: {os.getenv('AWS_ACCESS_KEY_ID', 'NOT SET')[:20]}...")
print("-" * 60)

# Create session with explicit region
session = boto3.Session(
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
    aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
    region_name=region,
)
dynamodb = session.resource("dynamodb")
table = dynamodb.Table(table_name)

try:
    resp = table.get_item(Key={"user_id": user_id})
    user_data = resp.get("Item")
    
    if user_data:
        print("✅ User found!")
        print(f"\nUser data:")
        print(json.dumps(user_data, indent=2, default=str))
        
        if "chat_history" in user_data:
            print(f"\n✅ Chat history exists with {len(user_data['chat_history'])} messages")
            print("\nChat history:")
            for i, msg in enumerate(user_data['chat_history'], 1):
                print(f"\n  Message {i}:")
                print(f"    Role: {msg.get('role')}")
                content = msg.get('content', '')
                print(f"    Content: {content[:100]}..." if len(content) > 100 else f"    Content: {content}")
        else:
            print("\n❌ No chat_history field found in user record")
    else:
        print(f"❌ User {user_id} not found in database")
        print("\nPossible reasons:")
        print("  1. User hasn't been created yet (need to register first)")
        print("  2. Wrong user_id")
        
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
