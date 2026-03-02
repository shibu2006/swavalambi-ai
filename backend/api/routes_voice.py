"""
routes_voice.py — Voice API endpoints for speech-to-text and text-to-speech
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from pydantic import BaseModel
from services.voice_service import get_voice_service
from agents.profiling_agent import ProfilingAgent
import os

router = APIRouter()

# In-memory agent sessions (shared with routes_chat.py)
_agent_sessions = {}


class SynthesizeRequest(BaseModel):
    text: str
    language: str = "hi-IN"
    voice_id: Optional[str] = None


class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str = "en"


@router.post("/transcribe", summary="Transcribe audio to text")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Form("hi-IN"),
    user_id: Optional[str] = Form(None),
):
    """
    Transcribe audio file to text using AWS Transcribe or Sarvam AI
    
    Supported languages:
    - hi-IN: Hindi
    - ta-IN: Tamil
    - te-IN: Telugu
    - mr-IN: Marathi
    - kn-IN: Kannada (Sarvam only)
    - ml-IN: Malayalam (Sarvam only)
    - bn-IN: Bengali (Sarvam only)
    - gu-IN: Gujarati (Sarvam only)
    """
    try:
        # Read audio file
        audio_bytes = await audio.read()
        
        # Validate file size (max 10MB)
        if len(audio_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Audio file too large (max 10MB)")
        
        # Get audio format from filename
        audio_format = audio.filename.split(".")[-1].lower()
        if audio_format not in ["wav", "mp3", "webm", "ogg"]:
            audio_format = "wav"  # Default
        
        # Transcribe
        voice_service = get_voice_service()
        result = voice_service.transcribe(
            audio_bytes=audio_bytes,
            language_code=language,
            audio_format=audio_format
        )
        
        print(f"[INFO] Transcribed audio for user {user_id}: {result['text'][:50]}...")
        
        return result
        
    except Exception as e:
        print(f"[ERROR] Transcription failed: {e}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/synthesize", summary="Convert text to speech")
async def synthesize_speech(request: SynthesizeRequest):
    """
    Convert text to speech using AWS Polly or Sarvam AI
    
    Returns base64-encoded audio
    """
    try:
        voice_service = get_voice_service()
        result = voice_service.synthesize(
            text=request.text,
            language_code=request.language,
            voice_id=request.voice_id
        )
        
        print(f"[INFO] Synthesized speech: {request.text[:50]}...")
        
        return result
        
    except Exception as e:
        print(f"[ERROR] Synthesis failed: {e}")
        raise HTTPException(status_code=500, detail=f"Synthesis failed: {str(e)}")


@router.post("/translate", summary="Translate text between languages")
async def translate_text(request: TranslateRequest):
    """
    Translate text using AWS Translate or Sarvam AI
    """
    try:
        voice_service = get_voice_service()
        result = voice_service.translate(
            text=request.text,
            source_lang=request.source_lang,
            target_lang=request.target_lang
        )
        
        print(f"[INFO] Translated: {request.source_lang} -> {request.target_lang}")
        
        return result
        
    except Exception as e:
        print(f"[ERROR] Translation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@router.post("/chat", summary="Voice chat with AI assistant")
async def voice_chat(
    audio: UploadFile = File(...),
    session_id: str = Form(...),
    user_id: Optional[str] = Form(None),
    language: str = Form("hi-IN"),
):
    """
    Complete voice chat flow:
    1. Transcribe user's audio
    2. Translate to English (if needed)
    3. Send to AI agent
    4. Translate response back to user's language
    5. Synthesize response to speech
    
    Returns both text and audio response
    """
    try:
        # Step 1: Transcribe audio
        audio_bytes = await audio.read()
        audio_format = audio.filename.split(".")[-1].lower()
        if audio_format not in ["wav", "mp3", "webm", "ogg"]:
            audio_format = "wav"
        
        voice_service = get_voice_service()
        transcription = voice_service.transcribe(
            audio_bytes=audio_bytes,
            language_code=language,
            audio_format=audio_format
        )
        
        user_text = transcription["text"]
        print(f"[INFO] User said: {user_text}")
        
        # Step 2: Translate to English if needed
        enable_translation = os.getenv("VOICE_ENABLE_TRANSLATION", "true").lower() == "true"
        if enable_translation and not language.startswith("en"):
            translation = voice_service.translate(
                text=user_text,
                source_lang=language.split("-")[0],
                target_lang="en"
            )
            english_text = translation["translated_text"]
            print(f"[INFO] Translated to English: {english_text}")
        else:
            english_text = user_text
        
        # Step 3: Get AI response
        if session_id not in _agent_sessions:
            _agent_sessions[session_id] = ProfilingAgent(session_id=session_id)
        
        agent = _agent_sessions[session_id]
        result = agent.run(english_text)
        response_text = result["response"]
        
        print(f"[INFO] Agent response: {response_text[:50]}...")
        
        # Step 4: Translate response back to user's language
        if enable_translation and not language.startswith("en"):
            translation = voice_service.translate(
                text=response_text,
                source_lang="en",
                target_lang=language.split("-")[0]
            )
            localized_response = translation["translated_text"]
            print(f"[INFO] Translated response: {localized_response[:50]}...")
        else:
            localized_response = response_text
        
        # Step 5: Synthesize response to speech
        synthesis = voice_service.synthesize(
            text=localized_response,
            language_code=language
        )
        
        return {
            "transcribed_text": user_text,
            "english_text": english_text,
            "response_text": response_text,
            "localized_response": localized_response,
            "audio_base64": synthesis["audio_base64"],
            "audio_format": synthesis["audio_format"],
            "provider": transcription["provider"],
            "is_ready_for_photo": result.get("is_ready_for_photo", False),
            "is_complete": result.get("is_complete", False),
            "intent_extracted": result.get("intent_extracted"),
            "profession_skill_extracted": result.get("profession_skill_extracted"),
            "theory_score_extracted": result.get("theory_score_extracted"),
        }
        
    except Exception as e:
        print(f"[ERROR] Voice chat failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Voice chat failed: {str(e)}")
