from strands import Agent
from strands.models import BedrockModel
import boto3
import os
import json

class ProfilingAgent:
    def __init__(self, session_id: str):
        self.session_id = session_id
        model_id = os.getenv("BEDROCK_MODEL_ID", "global.anthropic.claude-sonnet-4-5-20250929-v1:0")

        # Build a boto3 session with explicit credentials so that temporary
        # credentials (AWS_SESSION_TOKEN) from .env are always honoured.
        boto3_session = boto3.Session(
            aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
            aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
            region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        )

        self.system_prompt = """
        You are 'Swavalambi Assistant', a supportive and gamified AI profiler for skilled workers in India.
        Your goal is to converse with the user naturally to extract three pieces of information to build their profile.
        
        1. **profession_skill**: First, greet the user warmly and ask an icebreaker to find out what kind of work they do or what they are good at (e.g., tailoring, plumbing, teaching). Wait for their response.
        
        2. **intent**: Once you know their skill, ask them what their main goal is on the platform:
           - "job" (They are looking for employment)
           - "upskill" (They want to learn and improve skills)
           - "loan" (They want to start a business or get a government scheme)
           
        3. **theory_score**: Based on their skill and intent, ask 1 or 2 basic technical/theory questions to gauge their fundamental knowledge.
        
        4. **is_ready_for_photo**: Once you have asked the theory questions, ask the user if they can upload a clear photo of their recent work to finalize their profile.
        
        When the conversation reaches the point where they are ready to upload a photo,
        your FINAL output must be ONLY a valid JSON object in this exact format (do not include anything else):
        
        {
            "profession_skill": "tailor",
            "intent": "job",
            "theory_score": 4,
            "is_ready_for_photo": true
        }
        
        IMPORTANT: Your `theory_score` should be an integer from 1 to 5.
        Until the final step, converse naturally and keep your responses short (1-2 sentences).
        Always reply in the same language the user speaks. Default to English.
        """

        # Use BedrockModel with explicit boto3 session so temporary
        # credentials (AWS_SESSION_TOKEN) from .env are used.
        self.agent = Agent(
            system_prompt=self.system_prompt,
            model=BedrockModel(
                model_id=model_id,
                temperature=0.7,
                boto_session=boto3_session,
            ),
        )

    def run(self, user_message: str) -> dict:
        """
        Runs the conversational agent with the user's latest message.
        Uses the correct Strands API: agent(prompt) returns a response object.
        """
        # Call agent as a callable — this is the correct Strands pattern
        response = self.agent(user_message)
        response_text = str(response)

        # Check if the LLM outputted the final JSON profile
        if "{" in response_text and "}" in response_text and "is_ready_for_photo" in response_text:
            try:
                json_str = response_text[response_text.find("{"):response_text.rfind("}")+1]
                profile = json.loads(json_str)
                return {
                    "response": "Thank you! Please upload your work sample now using the button below.",
                    "is_ready_for_photo": True,
                    "is_complete": False,
                    "intent_extracted": profile.get("intent"),
                    "profession_skill_extracted": profile.get("profession_skill"),
                }
            except Exception as e:
                print(f"Failed to parse profile JSON: {e}")

        # Normal conversational turn
        return {
            "response": response_text,
            "is_ready_for_photo": False,
            "is_complete": False,
            "intent_extracted": None,
            "profession_skill_extracted": None,
        }

