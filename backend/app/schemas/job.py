from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    required_skills: List[str] = []
    experience_years: int = 0


class JobUpdate(BaseModel):
    title: Optional[str] = None
    company: Optional[str] = None
    description: Optional[str] = None
    required_skills: Optional[List[str]] = None
    experience_years: Optional[int] = None


class JobResponse(BaseModel):
    id: int
    user_id: int
    title: str
    company: str
    description: str
    required_skills: List[str]
    experience_years: int
    created_at: datetime

    class Config:
        from_attributes = True