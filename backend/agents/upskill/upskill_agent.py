"""
upskill_agent.py — Upskill Agent for training/course matching.
"""

from agents.base_agent import BaseAgent


class UpskillAgent(BaseAgent):
    """AI Agent for training/course matching."""
    
    def _build_text_for_embedding(self, doc: dict) -> str:
        location = doc.get('location', '')
        return f"{doc['name']} {doc['description']} {' '.join(doc.get('skills', []))} {doc.get('provider', '')} {location}"
    
    def _build_query_text(self, user_profile: dict) -> str:
        state = user_profile.get('state', '')
        return f"{user_profile.get('skill', '')} training course {state}"
    
    def calculate_eligibility_score(self, course: dict, user_profile: dict) -> float:
        score = 0.0
        
        user_skill = user_profile.get("skill", "").lower()
        course_skills = [s.lower() for s in course.get("skills", [])]
        course_name = course.get("name", "").lower()
        if user_skill in course_name or any(user_skill in s for s in course_skills):
            score += 0.5
        
        user_level = user_profile.get("skill_level", 0)
        if user_level < 3:
            score += 0.3
        else:
            score += 0.1
        
        user_state = user_profile.get("state", "").lower()
        course_location = course.get("location", "").lower()
        if not course_location or "online" in course_location or user_state in course_location:
            score += 0.2
        
        return min(score, 1.0)
    
    def search_courses(self, user_profile: dict, limit: int = 10) -> list[dict]:
        results = self.search(user_profile, limit)
        
        # If no results found, try a broader search with generic skill terms
        if not results:
            import logging
            logger = logging.getLogger(__name__)
            logger.info(f"No training centers found for '{user_profile.get('skill')}', trying broader search")
            
            # Try broader search with generic terms
            broader_profile = user_profile.copy()
            broader_profile['skill'] = 'skill development training'
            results = self.search(broader_profile, limit)
        
        # Add contact info as actionable link for each training center
        for center in results:
            contact = center.get('contact', '')
            email = center.get('email', '')
            if contact:
                center['contact_url'] = f"tel:{contact.replace(' ', '')}"
            if email:
                center['email_url'] = f"mailto:{email}"
        return results
