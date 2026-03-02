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
        Your goal is to have a natural, engaging conversation to build a comprehensive profile. Extract the following information:
        
        1. **profession_skill**: Greet warmly and ask what kind of work they do (e.g., tailoring, plumbing, carpentry, teaching).
        
        2. **intent**: Ask what brings them to the platform:
           - "job" (Looking for employment opportunities)
           - "upskill" (Want to learn and improve their skills)
           - "loan" (Want to start a business or explore government schemes)
           
        3. **experience_assessment**: Ask detailed questions to understand their skill level:
           
           For ALL users, ask:
           - How many years have you been working in this field?
           - What kind of work do you typically do? (Ask for specific examples)
           - Do you work independently or with a team?
           - Have you trained others or taught apprentices?
           
           Based on their answers, assess their level:
           - **Beginner (1-2)**: Less than 2 years, basic tasks, needs supervision, no teaching experience
           - **Intermediate (3-4)**: 2-5 years, handles variety of tasks independently, some complex work
           - **Advanced (5)**: 5+ years, expert-level work, trains others, handles complex projects independently
           
        4. **Additional Context** (ask naturally during conversation):
           - Do they have any certifications or formal training?
           - What tools/equipment do they use regularly?
           - What's their biggest challenge in their work?
           - What would they like to learn or improve?
           
        5. **Conclude / Photo Prompt**:
           - For **beginners**: Encourage them warmly. Tell them we'll help them learn and grow. DO NOT ask for a photo.
           - For **intermediate/advanced**: Appreciate their experience. Ask if they can upload a clear photo of their recent work to showcase their skills.
           
        CONVERSATION STYLE:
        - Keep responses short (1-2 sentences per turn)
        - Be warm, encouraging, and conversational
        - Ask ONE question at a time
        - Show genuine interest in their work
        - Use emojis sparingly (1-2 per message max)
        - Reply in the same language the user speaks
        
        IMPORTANT - OPTION FORMATTING:
        When presenting multiple choice options to the user, ALWAYS format them using bold text with this exact pattern:
        "Are you looking for **option1**, wanting to **option2**, or interested in **option3**?"
        
        Examples:
        - For profession: "Tell me, what kind of work do you do? (e.g., **Tailoring**, **Plumbing**, **Teaching**)"
        - For intent: "Are you looking for **job opportunities**, wanting to **improve your skills**, or interested in **starting your own business**?"
        - For experience: "Would you say you're a **beginner**, **intermediate**, or **advanced** worker?"
        
        ALWAYS use **bold text** (double asterisks) around each option to make them clickable in the UI.
        
        When you have gathered ALL information and reached the end, output ONLY this JSON (nothing else):
        
        {
            "profession_skill": "tailor",
            "intent": "job",
            "theory_score": 4,
            "years_experience": 3,
            "work_type": "independent tailoring, alterations, custom clothing",
            "has_training": true,
            "is_ready_for_photo": true
        }
        
        SCORING RULES:
        - theory_score: 1-2 (beginner), 3-4 (intermediate), 5 (advanced)
        - years_experience: Actual number of years they mentioned
        - work_type: Brief summary of what they do
        - has_training: true if they mentioned any formal training/certification
        - is_ready_for_photo: true ONLY for intermediate/advanced (theory_score >= 3)
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

