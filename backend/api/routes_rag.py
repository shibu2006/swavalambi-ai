from fastapi import APIRouter, Depends, Query
from typing import List

router = APIRouter()

@router.get("/jobs", summary="RAG search for relevant jobs")
async def get_jobs(
    skill_rating: int = Query(..., description="User's skill rating 1-5"),
    intent: str = Query(..., description="User intent, e.g., 'job'"),
    query: str = Query(..., description="Search query or user location/preferences")
):
    """
    Uses the MarketAgent to perform a semantic search against OpenSearch Serverless 
    for relevant jobs matching the user's profile.
    """
    # agent = MarketAgent(opensearch_client)
    # results = agent.search(intent, skill_rating, query)
    
    # Mock response
    return {
        "results": [
            {
                "id": "job_1",
                "title": "Senior Tailor",
                "company": "Meera Boutique",
                "required_skill_rating": 3,
                "location": "Bangalore"
            }
        ]
    }

@router.get("/schemes", summary="RAG search for relevant government schemes")
async def get_schemes(
    skill_rating: int = Query(..., description="User's skill rating 1-5"),
    intent: str = Query(..., description="User intent, e.g., 'loan'"),
):
    """
    Uses the SchemeAgent to perform a semantic search against OpenSearch.
    """
    return {
        "results": [
            {
                "id": "scheme_1",
                "title": "PM Vishwakarma",
                "provider": "Govt of India",
                "required_skill_rating": 2,
                "details": "Collateral free loan up to 3 lakhs."
            }
        ]
    }

@router.get("/courses", summary="Get relevant upskilling courses")
async def get_courses():
    """
    Returns relevant government or platform upskilling courses like Skill Digital India.
    """
    return {
        "results": [
            {
                "id": "course_1",
                "title": "Advanced Stitching - Skill India",
                "provider": "Skill Digital India",
                "hours": 10
            }
        ]
    }
