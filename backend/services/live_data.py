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

def fetch_jobs(skill: str, limit: int = 6, location: Optional[str] = None) -> list[dict]:
    """
    Search NCS (National Career Service) for jobs matching `skill`,
    optionally filtered by preferred city/state `location`.
    Returns a clean list of job cards ready for the frontend.
    """
    # Combine skill + location into one search keyword for NCS
    keyword = skill
    if location and location.strip():
        keyword = f"{skill} {location.strip()}"
        logger.info(f"[NCS] Fetching jobs for skill='{skill}' location='{location}'")
    else:
        logger.info(f"[NCS] Fetching jobs for skill='{skill}' (no location filter)")

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Origin": "https://betacloud.ncs.gov.in",
        "Referer": "https://betacloud.ncs.gov.in/job-listing",
    }
    payload = {
        "sortBy": "RELEVANCE",
        "keyword": keyword,
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

# Skill synonym/stem expansion — maps user skill words to substrings that appear in QP names
_SKILL_SYNONYMS: dict[str, list[str]] = {
    "plumber":    ["plumb"],
    "plumbing":   ["plumb"],
    "electrician":["electric", "wiring"],
    "welder":     ["weld"],
    "welding":    ["weld"],
    "carpenter":  ["carpent", "wood"],
    "tailor":     ["tailor", "sewing", "garment"],
    "tailoring":  ["tailor", "sewing", "garment"],
    "mechanic":   ["mechanic", "technician", "motor", "automobile"],
    "painter":    ["paint"],
    "mason":      ["mason", "construct", "brick"],
    "construction": ["construct", "mason", "civil"],
    "driver":     ["driver", "driving"],
    "cook":       ["cook", "food", "catering"],
    "beautician": ["beauty", "cosmet", "salon"],
    "nurse":      ["nurs", "health", "medical"],
    "computer":   ["computer", "it ", "data entry", "software"],
    "solar":      ["solar"],
    "security":   ["security", "guard"],
}

_LOCAL_JSON_PATH = None

def _get_local_json_path() -> str:
    """Resolve path to the bundled training centers JSON relative to this file."""
    import os
    global _LOCAL_JSON_PATH
    if _LOCAL_JSON_PATH is None:
        here = os.path.dirname(os.path.abspath(__file__))               # services/
        root = os.path.dirname(here)                                     # backend/
        project_root = os.path.dirname(root)                             # project root
        _LOCAL_JSON_PATH = os.path.join(
            project_root, "data", "upskill-agent", "skill_india_training_centers.json"
        )
    return _LOCAL_JSON_PATH


def _skill_keywords(skill: str) -> list[str]:
    """Return substrings to search for in QP names for the given skill."""
    skill_l = skill.lower()
    synonyms = _SKILL_SYNONYMS.get(skill_l, [])
    # Always include the raw skill too (covers exact matches like 'solar')
    all_kw = list({skill_l} | set(synonyms))
    return all_kw


def _search_local_json(skill: str, state: Optional[str], limit: int) -> list[dict]:
    """Keyword-search the bundled JSON for training centers matching skill."""
    import json, os
    path = _get_local_json_path()
    if not os.path.exists(path):
        logger.warning(f"Local training centers JSON not found at: {path}")
        return []

    keywords = _skill_keywords(skill)
    logger.info(f"[LocalJSON] Searching for skill='{skill}' keywords={keywords}")

    try:
        with open(path, encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        logger.warning(f"Failed to load local JSON: {e}")
        return []

    matched = []
    state_lower = state.lower() if state else ""

    for c in data:
        loc = c.get("TcLocation", {})
        center_state = loc.get("State", "").lower()

        # Optional state filter — skip non-matching states only if state was specified
        if state_lower and state_lower not in center_state:
            continue

        qp_list = c.get("QpDetails", [])
        relevant_courses = [
            qp.get("QpName", "")
            for qp in qp_list
            if any(kw in qp.get("QpName", "").lower() for kw in keywords)
        ]
        if not relevant_courses:
            continue

        matched.append({
            "id": c.get("Id", ""),
            "name": c.get("TcName", "—"),
            "address": ", ".join(filter(None, [
                loc.get("District", ""),
                loc.get("State", ""),
            ])),
            "courses": relevant_courses[:3],
            "center_type": c.get("SourceSystem", "Govt Certified"),
            "source": "SkillIndia",
            "url": "https://www.skillindiadigital.gov.in/training-centre/list",
        })
        if len(matched) >= limit:
            break

    # If state-filtered gave nothing, retry without state filter
    if not matched and state_lower:
        logger.info(f"[LocalJSON] No results for state='{state}', retrying without state filter")
        return _search_local_json(skill, None, limit)

    return matched[:limit]


def fetch_training_centers(
    skill: str,
    state: Optional[str] = None,
    limit: int = 4,
) -> list[dict]:
    """
    Search Skill India Digital Hub for training centers offering courses
    related to `skill`, optionally filtered by `state`.

    First tries the live API. If the live API returns no skill-matched results,
    falls back to the bundled skill_india_training_centers.json.
    """
    keywords = _skill_keywords(skill)
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
        "PageSize": 50,        # fetch more, then filter for skill match
        "State": state or "",
        "SourceSystem": "",
    }

    live_matched = []
    try:
        resp = requests.post(SKILL_INDIA_URL, headers=headers, json=payload, timeout=_TIMEOUT)
        resp.raise_for_status()
        body = resp.json()
        centers = body.get("Data", {}).get("results", [])

        for c in centers:
            qp_list = c.get("QpDetails", [])
            relevant_courses = [
                qp.get("QpName", "")
                for qp in qp_list
                if any(kw in qp.get("QpName", "").lower() for kw in keywords)
            ]
            if relevant_courses or not qp_list:
                loc = c.get("TcLocation", {})
                live_matched.append({
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
            if len(live_matched) >= limit:
                break
    except Exception as e:
        logger.warning(f"SkillIndia live API error: {e}")

    # If live API returned skill-matched results, use them
    # (exclude centers added only due to 'not qp_list' — those are generic fallbacks)
    strict_live = [c for c in live_matched if c["courses"]]
    if strict_live:
        logger.info(f"[LiveAPI] Found {len(strict_live)} centers for skill='{skill}'")
        return strict_live[:limit]

    # Fall back to the local bundled JSON
    logger.info(f"[LiveAPI] No skill-matched centers for '{skill}', falling back to local JSON")
    return _search_local_json(skill, state, limit)

