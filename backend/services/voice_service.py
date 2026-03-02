"""
voice_service.py — Voice services with AWS and Sarvam AI providers

Supports:
- Speech-to-Text (Transcribe / Sarvam Saaras)
- Text-to-Speech (Polly / Sarvam Bulbul)
- Translation (AWS Translate / Sarvam Mayura)
"""

import boto3
import os
import requests
import base64
import json
from typing import Optional, Dict, Any
from enum import Enum


class VoiceProvider(Enum):
    AWS = "aws"
    SARVAM = "sarvam"


class VoiceService:
    def __init__(self):
        self.provider = VoiceProvider(os.getenv("VOICE_PROVIDER", "aws"))
        self._init_aws()
        self._init_sarvam()
    
    def _init_aws(self):
        """Initialize AWS clients"""
        session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        )
        self.transcribe_client = session.client("transcribe")
        self.polly_client = session.client("polly")
        self.translate_client = session.client("translate")
        self.s3_client = session.client("s3")
    
    def _init_sarvam(self):
        """Initialize Sarvam AI configuration"""
        self.sarvam_api_key = os.getenv("SARVAM_API_KEY")
        self.sarvam_base_url = "https://api.sarvam.ai"
    
    def transcribe(
        self,
        audio_bytes: bytes,
        language_code: str = "hi-IN",
        audio_format: str = "wav"
    ) -> Dict[str, Any]:
        """
        Transcribe audio to text
        
        Args:
            audio_bytes: Audio file bytes
            language_code: Language code (e.g., 'hi-IN', 'ta-IN')
            audio_format: Audio format ('wav', 'mp3', 'webm')
        
        Returns:
            {
                "text": "transcribed text",
                "language": "hi-IN",
                "confidence": 0.95,
                "provider": "aws"
            }
        """
        try:
            if self.provider == VoiceProvider.AWS:
                return self._transcribe_aws(audio_bytes, language_code, audio_format)
            else:
                return self._transcribe_sarvam(audio_bytes, language_code)
        except Exception as e:
            print(f"[ERROR] Transcription failed with {self.provider.value}: {e}")
            # Fallback to other provider
            if self.provider == VoiceProvider.AWS:
                print("[INFO] Falling back to Sarvam AI")
                return self._transcribe_sarvam(audio_bytes, language_code)
            else:
                print("[INFO] Falling back to AWS")
                return self._transcribe_aws(audio_bytes, language_code, audio_format)
    
    def _transcribe_aws(
        self,
        audio_bytes: bytes,
        language_code: str,
        audio_format: str
    ) -> Dict[str, Any]:
        """Transcribe using AWS Transcribe"""
        # AWS Transcribe requires S3 upload for batch processing
        # For real-time, we'd use StartStreamTranscription
        # For MVP, using synchronous approach with temp S3 upload
        
        bucket_name = os.getenv("AWS_S3_BUCKET", "swavalambi-voice-temp")
        file_key = f"temp/{os.urandom(16).hex()}.{audio_format}"
        
        # Upload to S3
        self.s3_client.put_object(
            Bucket=bucket_name,
            Key=file_key,
            Body=audio_bytes
        )
        
        job_name = f"transcribe-{os.urandom(8).hex()}"
        file_uri = f"s3://{bucket_name}/{file_key}"
        
        # Start transcription job
        self.transcribe_client.start_transcription_job(
            TranscriptionJobName=job_name,
            Media={"MediaFileUri": file_uri},
            MediaFormat=audio_format,
            LanguageCode=language_code
        )
        
        # Wait for completion (in production, use async/webhook)
        import time
        while True:
            status = self.transcribe_client.get_transcription_job(
                TranscriptionJobName=job_name
            )
            job_status = status["TranscriptionJob"]["TranscriptionJobStatus"]
            
            if job_status in ["COMPLETED", "FAILED"]:
                break
            time.sleep(1)
        
        # Clean up S3
        self.s3_client.delete_object(Bucket=bucket_name, Key=file_key)
        
        if job_status == "FAILED":
            raise Exception("Transcription job failed")
        
        # Get transcript
        transcript_uri = status["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
        transcript_response = requests.get(transcript_uri)
        transcript_data = transcript_response.json()
        
        text = transcript_data["results"]["transcripts"][0]["transcript"]
        confidence = transcript_data["results"]["items"][0].get("alternatives", [{}])[0].get("confidence", 0.0)
        
        return {
            "text": text,
            "language": language_code,
            "confidence": float(confidence),
            "provider": "aws"
        }
    
    def _transcribe_sarvam(
        self,
        audio_bytes: bytes,
        language_code: str
    ) -> Dict[str, Any]:
        """Transcribe using Sarvam AI Saaras"""
        # Convert language code (hi-IN -> hi)
        lang = language_code.split("-")[0]
        
        url = f"{self.sarvam_base_url}/speech-to-text"
        headers = {
            "Authorization": f"Bearer {self.sarvam_api_key}",
        }
        
        files = {
            "audio": ("audio.wav", audio_bytes, "audio/wav")
        }
        data = {
            "language_code": lang,
            "model": os.getenv("SARVAM_STT_MODEL", "saaras:v1")
        }
        
        response = requests.post(url, headers=headers, files=files, data=data)
        response.raise_for_status()
        
        result = response.json()
        
        return {
            "text": result.get("transcript", ""),
            "language": language_code,
            "confidence": result.get("confidence", 0.0),
            "provider": "sarvam"
        }
    
    def synthesize(
        self,
        text: str,
        language_code: str = "hi-IN",
        voice_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Synthesize text to speech
        
        Args:
            text: Text to convert to speech
            language_code: Language code
            voice_id: Optional voice ID (AWS: 'Aditi', 'Kajal', etc.)
        
        Returns:
            {
                "audio_base64": "base64 encoded audio",
                "audio_format": "mp3",
                "duration": 3.5,
                "provider": "aws"
            }
        """
        try:
            if self.provider == VoiceProvider.AWS:
                return self._synthesize_aws(text, language_code, voice_id)
            else:
                return self._synthesize_sarvam(text, language_code)
        except Exception as e:
            print(f"[ERROR] Synthesis failed with {self.provider.value}: {e}")
            # Fallback
            if self.provider == VoiceProvider.AWS:
                print("[INFO] Falling back to Sarvam AI")
                return self._synthesize_sarvam(text, language_code)
            else:
                print("[INFO] Falling back to AWS")
                return self._synthesize_aws(text, language_code, voice_id)
    
    def _synthesize_aws(
        self,
        text: str,
        language_code: str,
        voice_id: Optional[str]
    ) -> Dict[str, Any]:
        """Synthesize using AWS Polly"""
        # Map language to voice
        if not voice_id:
            voice_map = {
                "hi-IN": "Aditi",  # Hindi female
                "ta-IN": "Kajal",  # Tamil female
                "te-IN": "Kajal",  # Telugu (use Tamil voice)
            }
            voice_id = voice_map.get(language_code, "Aditi")
        
        response = self.polly_client.synthesize_speech(
            Text=text,
            OutputFormat="mp3",
            VoiceId=voice_id,
            Engine="standard"  # Use standard engine (Aditi doesn't support neural)
        )
        
        audio_bytes = response["AudioStream"].read()
        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
        
        return {
            "audio_base64": audio_base64,
            "audio_format": "mp3",
            "duration": len(audio_bytes) / 16000,  # Rough estimate
            "provider": "aws"
        }
    
    def _synthesize_sarvam(
        self,
        text: str,
        language_code: str
    ) -> Dict[str, Any]:
        """Synthesize using Sarvam AI Bulbul"""
        lang = language_code.split("-")[0]
        
        url = f"{self.sarvam_base_url}/text-to-speech"
        headers = {
            "Authorization": f"Bearer {self.sarvam_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "language_code": lang,
            "model": os.getenv("SARVAM_TTS_MODEL", "bulbul:v1"),
            "speaker": "meera"  # Default female voice
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        return {
            "audio_base64": result.get("audio", ""),
            "audio_format": "wav",
            "duration": result.get("duration", 0.0),
            "provider": "sarvam"
        }
    
    def translate(
        self,
        text: str,
        source_lang: str = "auto",
        target_lang: str = "en"
    ) -> Dict[str, Any]:
        """
        Translate text between languages
        
        Args:
            text: Text to translate
            source_lang: Source language code ('auto' for detection)
            target_lang: Target language code
        
        Returns:
            {
                "translated_text": "translated text",
                "source_language": "hi",
                "target_language": "en",
                "provider": "aws"
            }
        """
        try:
            if self.provider == VoiceProvider.AWS:
                return self._translate_aws(text, source_lang, target_lang)
            else:
                return self._translate_sarvam(text, source_lang, target_lang)
        except Exception as e:
            print(f"[ERROR] Translation failed with {self.provider.value}: {e}")
            # Fallback
            if self.provider == VoiceProvider.AWS:
                return self._translate_sarvam(text, source_lang, target_lang)
            else:
                return self._translate_aws(text, source_lang, target_lang)
    
    def _translate_aws(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> Dict[str, Any]:
        """Translate using AWS Translate"""
        response = self.translate_client.translate_text(
            Text=text,
            SourceLanguageCode=source_lang,
            TargetLanguageCode=target_lang
        )
        
        return {
            "translated_text": response["TranslatedText"],
            "source_language": response["SourceLanguageCode"],
            "target_language": response["TargetLanguageCode"],
            "provider": "aws"
        }
    
    def _translate_sarvam(
        self,
        text: str,
        source_lang: str,
        target_lang: str
    ) -> Dict[str, Any]:
        """Translate using Sarvam AI Mayura"""
        url = f"{self.sarvam_base_url}/translate"
        headers = {
            "Authorization": f"Bearer {self.sarvam_api_key}",
            "Content-Type": "application/json"
        }
        
        data = {
            "text": text,
            "source_language_code": source_lang,
            "target_language_code": target_lang,
            "model": os.getenv("SARVAM_TRANSLATE_MODEL", "mayura:v1")
        }
        
        response = requests.post(url, headers=headers, json=data)
        response.raise_for_status()
        
        result = response.json()
        
        return {
            "translated_text": result.get("translated_text", ""),
            "source_language": source_lang,
            "target_language": target_lang,
            "provider": "sarvam"
        }


# Singleton instance
_voice_service = None

def get_voice_service() -> VoiceService:
    """Get or create voice service instance"""
    global _voice_service
    if _voice_service is None:
        _voice_service = VoiceService()
    return _voice_service
