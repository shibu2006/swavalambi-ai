from fastapi import APIRouter, HTTPException
from schemas.models import ChatRequest, ChatResponse
from agents.profiling_agent import ProfilingAgent

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
        _agent_sessions[request.session_id] = ProfilingAgent(session_id=request.session_id)
        
    agent = _agent_sessions[request.session_id]
    
    try:
        # Get response from the Strands LLM
        result = agent.run(request.message)
        
        return ChatResponse(
            response=result["response"],
            is_ready_for_photo=result["is_ready_for_photo"],
            is_complete=result["is_complete"],
            intent_extracted=result.get("intent_extracted"),
            profession_skill_extracted=result.get("profession_skill_extracted"),
        )
    except Exception as e:
        print(f"Agent error: {e}")
        raise HTTPException(status_code=500, detail="Failed to communicate with AI Gateway.")
