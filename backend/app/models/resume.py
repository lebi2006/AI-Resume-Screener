from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    job_id = Column(Integer, ForeignKey("jobs.id"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    candidate_name = Column(String(100), nullable=True)
    candidate_email = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=True)
    parsed_data = Column(JSON, default=dict)  # structured fields
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    owner = relationship("User", back_populates="resumes")
    job = relationship("Job", back_populates="resumes")
    analysis = relationship("Analysis", back_populates="resume", uselist=False)