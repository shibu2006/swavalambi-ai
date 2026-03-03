from fastapi import APIRouter, HTTPException
from schemas.models import ChatRequest, ChatResponse
from agents.profiling_agent import ProfilingAgent
from services.dynamodb_service import update_chat_history
import warnings
import os

# Suppress Pydantic serialization warnings for Strands message objects
# These warnings occur because Strands uses complex internal message structures
# but we're already converting everything to simple types (str, bool, int)
warnings.filterwarnings("ignore", category=UserWarning, module="pydantic.main")

router = APIRouter()

# In-memory dictionary to hold Agent instances mapped by session_id
_agent_sessions = {}

@router.post("/chat-profile", response_model=ChatResponse, summary="AI Gateway chat using Strands")
async def chat_profile(request: ChatRequest):
    """
    Pass the user message to the ProfilingAgent to extract intent and theory score.
    Uses Strands framework underneath to maintain memory context based on session_id.
    """
    # Retrieve or create agent session
    if request.session_id not in _agent_sessions:
        _agent_sessions[request.session_id] = ProfilingAgent(
            session_id=request.session_id,
            user_name=request.user_name or ""
        )
        
        # If user_id is provided, try to restore previous chat history
        if request.user_id:
            try:
                from services.dynamodb_service import get_user
                user = get_user(request.user_id)
                if user and "chat_history" in user and user["chat_history"]:
                    # Restore the agent's memory with previous messages
                    chat_history = user["chat_history"]
                    # Convert to Strands message format
                    restored_messages = []
                    for msg in chat_history:
                        restored_messages.append({
                            "role": msg["role"],
                            "content": [{"text": msg["content"]}]
                        })
                    # Set the agent's messages
                    _agent_sessions[request.session_id].agent.messages = restored_messages
                    print(f"[INFO] Restored {len(chat_history)} messages from DynamoDB for user {request.user_id}")
            except Exception as e:
                print(f"[WARN] Failed to restore chat history: {e}")
        
    agent = _agent_sessions[request.session_id]
    
    try:
        # Get response from the Strands LLM
        result = agent.run(request.message)
        
        # Save chat history to DynamoDB if user_id is provided
        if request.user_id:
            try:
                # Strands Agent stores conversation history in agent.messages
                if hasattr(agent.agent, "messages") and agent.agent.messages:
                    raw_messages = agent.agent.messages
                    # Serialize messages for DynamoDB storage
                    serialized_chat = []
                    
                    for msg in raw_messages:
                        role = None
                        content_str = ""
                        
                        # Extract role
                        if isinstance(msg, dict):
                            role = msg.get("role")
                            content = msg.get("content")
                        elif hasattr(msg, "role"):
                            role = msg.role
                            content = msg.content if hasattr(msg, "content") else None
                        else:
                            continue
                        
                        if not role:
                            continue
                        
                        # Extract text from content (handle various formats)
                        if content is None:
                            content_str = ""
                        elif isinstance(content, str):
                            content_str = content
                        elif isinstance(content, list):
                            # Handle list of content blocks
                            text_parts = []
                            for block in content:
                                # Try different ways to extract text
                                if isinstance(block, str):
                                    text_parts.append(block)
                                elif isinstance(block, dict):
                                    if "text" in block:
                                        text_parts.append(str(block["text"]))
                                elif hasattr(block, "text"):
                                    text_parts.append(str(block.text))
                                elif hasattr(block, "__dict__") and "text" in block.__dict__:
                                    text_parts.append(str(block.__dict__["text"]))
                            content_str = " ".join(text_parts).strip()
                        else:
                            # Fallback: convert to string
                            content_str = str(content)
                        
                        if content_str:  # Only add if we have content
                            serialized_chat.append({
                                "role": role,
                                "content": content_str
                            })
                    
                    if serialized_chat:
                        update_chat_history(request.user_id, serialized_chat)
                        print(f"[INFO] Saved {len(serialized_chat)} messages to DynamoDB for user {request.user_id}")
            except Exception as e:
                print(f"[WARN] Failed to persist chat history to DynamoDB: {e}")
                import traceback
                traceback.print_exc()
                
        # Return response - ensure all values are JSON-serializable
        # Create a clean response object with explicit type conversion
        return ChatResponse(
            response=str(result.get("response", "")),
            is_ready_for_photo=bool(result.get("is_ready_for_photo", False)),
            is_complete=bool(result.get("is_complete", False)),
            intent_extracted=str(result["intent_extracted"]) if result.get("intent_extracted") else None,
            profession_skill_extracted=str(result["profession_skill_extracted"]) if result.get("profession_skill_extracted") else None,
            theory_score_extracted=int(result["theory_score_extracted"]) if result.get("theory_score_extracted") is not None else None,
            gender_extracted=str(result["gender_extracted"]) if result.get("gender_extracted") else None,
            location_extracted=str(result["location_extracted"]) if result.get("location_extracted") else None,
        )
    except Exception as e:
        print(f"Agent error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with AI Gateway.")
