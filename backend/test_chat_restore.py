#!/usr/bin/env python3
"""
Test script to verify chat history restoration works
"""
import os
from dotenv import load_dotenv
from agents.profiling_agent import ProfilingAgent
import json

load_dotenv(override=True)

# Simulate restoring chat history
print("Testing chat history restoration...")
print("-" * 60)

# Create a new agent
session_id = "test-session-123"
agent = ProfilingAgent(session_id=session_id)

# Simulate previous chat history from DynamoDB
previous_chat = [
    {"role": "user", "content": "I am a tailor"},
    {"role": "assistant", "content": "That's wonderful! Are you looking for a job, upskilling, or a loan?"}
]

print(f"\nRestoring {len(previous_chat)} messages...")
for msg in previous_chat:
    print(f"  - {msg['role']}: {msg['content'][:50]}...")

# Restore messages to agent
restored_messages = []
for msg in previous_chat:
    restored_messages.append({
        "role": msg["role"],
        "content": [{"text": msg["content"]}]
    })

agent.agent.messages = restored_messages

print(f"\n✅ Agent memory restored with {len(agent.agent.messages)} messages")
print("\nAgent should now remember the context...")

# Test that agent remembers
print("\nTesting agent response with restored context:")
print("User: 'I want to find a job'")
result = agent.run("I want to find a job")
print(f"Assistant: {result['response'][:200]}...")

print("\n✅ Test complete!")
