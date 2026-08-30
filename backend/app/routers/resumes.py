from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid

from app.database import get_db
from app.models.resume import Resume
from app.models.job import Job
from app.models.user import User
from app.schemas.resume import ResumeResponse
from app.routers.auth import get_current_user
from app.config import get_settings
from app.services.parser import parse_resume

router = APIRouter(prefix="/resumes", tags=["Resumes"])
settings = get_settings()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB



@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    job_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are allowed"
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File size must be under 5MB"
        )

    # Validate job exists if job_id provided
    if job_id:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

    # Save file with unique name
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, unique_filename)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    with open(file_path, "wb") as f:
        f.write(contents)

    # Auto-parse resume
    try:
        parsed = parse_resume(file_path)
    except Exception as e:
        parsed = {"raw_text": "", "skills": [], "experience_years": 0}

    # Save to database with parsed data
    resume = Resume(
        user_id=current_user.id,
        job_id=job_id,
        filename=file.filename,
        file_path=file_path,
        candidate_name=parsed.get("candidate_name"),
        candidate_email=parsed.get("candidate_email"),
        raw_text=parsed.get("raw_text"),
        parsed_data=parsed
    )
    db.add(resume)
    db.commit()
    db.refresh(resume)
    return resume


@router.get("/", response_model=List[ResumeResponse])
def get_resumes(
    job_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Resume).filter(Resume.user_id == current_user.id)
    if job_id:
        query = query.filter(Resume.job_id == job_id)
    return query.all()


@router.get("/{resume_id}", response_model=ResumeResponse)
def get_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume


@router.delete("/{resume_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_resume(
    resume_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Delete linked analyses first to avoid FK constraint violation
    from app.models.analysis import Analysis
    db.query(Analysis).filter(Analysis.resume_id == resume_id).delete()

    # Delete file from disk (best effort)
    try:
        if resume.file_path and os.path.exists(resume.file_path):
            os.remove(resume.file_path)
    except Exception:
        pass

    db.delete(resume)
    db.commit()
    return None