import os
import sys

# Add backend directory to path so we can import agents
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv

# Ensure we load the .env file
load_dotenv()

# Setup test environment variables for Anthropic usage
os.environ["USE_ANTHROPIC"] = "true"
# We won't provide a real key here to avoid committing secrets, 
# but we can check if initialization works without failing on import/setup
# os.environ["ANTHROPIC_API_KEY"] = "sk-ant-test-key"

try:
    from agents.profiling_agent import ProfilingAgent
    print("Successfully imported ProfilingAgent")
    
    agent = ProfilingAgent(session_id="test_session")
    print("Successfully initialized ProfilingAgent with USE_ANTHROPIC=true")
    print(f"Agent model type: {type(agent.model).__name__}")
    
except Exception as e:
    print(f"Error testing ProfilingAgent: {e}")

try:
    from agents.vision_agent import VisionAgent
    print("\nSuccessfully imported VisionAgent")
    
    vision_agent = VisionAgent()
    print("Successfully initialized VisionAgent with USE_ANTHROPIC=true")
    if hasattr(vision_agent, 'anthropic_client'):
        print("VisionAgent correctly instantiated anthropic_client")
    else:
        print("VisionAgent failed to instantiate anthropic_client")

except Exception as e:
    print(f"Error testing VisionAgent: {e}")

print("\nBasic initialization tests complete.")
