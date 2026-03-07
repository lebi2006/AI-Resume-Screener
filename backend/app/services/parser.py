import os
import re
from typing import Optional
import fitz  # PyMuPDF
from docx import Document


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    text = ""
    with fitz.open(file_path) as doc:
        for page in doc:
            text += page.get_text()
    return text.strip()


def extract_text_from_docx(file_path: str) -> str:
    """Extract all text from a DOCX file."""
    doc = Document(file_path)
    return "\n".join([para.text for para in doc.paragraphs]).strip()


def extract_text(file_path: str) -> str:
    """Auto-detect file type and extract text."""
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(file_path)
    elif ext == ".docx":
        return extract_text_from_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {ext}")


def extract_email(text: str) -> Optional[str]:
    """Extract first email address found in text."""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_phone(text: str) -> Optional[str]:
    """Extract first phone number found in text."""
    pattern = r'(\+?\d{1,3}[\s\-]?)?(\(?\d{3}\)?[\s\-]?)(\d{3}[\s\-]?\d{4})'
    match = re.search(pattern, text)
    return match.group(0).strip() if match else None


def extract_name(text: str) -> Optional[str]:
    """Extract candidate name from the first non-empty line."""
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    if lines:
        first_line = lines[0]
        # Name is usually short and has no special characters
        if len(first_line) < 60 and "@" not in first_line:
            return first_line
    return None


def extract_skills_section(text: str) -> list:
    """Extract skills from resume text using common skill keywords."""
    KNOWN_SKILLS = [
        # Programming languages
        "python", "java", "javascript", "typescript", "c++", "c#", "ruby",
        "go", "rust", "swift", "kotlin", "php", "scala", "r",
        # Web
        "react", "angular", "vue", "node.js", "fastapi", "django", "flask",
        "express", "html", "css", "tailwind", "bootstrap", "nextjs",
        # Data & AI
        "machine learning", "deep learning", "nlp", "computer vision",
        "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
        "data analysis", "data science", "sql", "mongodb",
        # Cloud & DevOps
        "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd",
        "git", "github", "linux", "terraform", "jenkins",
        # Databases
        "postgresql", "mysql", "redis", "elasticsearch", "sqlite",
        # Other
        "rest api", "graphql", "agile", "scrum", "microservices"
    ]
    text_lower = text.lower()
    found = [skill for skill in KNOWN_SKILLS if skill in text_lower]
    return list(set(found))


def extract_experience_years(text: str) -> int:
    """Estimate years of experience from resume text."""
    patterns = [
        r'(\d+)\+?\s*years?\s*of\s*experience',
        r'(\d+)\+?\s*years?\s*experience',
        r'experience\s*of\s*(\d+)\+?\s*years?',
    ]
    for pattern in patterns:
        match = re.search(pattern, text.lower())
        if match:
            return int(match.group(1))
    return 0


def parse_resume(file_path: str) -> dict:
    """
    Main function — parses resume file and returns structured data.
    Returns a dict with all extracted fields.
    """
    raw_text = extract_text(file_path)

    parsed = {
        "raw_text": raw_text,
        "candidate_name": extract_name(raw_text),
        "candidate_email": extract_email(raw_text),
        "candidate_phone": extract_phone(raw_text),
        "skills": extract_skills_section(raw_text),
        "experience_years": extract_experience_years(raw_text),
        "word_count": len(raw_text.split()),
        "char_count": len(raw_text)
    }

    return parsed