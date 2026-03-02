import requests
import json
import time
import os
from dotenv import load_dotenv

load_dotenv('.env')

s_id = f'test_{time.time()}'
user_id = '+919999999999'
payload = {'session_id': s_id, 'message': 'I need a job as a tailor', 'user_id': user_id}

# Send chat request
r = requests.post('http://127.0.0.1:8000/api/chat/chat-profile', json=payload)
print(f'Chat Status: {r.status_code}')
if r.status_code == 200:
    print(json.dumps(r.json(), indent=2))

# Verify dynamo db manually
import boto3

session = boto3.Session(
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
    region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1'),
)
dynamodb = session.resource('dynamodb')
table = dynamodb.Table('swavalambi_users')
item = table.get_item(Key={'user_id': user_id}).get('Item')
if item and 'chat_history' in item:
    print(f'Chat history found for {user_id}: {len(item["chat_history"])} messages')
    print("Last message:", item["chat_history"][-1])
else:
    print('No chat history found!')
