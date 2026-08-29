# AI Resume Screener

An AI-powered resume screening platform that semantically matches resumes to job descriptions, ranks candidates, and generates Resume DNA profiles.

## 🚀 Live Demo

- **Frontend:** https://ai-resume-screener-nine-mu.vercel.app
- **Backend API:** https://ai-resume-screener-k2gi.onrender.com
- **API Docs:** https://ai-resume-screener-k2gi.onrender.com/docs (set DEBUG=true to enable)

## 🧠 Features

- Semantic resume-to-job matching using `sentence-transformers` (all-MiniLM-L6-v2)
- Skill gap analysis and candidate ranking
- Resume DNA Profiling — identifies candidate work style (Builder, Leader, Specialist, Collaborator)
- JWT authentication
- PDF and DOCX resume parsing
- Shareable analysis results

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS, Axios |
| Backend | FastAPI (Python 3.11) |
| Database | PostgreSQL |
| AI/ML | sentence-transformers, scikit-learn |
| Auth | JWT (python-jose + passlib) |
| Hosting | Vercel (frontend) + Render (backend) |

## 🏃 Run Locally

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

## 📁 Project Structure

```
AI-Resume-Screener/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── schemas/
│   │   ├── main.py
│   │   └── config.py
│   └── requirements.txt
└── frontend/
    └── src/
```

## 👩‍💻 Built by

Lebi Maria C — Final year B.E. Computer Science (AI & ML), V.S.B. Engineering College