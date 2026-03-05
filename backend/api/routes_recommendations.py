"""
routes_recommendations.py — Personalized recommendations endpoint.

POST /api/recommendations/fetch
  Body: { session_id, profession_skill, intent, skill_rating, state? }

Returns relevant jobs, schemes, and/or training centers based on the
user's profile collected during the chat assessment.

Data source: Vector search with PostgreSQL + pgvector (Phase 3 - ACTIVE).
Uses intelligent semantic matching + eligibility scoring.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import asyncio
import logging

# Vector search agents (Phase 3)
from agents.scheme.scheme_tool import search_schemes_tool
from agents.jobs.jobs_tool import search_jobs_tool
from agents.upskill.upskill_tool import search_upskill_tool

# Fallback to live APIs if vector search fails
from services.live_data import fetch_jobs, fetch_schemes, fetch_training_centers

logger = logging.getLogger(__name__)

router = APIRouter()


class RecommendationRequest(BaseModel):
    session_id: str
    profession_skill: str                    # e.g. "tailor", "plumber"
    skill_rating: int = 3                    # 0-5 from vision/theory scores
    state: Optional[str] = None              # e.g. "Maharashtra" (optional)


class RecommendationResponse(BaseModel):
    jobs: list = []
    schemes: list = []
    training_centers: list = []
    message: str = ""


@router.post("/fetch", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest):
    """
    Fetch ALL personalised recommendations using vector search agents.
    Always returns jobs, schemes, and training centers in one call.
    
    Uses intelligent semantic matching with eligibility scoring.
    Falls back to live APIs if vector search fails.
    """
    skill = req.profession_skill.strip().lower()
    state = req.state or "All India"
    
    jobs_data = []
    schemes_data = []
    centers_data = []
    
    # Use vector search agents (runs in thread pool for async compatibility)
    loop = asyncio.get_event_loop()
    
    try:
        # Fetch all 3 types in parallel
        jobs_task = loop.run_in_executor(
            None,
            search_jobs_tool,
            skill,
            req.skill_rating,
            state
        )
        
        schemes_task = loop.run_in_executor(
            None,
            search_schemes_tool,
            skill,
            "job",  # Default intent for schemes
            req.skill_rating,
            state
        )
        
        centers_task = loop.run_in_executor(
            None,
            search_upskill_tool,
            skill,
            req.skill_rating,
            state
        )
        
        # Wait for all to complete
        jobs_data, schemes_data, centers_data = await asyncio.gather(
            jobs_task, schemes_task, centers_task, return_exceptions=True
        )
        
        # Handle exceptions from gather
        if isinstance(jobs_data, Exception):
            logger.warning(f"Jobs vector search failed: {jobs_data}")
            jobs_data = []
        else:
            logger.info(f"Vector search found {len(jobs_data)} jobs for {skill}")
            
        if isinstance(schemes_data, Exception):
            logger.warning(f"Schemes vector search failed: {schemes_data}")
            schemes_data = []
        else:
            logger.info(f"Vector search found {len(schemes_data)} schemes for {skill}")
            
        if isinstance(centers_data, Exception):
            logger.warning(f"Upskill vector search failed: {centers_data}")
            centers_data = []
        else:
            logger.info(f"Vector search found {len(centers_data)} training centers for {skill}")
    
    except Exception as e:
        logger.error(f"Critical error in recommendations: {e}")
        # Return empty results rather than crashing
        pass
    
    # Build a human-readable summary message
    parts = []
    if jobs_data:      parts.append(f"{len(jobs_data)} job openings")
    if schemes_data:   parts.append(f"{len(schemes_data)} government schemes")
    if centers_data:   parts.append(f"{len(centers_data)} training centres")
    
    message = (
        "Here are your personalised recommendations: " + ", ".join(parts) + "."
        if parts else
        "No results found right now — please try again shortly."
    )

    return RecommendationResponse(
        jobs=jobs_data,
        schemes=schemes_data,
        training_centers=centers_data,
        message=message,
    )
