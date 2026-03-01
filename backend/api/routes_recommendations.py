"""
routes_recommendations.py — Personalized recommendations endpoint.

POST /api/recommendations/fetch
  Body: { session_id, profession_skill, intent, skill_rating, state? }

Returns relevant jobs, schemes, and/or training centers based on the
user's profile collected during the chat assessment.

Data source: live public APIs (Phase 1).
Phase 2: swap service fns to local JSON keyword search.
Phase 3: swap to vector similarity search.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import asyncio

from services.live_data import fetch_jobs, fetch_schemes, fetch_training_centers

router = APIRouter()


class RecommendationRequest(BaseModel):
    session_id: str
    profession_skill: str                    # e.g. "tailor", "plumber"
    intent: str                              # "job" | "upskill" | "loan"
    skill_rating: int = 3                    # 0-5 from vision/theory scores
    state: Optional[str] = None             # e.g. "Maharashtra" (optional)


class RecommendationResponse(BaseModel):
    jobs: list = []
    schemes: list = []
    training_centers: list = []
    message: str = ""


@router.post("/fetch", response_model=RecommendationResponse)
async def get_recommendations(req: RecommendationRequest):
    """
    Fetch personalised recommendations in parallel across all three sources.
    Only returns the data types relevant to the user's intent:
      - intent=job     → jobs + schemes
      - intent=upskill → training_centers + schemes
      - intent=loan    → schemes (loan-specific)
    """
    skill = req.profession_skill.strip().lower()
    intent = req.intent.strip().lower()

    # Run all relevant fetches concurrently using a thread pool since the
    # service functions are blocking HTTP calls.
    loop = asyncio.get_event_loop()

    fetch_tasks = []

    if intent in ("job", "loan"):
        fetch_tasks.append(
            loop.run_in_executor(None, fetch_jobs, skill, 6)
        )
    else:
        fetch_tasks.append(asyncio.sleep(0))   # placeholder

    fetch_tasks.append(
        loop.run_in_executor(None, fetch_schemes, skill, intent, 4)
    )

    if intent == "upskill":
        fetch_tasks.append(
            loop.run_in_executor(None, fetch_training_centers, skill, req.state, 4)
        )
    else:
        fetch_tasks.append(asyncio.sleep(0))   # placeholder

    results = await asyncio.gather(*fetch_tasks, return_exceptions=True)

    jobs_data      = results[0] if isinstance(results[0], list) else []
    schemes_data   = results[1] if isinstance(results[1], list) else []
    centers_data   = results[2] if isinstance(results[2], list) else []

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
