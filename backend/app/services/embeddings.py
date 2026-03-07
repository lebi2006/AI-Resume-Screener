from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from functools import lru_cache


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    """
    Load model once and cache it in memory.
    all-MiniLM-L6-v2 is fast, lightweight (80MB), and production-grade.
    First run will download it automatically.
    """
    print("Loading sentence-transformer model...")
    return SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str) -> np.ndarray:
    """Convert text to a 384-dimensional embedding vector."""
    model = get_model()
    return model.encode(text, convert_to_numpy=True)


def compute_semantic_similarity(text1: str, text2: str) -> float:
    """
    Compute semantic similarity between two texts.
    Returns a score between 0.0 and 1.0.
    """
    emb1 = get_embedding(text1).reshape(1, -1)
    emb2 = get_embedding(text2).reshape(1, -1)
    score = cosine_similarity(emb1, emb2)[0][0]
    # Convert to 0-100 scale and clamp
    return float(np.clip(score * 100, 0, 100))


def compute_skill_score(resume_skills: list, required_skills: list) -> dict:
    """
    Compare resume skills against job required skills.
    Returns matched skills, gaps, and a score.
    """
    if not required_skills:
        return {
            "score": 50.0,
            "matched": [],
            "gaps": []
        }

    resume_skills_lower = [s.lower() for s in resume_skills]
    required_skills_lower = [s.lower() for s in required_skills]

    matched = [
        s for s in required_skills_lower
        if s in resume_skills_lower
    ]
    gaps = [
        s for s in required_skills_lower
        if s not in resume_skills_lower
    ]

    score = (len(matched) / len(required_skills_lower)) * 100

    return {
        "score": round(score, 2),
        "matched": matched,
        "gaps": gaps
    }


def compute_experience_score(resume_years: int, required_years: int) -> float:
    """
    Score candidate experience against job requirements.
    Returns 0-100.
    """
    if required_years == 0:
        return 100.0

    if resume_years >= required_years:
        # Full score if meets or exceeds requirement
        bonus = min((resume_years - required_years) * 5, 20)
        return min(100.0, 80.0 + bonus)
    else:
        # Partial score proportional to how close they are
        ratio = resume_years / required_years
        return round(ratio * 70, 2)  # Max 70 if under-experienced