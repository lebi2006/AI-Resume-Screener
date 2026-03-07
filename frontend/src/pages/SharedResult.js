import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getSharedAnalysis } from '../services/api';
import { Brain, Dna, CheckCircle, XCircle, Loader, AlertCircle } from 'lucide-react';

const DNA_COLORS = {
  builder: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  leader: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  specialist: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  collaborator: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
};

export default function SharedResult() {
  const { token } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getSharedAnalysis(token)
      .then(res => setAnalysis(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Loader className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <AlertCircle className="w-12 h-12 text-red-400" />
      <h2 className="text-xl font-bold text-slate-700">Result not found</h2>
      <p className="text-slate-500">This link may have expired or is invalid.</p>
      <Link to="/" className="text-primary-500 hover:underline">Go to ResumeAI</Link>
    </div>
  );

  const dna = analysis?.dna_profile || {};
  const dominant = dna.dominant_type || 'collaborator';
  const dnaStyle = DNA_COLORS[dominant] || DNA_COLORS.collaborator;
  const score = Math.round(analysis?.overall_score || 0);
  const scoreColor = score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-500';

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="gradient-bg text-white py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Brain className="w-6 h-6" />
          <span className="font-bold text-xl">ResumeAI</span>
        </div>
        <p className="text-blue-100 text-sm">AI Resume Analysis Result</p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Overall Score */}
        <div className="card text-center">
          <p className="text-slate-500 text-sm mb-2">Overall Match Score</p>
          <p className={`text-6xl font-bold ${scoreColor}`}>{score}</p>
          <p className="text-slate-400 text-sm">/100</p>
          <div className="grid grid-cols-4 gap-3 mt-6">
            {[
              { label: 'Semantic', val: analysis?.semantic_score },
              { label: 'Skills', val: analysis?.skill_score },
              { label: 'Experience', val: analysis?.experience_score },
              { label: 'DNA Fit', val: analysis?.dna_fit_score },
            ].map((s, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3">
                <p className="text-lg font-bold text-slate-700">{Math.round(s.val)}</p>
                <p className="text-xs text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* DNA Card */}
        <div className={`card border-2 ${dnaStyle.border} ${dnaStyle.bg}`}>
          <div className="flex items-center gap-3 mb-3">
            <Dna className={`w-6 h-6 ${dnaStyle.text}`} />
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Resume DNA</p>
              <p className={`text-xl font-bold ${dnaStyle.text}`}>{dominant.toUpperCase()}</p>
            </div>
          </div>
          <p className="text-slate-600 text-sm">{dna.description}</p>
        </div>

        {/* Skills */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">Skills Analysis</h3>
          {analysis?.matched_skills?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-600 font-medium mb-2">✓ Matched</p>
              <div className="flex flex-wrap gap-2">
                {analysis.matched_skills.map((s, i) => (
                  <span key={i} className="bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded-full text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {analysis?.skill_gaps?.length > 0 && (
            <div>
              <p className="text-xs text-red-500 font-medium mb-2">✗ Missing</p>
              <div className="flex flex-wrap gap-2">
                {analysis.skill_gaps.map((s, i) => (
                  <span key={i} className="bg-red-50 text-red-600 border border-red-200 px-2 py-1 rounded-full text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Explanation */}
        <div className="card">
          <h3 className="font-semibold text-slate-800 mb-3">AI Explanation</h3>
          <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
            {analysis?.explanation}
          </p>
        </div>

        {/* CTA */}
        <div className="text-center py-4">
          <p className="text-slate-500 text-sm mb-3">Powered by ResumeAI</p>
          <Link
            to="/register"
            className="bg-primary-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors inline-block"
          >
            Screen your own resumes free →
          </Link>
        </div>
      </div>
    </div>
  );
}