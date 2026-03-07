from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any


class ResumeResponse(BaseModel):
    id: int
    user_id: int
    job_id: Optional[int]
    filename: str
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


class AnalysisResponse(BaseModel):
    id: int
    resume_id: int
    job_id: int
    overall_score: float
    semantic_score: float
    skill_score: float
    experience_score: float
    dna_fit_score: float
    skill_gaps: List[str]
    matched_skills: List[str]
    dna_profile: Dict[str, Any]
    explanation: Optional[str]
    share_token: str
    created_at: datetime

    class Config:
        from_attributes = True


class CandidateRankingResponse(BaseModel):
    rank: int
    resume_id: int
    candidate_name: Optional[str]
    candidate_email: Optional[str]
    overall_score: float
    matched_skills: List[str]
    skill_gaps: List[str]
    dna_profile: Dict[str, Any]
    share_token: str