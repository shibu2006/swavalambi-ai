# Chat History Persistence & Restoration Feature

## Overview
Users can now see their previous conversations when they return to the Assistant page. The chat history is automatically saved to DynamoDB and restored when the user opens the Assistant again.

## How It Works

### 1. Saving Chat History (Already Working)
- Every time a user sends a message, the entire conversation is saved to DynamoDB
- Stored in the `swavalambi_users` table under the `chat_history` field
- Format: Array of `{role: "user"|"assistant", content: "message text"}`

### 2. Loading Chat History (New Feature)
When the Assistant page loads:
1. Frontend checks if user is logged in (has `user_id` in localStorage)
2. Calls `GET /api/users/{user_id}/chat-history` to fetch previous messages
3. Displays the conversation history in the UI
4. Backend restores the Strands agent's memory so it remembers the context

### 3. Continuing Conversations
- The Strands agent's memory is restored with previous messages
- The agent can continue the conversation from where it left off
- Context is maintained across sessions

## API Endpoints

### Get Chat History
```
GET /api/users/{user_id}/chat-history
```

**Response:**
```json
{
  "chat_history": [
    {"role": "user", "content": "I am a tailor"},
    {"role": "assistant", "content": "That's wonderful! Are you looking for a job?"}
  ]
}
```

## User Experience

### First Visit
1. User opens Assistant page
2. Sees welcome message: "Namaste! I am your Swavalambi assistant..."
3. Starts conversation

### Return Visit
1. User opens Assistant page
2. Sees loading indicator: "Loading conversation history..."
3. Previous conversation appears
4. Can continue from where they left off

### No History
- If user has no previous chat history, shows welcome message
- If fetch fails, gracefully falls back to welcome message

## Technical Details

### Backend Changes
1. **routes_users.py**: Added `GET /{user_id}/chat-history` endpoint
2. **routes_chat.py**: Restores agent memory when creating new session
3. **Agent Memory**: Converts DynamoDB format to Strands message format

### Frontend Changes
1. **Assistant.tsx**: Added `useEffect` hook to load history on mount
2. **Loading State**: Shows spinner while fetching history
3. **Error Handling**: Gracefully handles fetch failures

### Message Format Conversion

**DynamoDB Format:**
```json
{"role": "user", "content": "Hello"}
```

**Strands Agent Format:**
```json
{
  "role": "user",
  "content": [{"text": "Hello"}]
}
```

## Testing

Run the test script to verify restoration works:
```bash
cd swavalmbi-ai/backend
conda activate ai4bharat
python test_chat_restore.py
```

## Benefits

1. **Better UX**: Users don't have to repeat information
2. **Context Preservation**: Agent remembers previous conversations
3. **Seamless Experience**: Conversations feel continuous across sessions
4. **Data Persistence**: All conversations are safely stored in DynamoDB

## Future Enhancements

Possible improvements:
- Add "Clear History" button
- Show timestamp for each message
- Implement conversation search
- Support multiple conversation threads
- Add conversation export feature
