from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.resume import Resume
from app.models.job import Job
from app.models.analysis import Analysis
from app.models.user import User
from app.schemas.resume import AnalysisResponse, CandidateRankingResponse
from app.routers.auth import get_current_user
from app.services.scorer import compute_full_score

router = APIRouter(prefix="/analysis", tags=["Analysis"])


@router.post("/run", response_model=AnalysisResponse, status_code=status.HTTP_201_CREATED)
def run_analysis(
    resume_id: int,
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch resume
    resume = db.query(Resume).filter(
        Resume.id == resume_id,
        Resume.user_id == current_user.id
    ).first()
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")

    # Fetch job
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    # Check if analysis already exists — rerun if so
    existing = db.query(Analysis).filter(
        Analysis.resume_id == resume_id,
        Analysis.job_id == job_id
    ).first()

    # Get parsed data
    parsed_data = resume.parsed_data or {}
    resume_skills = parsed_data.get("skills", [])
    resume_experience = parsed_data.get("experience_years", 0)
    resume_text = resume.raw_text or ""

    if not resume_text:
        raise HTTPException(
            status_code=400,
            detail="Resume text could not be extracted. Please re-upload."
        )

    # Run full AI scoring pipeline
    results = compute_full_score(
        resume_text=resume_text,
        resume_skills=resume_skills,
        resume_experience_years=resume_experience,
        job_description=job.description,
        job_required_skills=job.required_skills or [],
        job_experience_years=job.experience_years or 0
    )

    # Generate human-readable explanation
    explanation = generate_explanation(
        candidate_name=resume.candidate_name or "The candidate",
        results=results,
        job_title=job.title
    )

    if existing:
        # Update existing analysis
        existing.overall_score = results["overall_score"]
        existing.semantic_score = results["semantic_score"]
        existing.skill_score = results["skill_score"]
        existing.experience_score = results["experience_score"]
        existing.dna_fit_score = results["dna_fit_score"]
        existing.matched_skills = results["matched_skills"]
        existing.skill_gaps = results["skill_gaps"]
        existing.dna_profile = results["dna_profile"]
        existing.explanation = explanation
        db.commit()
        db.refresh(existing)
        return existing

    # Create new analysis
    analysis = Analysis(
        resume_id=resume_id,
        job_id=job_id,
        overall_score=results["overall_score"],
        semantic_score=results["semantic_score"],
        skill_score=results["skill_score"],
        experience_score=results["experience_score"],
        dna_fit_score=results["dna_fit_score"],
        matched_skills=results["matched_skills"],
        skill_gaps=results["skill_gaps"],
        dna_profile=results["dna_profile"],
        explanation=explanation
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis


@router.get("/results/{analysis_id}", response_model=AnalysisResponse)
def get_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis


@router.get("/share/{token}", response_model=AnalysisResponse)
def get_shared_analysis(token: str, db: Session = Depends(get_db)):
    """Public endpoint — no auth required. For shareable result links."""
    analysis = db.query(Analysis).filter(Analysis.share_token == token).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="Shared result not found")
    return analysis


@router.get("/rankings/{job_id}", response_model=List[CandidateRankingResponse])
def get_candidate_rankings(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Returns all candidates ranked by score for a specific job."""
    analyses = db.query(Analysis).filter(
        Analysis.job_id == job_id
    ).order_by(Analysis.overall_score.desc()).all()

    if not analyses:
        raise HTTPException(
            status_code=404,
            detail="No analyses found for this job"
        )

    rankings = []
    for rank, analysis in enumerate(analyses, start=1):
        resume = db.query(Resume).filter(Resume.id == analysis.resume_id).first()
        rankings.append(CandidateRankingResponse(
            rank=rank,
            resume_id=analysis.resume_id,
            candidate_name=resume.candidate_name if resume else None,
            candidate_email=resume.candidate_email if resume else None,
            overall_score=analysis.overall_score,
            matched_skills=analysis.matched_skills or [],
            skill_gaps=analysis.skill_gaps or [],
            dna_profile=analysis.dna_profile or {},
            share_token=analysis.share_token
        ))

    return rankings


def generate_explanation(
    candidate_name: str,
    results: dict,
    job_title: str
) -> str:
    """
    Generate a human-readable explanation of the AI scoring result.
    Rule-based for now — no LLM dependency needed.
    """
    overall = results["overall_score"]
    semantic = results["semantic_score"]
    skill_score = results["skill_score"]
    matched = results["matched_skills"]
    gaps = results["skill_gaps"]
    dna = results["dna_profile"]

    # Overall verdict
    if overall >= 80:
        verdict = "an excellent match"
    elif overall >= 60:
        verdict = "a good match"
    elif overall >= 40:
        verdict = "a partial match"
    else:
        verdict = "a weak match"

    explanation = f"{candidate_name} is {verdict} for the {job_title} role "
    explanation += f"with an overall score of {overall}/100.\n\n"

    # Semantic insight
    if semantic >= 70:
        explanation += "✅ Their resume content strongly aligns with the job description. "
    elif semantic >= 50:
        explanation += "⚠️ Their resume partially aligns with the job description. "
    else:
        explanation += "❌ Their resume has limited alignment with the job description. "

    # Skills insight
    if matched:
        explanation += f"They match {len(matched)} required skill(s): {', '.join(matched)}. "
    if gaps:
        explanation += f"Missing skills: {', '.join(gaps)}. "

    # DNA insight
    dominant = dna.get("dominant_type", "collaborator")
    explanation += f"\n\n🧬 Resume DNA: {candidate_name} profiles as a "
    explanation += f"'{dominant.upper()}' — {dna.get('description', '')}. "
    explanation += f"Best fit for: {', '.join(dna.get('best_fit', []))}."

    return explanation