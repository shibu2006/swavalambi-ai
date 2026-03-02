import boto3
import json
import base64
import os
import anthropic

class VisionAgent:
    def __init__(self):
        # Check if we should use the direct Anthropic API or AWS Bedrock
        self.use_anthropic = os.getenv("USE_ANTHROPIC", "false").lower() == "true"
        
        if self.use_anthropic:
            self.model_id = os.getenv("ANTHROPIC_MODEL_ID", "claude-3-5-sonnet-latest")
            api_key = os.getenv("ANTHROPIC_API_KEY")
            
            # Using synchronous client as we're not in an async context here natively
            self.anthropic_client = anthropic.Anthropic(
                api_key=api_key,
            )
        else:
            # Initialize boto3 client for Bedrock using explicit credentials
            # Supports temporary credentials (AWS_SESSION_TOKEN) from STS/SSO
            self.bedrock_client = boto3.client(
                'bedrock-runtime',
                region_name=os.getenv('AWS_DEFAULT_REGION', 'us-east-1'),
                aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
                aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
                aws_session_token=os.getenv('AWS_SESSION_TOKEN'),
            )
            # Use the same model for vision — Claude Sonnet 4.5 supports vision
            self.model_id = os.getenv("BEDROCK_MODEL_ID", "global.anthropic.claude-sonnet-4-5-20250929-v1:0")


    def analyze_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
        """
        Sends an image to Claude (via Anthropic API or Bedrock) to evaluate the skill rating.
        Returns a dict with `vision_score` and `feedback`.
        """
        base64_image = base64.b64encode(image_bytes).decode('utf-8')
        
        system_prompt = "You are a master evaluator of craftsmanship and professional skills..."
        
        prompt = f"""
        Please evaluate the attached image of the user's work sample (e.g., tailoring, plumbing, carpentry).
        Provide a 'vision_score' between 1 and 5 indicating the quality of the work.
        1 = Novice/Poor
        5 = Expert/Excellent
        
        Also provide a short 1-2 sentence 'feedback' explaining the score.
        
        Output MUST be valid JSON only:
        {{
            "vision_score": 4,
            "feedback": "The stitching is extremely precise..."
        }}
        """

        try:
            if self.use_anthropic:
                # Format for direct Anthropic API
                # Anthropic API uses base64 encoding with media_type
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": mime_type,
                                    "data": base64_image
                                }
                            },
                            {
                                "type": "text",
                                "text": prompt
                            }
                        ]
                    }
                ]
                
                message = self.anthropic_client.messages.create(
                    model=self.model_id,
                    system=system_prompt,
                    messages=messages,
                    max_tokens=1000,
                    temperature=0.7
                )
                output_text = message.content[0].text
                
            else:
                # Format for AWS Bedrock Converse API
                messages = [
                    {
                        "role": "user",
                        "content": [
                            {
                                "image": {
                                    "format": mime_type.split('/')[-1], # e.g. "jpeg", "png"
                                    "source": {
                                        "bytes": image_bytes
                                    }
                                }
                            },
                            {
                                "text": prompt
                            }
                        ]
                    }
                ]
                
                # Note: Converse API is recommended for Claude 3 on Bedrock
                response = self.bedrock_client.converse(
                    modelId=self.model_id,
                    messages=messages,
                    system=[{"text": system_prompt}]
                )
                
                output_text = response['output']['message']['content'][0]['text']
            
            # Extract JSON block
            json_str = output_text[output_text.find("{"):output_text.rfind("}")+1]
            result = json.loads(json_str)
            
            return {
                "vision_score": result.get("vision_score", 1),
                "feedback": result.get("feedback", "No feedback provided.")
            }
            
        except Exception as e:
            print(f"Error calling Vision API ({'Anthropic' if self.use_anthropic else 'Bedrock'}): {e}")
            import traceback
            traceback.print_exc()
            # Fallback mock for MVP if API fails
            return {
                "vision_score": 3,
                "feedback": "Fallback score. Unable to process image due to internal error."
            }
