"""
live_data.py — Live API data fetcher for Swavalambi recommendations.

Architecture note:
  Each public function (fetch_jobs, fetch_schemes, fetch_training_centers)
  is the single swap-point for later migration to a local JSON DB or
  vector search. The route layer never touches HTTP directly.
"""

import requests
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Constants ────────────────────────────────────────────────────────────────

NCS_JOB_URL       = "https://betacloud.ncs.gov.in/api/v1/job-posts/search"
MYSCHEME_URL      = "https://api.myscheme.gov.in/search/v6/schemes"
MYSCHEME_API_KEY  = "tYTy5eEhlu9rFjyxuCr7ra7ACp4dv1RH8gWuHTDc"
SKILL_INDIA_URL   = "https://api-fe.skillindiadigital.gov.in/api/trainingcenters/filter"

_TIMEOUT = 10   # seconds per outbound request

# ── Jobs ─────────────────────────────────────────────────────────────────────

def fetch_jobs(skill: str, limit: int = 6) -> list[dict]:
    """
    Search NCS (National Career Service) for jobs matching `skill`.
    Returns a clean list of job cards ready for the frontend.

    TODO (Phase 2): replace with keyword search over slim local JSON.
    TODO (Phase 3): replace with vector similarity search on embeddings.
    """
    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://betacloud.ncs.gov.in",
        "Referer": "https://betacloud.ncs.gov.in/job-listing",
    }
    payload = {
        "sortBy": "RELEVANCE",
        "keyword": skill,
        "useProfileData": False,
    }

    try:
        resp = requests.post(
            f"{NCS_JOB_URL}?page=0&size={limit}",
            headers=headers,
            json=payload,
            timeout=_TIMEOUT,
        )
        resp.raise_for_status()
        data = resp.json().get("data", {})
        raw_jobs = data.get("content", [])
    except Exception as e:
        logger.warning(f"NCS jobs API error: {e}")
        return []

    results = []
    for j in raw_jobs[:limit]:
        # Flatten location list → readable string
        locs = j.get("jobLocations") or []
        location_str = ", ".join(
            f"{loc.get('city', '')} ({loc.get('state', '')})"
            for loc in locs[:2]
        ) or ("All India" if j.get("isJobAllIndiaOrRemote") else "N/A")

        salary_min = j.get("minSalary") or 0
        salary_max = j.get("maxSalary") or 0
        salary_str = (
            f"₹{int(salary_min):,} – ₹{int(salary_max):,}/yr"
            if salary_min and not j.get("hideSalaryRange")
            else "Not disclosed"
        )

        results.append({
            "id": j.get("id"),
            "title": j.get("jobTitle", "—"),
            "company": j.get("organizationName", "—"),
            "location": location_str,
            "salary": salary_str,
            "vacancies": j.get("noOfVacancies", 1),
            "education": j.get("minEducation", ""),
            "contact": j.get("recruiterMobile", ""),
            "posted_days_ago": j.get("postedDaysAgo", 0),
            "source": "NCS",
            "apply_url": f"https://betacloud.ncs.gov.in/job-details/{j.get('id', '')}",
        })

    return results


# ── Schemes ──────────────────────────────────────────────────────────────────

def fetch_schemes(skill: str, intent: str, limit: int = 4) -> list[dict]:
    """
    Search myScheme.gov.in for government schemes matching the user's
    skill and intent (job / upskill / loan).

    TODO (Phase 2): local JSON keyword search.
    """
    # Map intent to a richer query keyword
    intent_keyword_map = {
        "job":     f"{skill} employment",
        "upskill": f"{skill} training skill",
        "loan":    f"{skill} loan self employment",
    }
    keyword = intent_keyword_map.get(intent, skill)

    headers = {
        "x-api-key": MYSCHEME_API_KEY,
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Origin": "https://www.myscheme.gov.in",
        "Referer": "https://www.myscheme.gov.in/",
    }
    params = {
        "lang": "en",
        "q": "[]",
        "keyword": keyword,
        "sort": "",
        "from": 0,
        "size": limit,
    }

    try:
        resp = requests.get(MYSCHEME_URL, params=params, headers=headers, timeout=_TIMEOUT)
        resp.raise_for_status()
        body = resp.json()

        # Try multiple response structures used by the API
        hits = (
            body.get("hits", {}).get("hits")
            or body.get("data", {}).get("results")
            or body.get("data", {}).get("hits", {}).get("items")
            or []
        )
    except Exception as e:
        logger.warning(f"myScheme API error: {e}")
        return []

    results = []
    for h in hits[:limit]:
        src = h.get("_source", h)  # some responses wrap in _source
        # myScheme API nests all fields under a "fields" key
        fields = src.get("fields", src)
        results.append({
            "id": h.get("_id", ""),
            "name": fields.get("schemeName", fields.get("name", src.get("schemeName", "—"))),
            "ministry": fields.get("nodalMinistryName", fields.get("ministry", src.get("sponsoredBy", "—"))),
            "description": (fields.get("briefDescription") or src.get("briefDescription") or src.get("description") or "")[:200],
            "categories": fields.get("schemeCategory", src.get("category", [])),
            "tags": (fields.get("tags") or src.get("tags", []))[:5],
            "source": "myScheme",
            "url": f"https://www.myscheme.gov.in/schemes/{fields.get('slug', h.get('_id', ''))}",
        })

    return results


# ── Training Centers ──────────────────────────────────────────────────────────

def fetch_training_centers(
    skill: str,
    state: Optional[str] = None,
    limit: int = 4,
) -> list[dict]:
    """
    Search Skill India Digital Hub for training centers offering courses
    related to `skill`, optionally filtered by `state`.

    TODO (Phase 2): local JSON keyword search over QpDetails.
    """
    headers = {
        "accept": "application/json, text/plain, */*",
        "content-type": "application/json",
        "language": "en",
    }
    payload = {
        "selectedDistrict": "",
        "selectedState": state or "",
        "selectedCenterType": "",
        "selectedSourceSystem": "",
        "CandidateId": "",
        "PageNumber": 1,
        "PageSize": 20,        # fetch more, then filter for skill match
        "State": state or "",
        "SourceSystem": "",
    }

    try:
        resp = requests.post(SKILL_INDIA_URL, headers=headers, json=payload, timeout=_TIMEOUT)
        resp.raise_for_status()
        body = resp.json()
        centers = body.get("Data", {}).get("results", [])
    except Exception as e:
        logger.warning(f"SkillIndia API error: {e}")
        return []

    # Filter centers that offer a course matching the skill keyword
    skill_lower = skill.lower()
    matched = []
    for c in centers:
        qp_list = c.get("QpDetails", [])
        relevant_courses = [
            qp.get("QpName", "")
            for qp in qp_list
            if skill_lower in qp.get("QpName", "").lower()
        ]
        if relevant_courses or not qp_list:   # include if courses match or no filter possible
            loc = c.get("TcLocation", {})
            matched.append({
                "id": c.get("Id", ""),
                "name": c.get("TcName", "—"),
                "address": ", ".join(filter(None, [
                    loc.get("District", ""),
                    loc.get("State", ""),
                ])),
                "courses": relevant_courses[:3] or [qp.get("QpName","") for qp in qp_list[:3]],
                "center_type": c.get("CenterType", ""),
                "source": "SkillIndia",
                "url": "https://www.skillindiadigital.gov.in/training-centre/list",
            })
        if len(matched) >= limit:
            break

    return matched[:limit]
