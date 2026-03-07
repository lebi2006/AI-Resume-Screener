from app.services.embeddings import (
    compute_semantic_similarity,
    compute_skill_score,
    compute_experience_score
)
from app.services.dna_profiler import compute_dna_profile, compute_dna_fit_score
from typing import Dict, Any


# Scoring weights — must add up to 1.0
WEIGHTS = {
    "semantic": 0.40,   # How well resume matches JD semantically
    "skills":   0.35,   # Matched required skills
    "experience": 0.15, # Years of experience match
    "dna_fit":  0.10    # Work style fit
}


def compute_full_score(
    resume_text: str,
    resume_skills: list,
    resume_experience_years: int,
    job_description: str,
    job_required_skills: list,
    job_experience_years: int
) -> Dict[str, Any]:
    """
    Master scoring function — runs all AI components and returns
    a complete analysis with weighted overall score.
    """

    # 1. Semantic similarity (embeddings)
    semantic_score = compute_semantic_similarity(resume_text, job_description)

    # 2. Skill matching
    skill_result = compute_skill_score(resume_skills, job_required_skills)
    skill_score = skill_result["score"]

    # 3. Experience scoring
    experience_score = compute_experience_score(
        resume_experience_years,
        job_experience_years
    )

    # 4. DNA profiling
    dna_profile = compute_dna_profile(resume_text)
    dna_fit_score = compute_dna_fit_score(dna_profile, job_description)

    # 5. Weighted overall score
    overall_score = (
        semantic_score   * WEIGHTS["semantic"] +
        skill_score      * WEIGHTS["skills"] +
        experience_score * WEIGHTS["experience"] +
        dna_fit_score    * WEIGHTS["dna_fit"]
    )

    return {
        "overall_score": round(overall_score, 2),
        "semantic_score": round(semantic_score, 2),
        "skill_score": round(skill_score, 2),
        "experience_score": round(experience_score, 2),
        "dna_fit_score": round(dna_fit_score, 2),
        "matched_skills": skill_result["matched"],
        "skill_gaps": skill_result["gaps"],
        "dna_profile": dna_profile
    }