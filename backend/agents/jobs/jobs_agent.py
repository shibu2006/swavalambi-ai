"""
jobs_agent.py — Jobs Agent for job matching.
"""

from agents.base_agent import BaseAgent


class JobsAgent(BaseAgent):
    """AI Agent for job matching."""
    
    def _build_text_for_embedding(self, doc: dict) -> str:
        location = doc.get('location', '')
        return f"{doc['title']} {doc['description']} {doc.get('company', '')} {' '.join(doc.get('skills', []))} {location}"
    
    def _build_query_text(self, user_profile: dict) -> str:
        state = user_profile.get('state', '')
        return f"{user_profile.get('skill', '')} job {state}"
    
    def calculate_eligibility_score(self, job: dict, user_profile: dict) -> float:
        score = 0.0
        
        # Skill match (70% of eligibility)
        user_skill = user_profile.get("skill", "").lower()
        job_skills = [s.lower() for s in job.get("skills", [])]
        job_title = job.get("title", "").lower()
        if user_skill in job_title or any(user_skill in s for s in job_skills):
            score += 0.7
        
        # Location match (30% of eligibility)
        user_state = user_profile.get("state", "").lower()
        job_location = job.get("location", "").lower()
        if user_state in job_location:
            score += 0.3
        
        return min(score, 1.0)
    
    def search_jobs(self, user_profile: dict, limit: int = 10) -> list[dict]:
        results = self.search(user_profile, limit)
        # Add job application URL for each job
        for job in results:
            job_id = job.get('id', '')
            if job_id:
                job['apply_url'] = f"https://www.ncs.gov.in/job-details/{job_id}"
        return results
