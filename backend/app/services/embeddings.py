from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from functools import lru_cache

_model = None

def get_model():
    global _model
    if _model is None:
        from sentence_transformers import SentenceTransformer
        print("Loading sentence-transformer model...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model

def get_embedding(text: str) -> np.ndarray:
    model = get_model()
    return model.encode(text, convert_to_numpy=True)

def compute_semantic_similarity(text1: str, text2: str) -> float:
    emb1 = get_embedding(text1).reshape(1, -1)
    emb2 = get_embedding(text2).reshape(1, -1)
    score = cosine_similarity(emb1, emb2)[0][0]
    return float(np.clip(score * 100, 0, 100))

def compute_skill_score(resume_skills: list, required_skills: list) -> dict:
    if not required_skills:
        return {"score": 50.0, "matched": [], "gaps": []}
    resume_skills_lower = [s.lower() for s in resume_skills]
    required_skills_lower = [s.lower() for s in required_skills]
    matched = [s for s in required_skills_lower if s in resume_skills_lower]
    gaps = [s for s in required_skills_lower if s not in resume_skills_lower]
    score = (len(matched) / len(required_skills_lower)) * 100
    return {"score": round(score, 2), "matched": matched, "gaps": gaps}

def compute_experience_score(resume_years: int, required_years: int) -> float:
    if required_years == 0:
        return 100.0
    if resume_years >= required_years:
        bonus = min((resume_years - required_years) * 5, 20)
        return min(100.0, 80.0 + bonus)
    else:
        ratio = resume_years / required_years
        return round(ratio * 70, 2)