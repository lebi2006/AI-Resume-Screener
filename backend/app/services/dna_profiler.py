from typing import Dict, Any


# DNA archetypes with their signal keywords
DNA_ARCHETYPES = {
    "builder": {
        "keywords": [
            "built", "developed", "created", "launched", "shipped",
            "side project", "open source", "startup", "founded",
            "prototype", "mvp", "deployed", "implemented"
        ],
        "description": "Hands-on creator who loves building things from scratch",
        "strengths": ["Self-starter", "Ownership mindset", "Fast executor"],
        "best_fit": ["Startups", "Early-stage teams", "Product companies"]
    },
    "leader": {
        "keywords": [
            "led", "managed", "mentored", "coordinated", "directed",
            "team of", "reports", "supervised", "organized", "drove",
            "stakeholder", "cross-functional", "strategy"
        ],
        "description": "Natural leader who thrives managing people and projects",
        "strengths": ["Team management", "Strategic thinking", "Communication"],
        "best_fit": ["Mid-size companies", "Team lead roles", "Management tracks"]
    },
    "specialist": {
        "keywords": [
            "specialized", "expert", "certified", "research", "published",
            "deep dive", "optimized", "architected", "designed system",
            "performance", "scalability", "advanced", "phd", "thesis"
        ],
        "description": "Deep domain expert with concentrated technical knowledge",
        "strengths": ["Deep expertise", "Problem solving", "Technical depth"],
        "best_fit": ["Technical roles", "R&D teams", "Senior IC positions"]
    },
    "collaborator": {
        "keywords": [
            "collaborated", "partnered", "worked with", "team player",
            "agile", "scrum", "sprint", "reviewed", "feedback",
            "communication", "aligned", "supported", "contributed"
        ],
        "description": "Team-oriented professional who excels in collaborative environments",
        "strengths": ["Teamwork", "Adaptability", "Process-oriented"],
        "best_fit": ["Large enterprises", "Agile teams", "Support functions"]
    }
}


def compute_dna_profile(resume_text: str) -> Dict[str, Any]:
    """
    Analyze resume text and return a DNA work style profile.
    Returns archetype scores, dominant type, and fit insights.
    """
    text_lower = resume_text.lower()
    scores = {}

    for archetype, data in DNA_ARCHETYPES.items():
        hits = sum(1 for kw in data["keywords"] if kw in text_lower)
        scores[archetype] = hits

    total_hits = sum(scores.values()) or 1  # avoid division by zero

    # Normalize to percentages
    percentages = {
        archetype: round((score / total_hits) * 100, 1)
        for archetype, score in scores.items()
    }

    # Find dominant archetype
    dominant = max(scores, key=scores.get)
    dominant_data = DNA_ARCHETYPES[dominant]

    return {
        "dominant_type": dominant,
        "scores": percentages,
        "description": dominant_data["description"],
        "strengths": dominant_data["strengths"],
        "best_fit": dominant_data["best_fit"],
        "raw_hits": scores
    }


def compute_dna_fit_score(candidate_dna: Dict, job_description: str) -> float:
    """
    Score how well a candidate's DNA fits the job context.
    Startup language → builder scores higher, etc.
    """
    job_lower = job_description.lower()
    dominant = candidate_dna.get("dominant_type", "collaborator")

    # Context signals in job description
    startup_signals = ["startup", "fast-paced", "wear many hats", "early stage", "founding"]
    leadership_signals = ["lead", "manage", "mentor", "team lead", "senior"]
    specialist_signals = ["expert", "deep knowledge", "specialized", "research", "architect"]
    team_signals = ["team player", "collaborative", "agile", "cross-functional"]

    signal_map = {
        "builder": startup_signals,
        "leader": leadership_signals,
        "specialist": specialist_signals,
        "collaborator": team_signals
    }

    matched_signals = sum(
        1 for signal in signal_map.get(dominant, [])
        if signal in job_lower
    )

    base_score = 60.0
    bonus = matched_signals * 10
    return min(100.0, base_score + bonus)