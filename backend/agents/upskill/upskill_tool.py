"""
upskill_tool.py — Upskill/training search tool definition
"""
from typing import Dict, List
import os
from dotenv import load_dotenv

load_dotenv()

def search_upskill_tool(skill: str, skill_level: int, state: str) -> List[Dict]:
    """
    Search for training courses based on user's skill and location.
    
    Args:
        skill: User's skill or profession
        skill_level: Skill proficiency level from 1-5
        state: User's state in India
    
    Returns:
        List of relevant training courses ranked by match score
    """
    from agents.upskill.upskill_agent import UpskillAgent
    from common.providers.embedding_providers import AzureOpenAIEmbeddingProvider
    from common.stores.vector_stores import PostgresPgVectorStore
    
    embedding_provider = AzureOpenAIEmbeddingProvider(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        deployment_name=os.getenv("AZURE_OPENAI_DEPLOYMENT"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION")
    )
    
    vector_store = PostgresPgVectorStore(
        connection_string=os.getenv("POSTGRES_CONNECTION_STRING")
    )
    
    agent = UpskillAgent(
        embedding_provider=embedding_provider,
        vector_store=vector_store,
        index_name="upskill"
    )
    
    user_profile = {
        "skill": skill,
        "skill_level": skill_level,
        "state": state
    }
    
    return agent.search_courses(user_profile, limit=5)
