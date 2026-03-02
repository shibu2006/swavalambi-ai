from strands import Agent
from strands.models import BedrockModel, AnthropicModel
import boto3
import os
import json

class ProfilingAgent:
    def __init__(self, session_id: str):
        self.session_id = session_id
        
        # Check if we should use the direct Anthropic API or AWS Bedrock
        self.use_anthropic = os.getenv("USE_ANTHROPIC", "false").lower() == "true"
        
        if self.use_anthropic:
            model_id = os.getenv("ANTHROPIC_MODEL_ID", "claude-3-5-sonnet-latest")
            api_key = os.getenv("ANTHROPIC_API_KEY")
            
            self.model = AnthropicModel(
                model_id=model_id,
                max_tokens=1000,
                params={"temperature": 0.7},
                client_args={"api_key": api_key}
            )
        else:
            model_id = os.getenv("BEDROCK_MODEL_ID", "global.anthropic.claude-sonnet-4-5-20250929-v1:0")

            # Build a boto3 session with explicit credentials so that temporary
            # credentials (AWS_SESSION_TOKEN) from .env are always honoured.
            boto3_session = boto3.Session(
                aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
                aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
                aws_session_token=os.getenv("AWS_SESSION_TOKEN"),
                region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
            )
            
            self.model = BedrockModel(
                model_id=model_id,
                temperature=0.7,
                boto_session=boto3_session,
            )


        self.system_prompt = """
        You are 'Swavalambi Assistant', a supportive, friendly, and encouraging AI profiler for skilled workers and artisans in India.
        Your goal is to converse with the user naturally to extract three pieces of information to build their profile.
        
        1. **profession_skill**: First, greet the user warmly and ask an icebreaker to find out what kind of work they do (e.g., tailoring, plumbing, carpentry, teaching). Wait for their response.
        
        2. **intent**: Once you know their skill, ask them what their main goal is on the platform:
           - "job" (They are looking for employment)
           - "upskill" (They want to learn, get assistance, and improve skills)
           - "loan" (They want to start a business or get a government scheme)
           
        3. **experience_level (theory_score)**: Ask them gently about their experience level—are they a beginner, intermediate, or advanced worker? Ask what kind of assistance or work they usually do. DO NOT ask technical test questions.
        
        4. **Conclude / Photo Prompt**:
           - If they are a **beginner**: Tell them that is perfectly fine and we are here to help them learn and grow. DO NOT ask them for a photo of their work.
           - If they are **intermediate or advanced**: Tell them it's great to have an experienced professional. Ask them if they can upload a clear photo of their recent work to showcase their skills on their profile.
           
        When you have gathered everything and reached the end of the profile extraction, your FINAL output must be ONLY a valid JSON object in this exact format (do not include anything else):
        
        {
            "profession_skill": "tailor",
            "intent": "job",
            "theory_score": 4,
            "is_ready_for_photo": true
        }
        
        IMPORTANT RULES for JSON:
        - `theory_score` should be mapped from their experience: Beginner (1-2), Intermediate (3-4), Advanced (5).
        - `is_ready_for_photo` should be `true` ONLY if they are intermediate/advanced and ready to upload a photo. If they are a beginner, it MUST be `false`.
        
        Until the final step, converse naturally and keep your responses short (1-2 sentences). Be very welcoming (e.g., "That's a great mindset! 🌟 Learning never stops!").
        Always reply in the same language the user speaks. Default to English.
        """

        # Initialize the Strands Agent with the conditionally created model
        self.agent = Agent(
            system_prompt=self.system_prompt,
            model=self.model,
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
                
                is_ready = profile.get("is_ready_for_photo", False)
                
                final_response = "Thank you! Please upload your work sample now using the button below." 
                if not is_ready:
                    final_response = "Thank you! Your profile information has been successfully saved. We look forward to helping you grow!"
                    
                return {
                    "response": final_response,
                    "is_ready_for_photo": is_ready,
                    "is_complete": not is_ready, # If not ready for photo (e.g. beginner), we just mark it complete
                    "intent_extracted": profile.get("intent"),
                    "profession_skill_extracted": profile.get("profession_skill"),
                    "theory_score_extracted": profile.get("theory_score"),
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
            "theory_score_extracted": None,
        }

