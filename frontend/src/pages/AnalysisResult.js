import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getAnalysis } from '../services/api';
import Navbar from '../components/Navbar';
import {
  ArrowLeft, CheckCircle, XCircle, Dna,
  Brain, Target, Zap, Share2, Loader,
  Star, TrendingUp, AlertCircle, Copy
} from 'lucide-react';
import toast from 'react-hot-toast';

const ScoreBar = ({ label, score, color }) => (
  <div className="mb-4">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{Math.round(score)}/100</span>
    </div>
    <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-1000 ${
          score >= 75 ? 'bg-green-500' :
          score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
        }`}
        style={{ width: `${score}%` }}
      />
    </div>
  </div>
);

const ScoreRing = ({ score }) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
  const bgColor = score >= 75 ? '#dcfce7' : score >= 50 ? '#fef9c3' : '#fee2e2';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={radius}
          fill={bgColor} stroke="#e2e8f0" strokeWidth="12" />
        <circle cx="70" cy="70" r={radius}
          fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
          style={{ transition: 'stroke-dashoffset 1.5s ease-in-out' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold" style={{ color }}>
          {Math.round(score)}
        </p>
        <p className="text-xs text-slate-500">/ 100</p>
      </div>
    </div>
  );
};

const DNA_COLORS = {
  builder: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', dot: 'bg-orange-400' },
  leader: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', dot: 'bg-blue-400' },
  specialist: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', dot: 'bg-purple-400' },
  collaborator: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400' },
};

export default function AnalysisResult() {
  const { analysisId } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalysis();
  }, [analysisId]);

  const fetchAnalysis = async () => {
    try {
      const res = await getAnalysis(analysisId);
      setAnalysis(res.data);
    } catch {
      toast.error('Analysis not found');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyShare = () => {
    const url = `${window.location.origin}/share/${analysis.share_token}`;
    navigator.clipboard.writeText(url);
    toast.success('Share link copied to clipboard!');
  };

  const getVerdict = (score) => {
    if (score >= 80) return { label: 'Excellent Match', icon: <Star className="w-5 h-5" />, color: 'text-green-600', bg: 'bg-green-50 border-green-200' };
    if (score >= 60) return { label: 'Good Match', icon: <TrendingUp className="w-5 h-5" />, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' };
    if (score >= 40) return { label: 'Partial Match', icon: <AlertCircle className="w-5 h-5" />, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200' };
    return { label: 'Weak Match', icon: <XCircle className="w-5 h-5" />, color: 'text-red-600', bg: 'bg-red-50 border-red-200' };
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader className="w-10 h-10 animate-spin text-primary-500" />
        <p className="text-slate-500">Loading AI analysis...</p>
      </div>
    </div>
  );

  const dna = analysis?.dna_profile || {};
  const dominant = dna.dominant_type || 'collaborator';
  const dnaStyle = DNA_COLORS[dominant] || DNA_COLORS.collaborator;
  const verdict = getVerdict(analysis?.overall_score || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Page Title + Share */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">AI Analysis Result</h1>
            <p className="text-slate-500 text-sm mt-1">
              Analysis #{analysis?.id} · {new Date(analysis?.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleCopyShare}
            className="flex items-center gap-2 border border-slate-200 bg-white text-slate-600 px-4 py-2 rounded-lg text-sm hover:bg-slate-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share Result
          </button>
        </div>

        {/* Verdict Banner */}
        <div className={`border rounded-xl px-5 py-4 flex items-center gap-3 mb-6 ${verdict.bg}`}>
          <span className={verdict.color}>{verdict.icon}</span>
          <div>
            <p className={`font-bold ${verdict.color}`}>{verdict.label}</p>
            <p className="text-slate-600 text-sm">
              Overall score: {Math.round(analysis?.overall_score)}/100
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Score Breakdown */}
            <div className="card">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-slate-800">Score Breakdown</h2>
              </div>

              <div className="flex items-center gap-8 mb-8 flex-wrap">
                <ScoreRing score={analysis?.overall_score || 0} />
                <div className="flex-1 min-w-48">
                  <ScoreBar
                    label="Semantic Match"
                    score={analysis?.semantic_score || 0}
                    color={analysis?.semantic_score >= 75 ? 'text-green-600' :
                      analysis?.semantic_score >= 50 ? 'text-yellow-600' : 'text-red-500'}
                  />
                  <ScoreBar
                    label="Skill Match"
                    score={analysis?.skill_score || 0}
                    color={analysis?.skill_score >= 75 ? 'text-green-600' :
                      analysis?.skill_score >= 50 ? 'text-yellow-600' : 'text-red-500'}
                  />
                  <ScoreBar
                    label="Experience"
                    score={analysis?.experience_score || 0}
                    color={analysis?.experience_score >= 75 ? 'text-green-600' :
                      analysis?.experience_score >= 50 ? 'text-yellow-600' : 'text-red-500'}
                  />
                  <ScoreBar
                    label="DNA Fit"
                    score={analysis?.dna_fit_score || 0}
                    color={analysis?.dna_fit_score >= 75 ? 'text-green-600' :
                      analysis?.dna_fit_score >= 50 ? 'text-yellow-600' : 'text-red-500'}
                  />
                </div>
              </div>

              {/* Score weights note */}
              <p className="text-xs text-slate-400 border-t pt-3">
                Weighted: Semantic 40% · Skills 35% · Experience 15% · DNA Fit 10%
              </p>
            </div>

            {/* Skills Analysis */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-slate-800">Skills Analysis</h2>
              </div>

              {analysis?.matched_skills?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Matched Skills ({analysis.matched_skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.matched_skills.map((skill, i) => (
                      <span key={i}
                        className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-full text-sm font-medium">
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {analysis?.skill_gaps?.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    Missing Skills ({analysis.skill_gaps.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.skill_gaps.map((skill, i) => (
                      <span key={i}
                        className="bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full text-sm font-medium">
                        ✗ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!analysis?.matched_skills?.length && !analysis?.skill_gaps?.length && (
                <p className="text-slate-400 text-sm">No skill data available.</p>
              )}
            </div>

            {/* AI Explanation */}
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-primary-500" />
                <h2 className="text-lg font-semibold text-slate-800">AI Explanation</h2>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {analysis?.explanation}
              </p>
            </div>
          </div>

          {/* Right column — DNA Card */}
          <div className="space-y-6">
            <div className={`card border-2 ${dnaStyle.border} ${dnaStyle.bg}`}>
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <Dna className={`w-8 h-8 ${dnaStyle.text}`} />
                </div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">
                  Resume DNA
                </p>
                <h3 className={`text-2xl font-bold ${dnaStyle.text}`}>
                  {dominant.toUpperCase()}
                </h3>
                <p className="text-slate-600 text-sm mt-2">
                  {dna.description}
                </p>
              </div>

              {/* DNA Score bars */}
              <div className="space-y-2 mb-4">
                {Object.entries(dna.scores || {}).map(([type, pct]) => (
                  <div key={type}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize text-slate-600">{type}</span>
                      <span className="text-slate-500">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${DNA_COLORS[type]?.dot || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Strengths */}
              {dna.strengths?.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Strengths
                  </p>
                  {dna.strengths.map((s, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700 mb-1">
                      <CheckCircle className={`w-3.5 h-3.5 ${dnaStyle.text}`} />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {/* Best fit */}
              {dna.best_fit?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase mb-2">
                    Best Fit For
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {dna.best_fit.map((f, i) => (
                      <span key={i}
                        className={`text-xs px-2 py-0.5 rounded-full border ${dnaStyle.border} ${dnaStyle.text} bg-white/50`}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Share Card */}
            <div className="card text-center">
              <Share2 className="w-8 h-8 text-primary-500 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-800 mb-1">Share this result</h3>
              <p className="text-slate-500 text-xs mb-4">
                Send a public link to this candidate's analysis
              </p>
              <button
                onClick={handleCopyShare}
                className="w-full flex items-center justify-center gap-2 bg-primary-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Copy Share Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}