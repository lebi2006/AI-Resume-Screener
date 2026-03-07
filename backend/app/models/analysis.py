from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import secrets
from app.database import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=False)

    # Scores (0.0 - 100.0)
    overall_score = Column(Float, default=0.0)
    semantic_score = Column(Float, default=0.0)
    skill_score = Column(Float, default=0.0)
    experience_score = Column(Float, default=0.0)
    dna_fit_score = Column(Float, default=0.0)

    # AI outputs
    skill_gaps = Column(JSON, default=list)       # ["Docker", "Kubernetes"]
    matched_skills = Column(JSON, default=list)   # ["Python", "FastAPI"]
    dna_profile = Column(JSON, default=dict)      # work style archetype
    explanation = Column(Text, nullable=True)     # human readable AI explanation

    # Sharing
    share_token = Column(String(64), unique=True, default=lambda: secrets.token_urlsafe(32))

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    resume = relationship("Resume", back_populates="analysis")
    job = relationship("Job", back_populates="analyses")