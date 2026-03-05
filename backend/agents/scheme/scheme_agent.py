"""
scheme_agent.py — Scheme Agent for scheme matching.
"""

from agents.base_agent import BaseAgent


class SchemeAgent(BaseAgent):
    """AI Agent for scheme matching."""
    
    def _build_text_for_embedding(self, doc: dict) -> str:
        state = doc.get('state', 'All India')
        return f"{doc['name']} {doc['description']} {' '.join(doc.get('categories', []))} {' '.join(doc.get('tags', []))} {state}"
    
    def _build_query_text(self, user_profile: dict) -> str:
        state = user_profile.get('state', '')
        return f"{user_profile.get('skill', '')} {user_profile.get('intent', '')} scheme {state}"
    
    def calculate_eligibility_score(self, scheme: dict, user_profile: dict) -> float:
        score = 0.0
        
        user_skill = user_profile.get("skill", "").lower()
        scheme_categories = [c.lower() for c in scheme.get("categories", [])]
        scheme_tags = [t.lower() for t in scheme.get("tags", [])]
        if any(user_skill in cat for cat in scheme_categories + scheme_tags):
            score += 0.4
        
        user_intent = user_profile.get("intent", "").lower()
        scheme_desc = scheme.get("description", "").lower()
        intent_keywords = {
            "job": ["employment", "job", "placement"],
            "upskill": ["training", "skill", "course", "education"],
            "loan": ["loan", "credit", "financial", "subsidy"]
        }
        if any(kw in scheme_desc for kw in intent_keywords.get(user_intent, [])):
            score += 0.3
        
        user_level = user_profile.get("skill_level", 0)
        if user_level >= 3:
            score += 0.2
        elif user_level >= 1:
            score += 0.1
        
        user_state = user_profile.get("state", "").lower()
        scheme_state = scheme.get("state", "").lower()
        if not scheme_state or scheme_state == "all india" or user_state in scheme_state:
            score += 0.1
        
        return min(score, 1.0)
    
    def search_schemes(self, user_profile: dict, limit: int = 10) -> list[dict]:
        results = self.search(user_profile, limit)
        # Add full URL for each scheme
        for scheme in results:
            slug = scheme.get('url', '')
            if slug:
                scheme['url'] = f"https://www.myscheme.gov.in/schemes/{slug}"
        return results
