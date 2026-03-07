import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getJob, getResumes, uploadResume,
  runAnalysis, getRankings, deleteResume as deleteResumeApi, updateJob
} from '../services/api';
import Navbar from '../components/Navbar';
import {
  Upload, Brain, Trophy, Loader, ArrowLeft,
  FileText, CheckCircle, XCircle, Dna, Star,
  Trash2, X, Pencil 
} from 'lucide-react';
import toast from 'react-hot-toast';

const scoreColor = (score) => {
  if (score >= 75) return 'text-green-600';
  if (score >= 50) return 'text-yellow-600';
  return 'text-red-500';
};

const scoreBg = (score) => {
  if (score >= 75) return 'bg-green-50 border-green-200';
  if (score >= 50) return 'bg-yellow-50 border-yellow-200';
  return 'bg-red-50 border-red-200';
};

const ScoreRing = ({ score, size = 80 }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 75 ? '#16a34a' : score >= 50 ? '#ca8a04' : '#dc2626';
  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle cx="40" cy="40" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
      <circle cx="40" cy="40" r={radius} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 40 40)"
        className="score-ring"
      />
      <text x="40" y="45" textAnchor="middle" fontSize="14"
        fontWeight="bold" fill={color}>
        {Math.round(score)}
      </text>
    </svg>
  );
};

export default function JobDetail() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState('resumes');
  const [deletingId, setDeletingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
  title: '',
  company: '',
  description: '',
  required_skills: '',
  experience_years: 0
});
const [editSubmitting, setEditSubmitting] = useState(false);

  useEffect(() => { fetchAll(); }, [jobId]);

  const fetchAll = async () => {
    try {
      const [jobRes, resumesRes] = await Promise.all([
        getJob(jobId),
        getResumes(jobId)
      ]);
      setJob(jobRes.data);
      setResumes(resumesRes.data);
      try {
        const rankRes = await getRankings(jobId);
        setRankings(rankRes.data);
      } catch {
        setRankings([]);
      }
    } catch {
      toast.error('Failed to load job');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Upload multiple files sequentially
  const handleFilesUpload = async (files) => {
    const validFiles = Array.from(files).filter(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx'].includes(ext)) {
        toast.error(`${file.name} — only PDF and DOCX allowed`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} — must be under 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setUploadProgress({ current: 0, total: validFiles.length });

    let successCount = 0;
    for (let i = 0; i < validFiles.length; i++) {
      setUploadProgress({ current: i + 1, total: validFiles.length });
      try {
        const formData = new FormData();
        formData.append('file', validFiles[i]);
        formData.append('job_id', jobId);
        await uploadResume(formData);
        successCount++;
      } catch {
        toast.error(`Failed to upload ${validFiles[i].name}`);
      }
    }

    if (successCount > 0) {
      toast.success(`${successCount} resume${successCount > 1 ? 's' : ''} uploaded!`);
    }
    setUploading(false);
    setUploadProgress({ current: 0, total: 0 });
    fetchAll();
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    handleFilesUpload(e.dataTransfer.files);
  }, [jobId]);

  // Analyze single resume
  const handleAnalyze = async (resumeId) => {
    setAnalyzingId(resumeId);
    try {
      const res = await runAnalysis(resumeId, jobId);
      toast.success('Analysis complete!');
      navigate(`/analysis/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  // Analyze ALL resumes at once
  const handleAnalyzeAll = async () => {
    if (resumes.length === 0) {
      toast.error('No resumes to analyze');
      return;
    }
    setAnalyzingAll(true);
    let successCount = 0;

    for (const resume of resumes) {
      try {
        await runAnalysis(resume.id, jobId);
        successCount++;
      } catch {
        // continue with next resume
      }
    }

    toast.success(`Analyzed ${successCount} resume${successCount > 1 ? 's' : ''}!`);
    setAnalyzingAll(false);

    // Refresh rankings and switch to rankings tab
    try {
      const rankRes = await getRankings(jobId);
      setRankings(rankRes.data);
    } catch {
      setRankings([]);
    }
    setActiveTab('rankings');
  };

  // Delete resume
  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Remove this resume?')) return;
    setDeletingId(resumeId);
    try {
      await deleteResumeApi(resumeId);
      toast.success('Resume removed');
      setResumes(resumes.filter(r => r.id !== resumeId));
    } catch {
      toast.error('Failed to remove resume');
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditOpen = () => {
  setEditForm({
    title: job.title,
    company: job.company,
    description: job.description,
    required_skills: job.required_skills?.join(', ') || '',
    experience_years: job.experience_years
  });
  setShowEditModal(true);
};

const handleEditSubmit = async (e) => {
  e.preventDefault();
  setEditSubmitting(true);
  try {
    const payload = {
      ...editForm,
      required_skills: editForm.required_skills
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      experience_years: parseInt(editForm.experience_years) || 0
    };
    const res = await updateJob(jobId, payload);
    setJob(res.data);
    setShowEditModal(false);
    toast.success('Job updated!');
  } catch {
    toast.error('Failed to update job');
  } finally {
    setEditSubmitting(false);
  }
};

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="flex items-center justify-center py-24">
        <Loader className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Job Header */}
        <div className="card mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">{job?.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-slate-500">{job?.company}</p>
                <button
                  onClick={handleEditOpen}
                  className="flex items-center gap-1 text-xs text-primary-500 hover:text-primary-600 border border-primary-200 px-2 py-1 rounded-lg hover:bg-primary-50 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    Edit Job
                </button>
              </div>
              <p className="text-slate-600 mt-3 text-sm leading-relaxed max-w-2xl">
                {job?.description}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="text-sm text-slate-500">
                {job?.experience_years}yr experience required
              </span>
              <div className="flex flex-wrap gap-2 justify-end">
                {job?.required_skills?.map((skill, i) => (
                  <span key={i}
                    className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full border border-primary-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl p-1 border border-slate-200 mb-6 w-fit">
          {[
            { key: 'resumes', label: 'Resumes', icon: <FileText className="w-4 h-4" /> },
            { key: 'rankings', label: 'Rankings', icon: <Trophy className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.key === 'resumes' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}>
                  {resumes.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'resumes' && (
          <div className="space-y-6">
            {/* Upload Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
                dragOver
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-slate-50'
              }`}
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader className="w-10 h-10 text-primary-500 animate-spin" />
                  <p className="text-slate-600 font-medium">
                    Uploading {uploadProgress.current} of {uploadProgress.total} resumes...
                  </p>
                  <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all"
                      style={{
                        width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center">
                    <Upload className="w-8 h-8 text-primary-500" />
                  </div>
                  <div>
                    <p className="text-slate-700 font-medium mb-1">
                      Drop resumes here or click to upload
                    </p>
                    <p className="text-slate-400 text-sm">
                      PDF or DOCX · Max 5MB each · Multiple files supported
                    </p>
                  </div>
                  <label className="bg-primary-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer">
                    Choose Files
                    <input
                      type="file"
                      accept=".pdf,.docx"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFilesUpload(e.target.files)}
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Resume List */}
            {resumes.length > 0 && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">
                    Uploaded Resumes ({resumes.length})
                  </h2>
                  <button
                    onClick={handleAnalyzeAll}
                    disabled={analyzingAll}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {analyzingAll ? (
                      <><Loader className="w-3 h-3 animate-spin" /> Analyzing all...</>
                    ) : (
                      <><Brain className="w-3 h-3" /> Analyze All</>
                    )}
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {resumes.map(resume => (
                    <div key={resume.id}
                      className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-slate-500" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800 text-sm">
                            {resume.candidate_name || 'Unknown Candidate'}
                          </p>
                          <p className="text-xs text-slate-400">
                            {resume.filename} · {resume.candidate_email || 'No email found'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Delete button */}
                        <button
                          onClick={() => handleDeleteResume(resume.id)}
                          disabled={deletingId === resume.id}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove resume"
                        >
                          {deletingId === resume.id
                            ? <Loader className="w-4 h-4 animate-spin" />
                            : <Trash2 className="w-4 h-4" />
                          }
                        </button>

                        {/* Analyze button */}
                        <button
                          onClick={() => handleAnalyze(resume.id)}
                          disabled={analyzingId === resume.id || analyzingAll}
                          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50"
                        >
                          {analyzingId === resume.id ? (
                            <><Loader className="w-3 h-3 animate-spin" /> Analyzing...</>
                          ) : (
                            <><Brain className="w-3 h-3" /> Analyze</>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'rankings' && (
          <div className="card">
            <h2 className="text-lg font-semibold text-slate-800 mb-6">
              Candidate Rankings
            </h2>
            {rankings.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 mb-2">No rankings yet.</p>
                <p className="text-slate-400 text-sm">
                  Upload resumes and click "Analyze All" to rank candidates.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {rankings.map((candidate) => (
                  <div key={candidate.resume_id}
                    className={`border rounded-xl p-4 ${scoreBg(candidate.overall_score)}`}>
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                        candidate.rank === 1 ? 'bg-yellow-400 text-white' :
                        candidate.rank === 2 ? 'bg-slate-400 text-white' :
                        candidate.rank === 3 ? 'bg-amber-600 text-white' :
                        'bg-slate-200 text-slate-600'
                      }`}>
                        {candidate.rank === 1 ? <Star className="w-5 h-5" /> : candidate.rank}
                      </div>
                      <ScoreRing score={candidate.overall_score} />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-800">
                          {candidate.candidate_name || 'Unknown Candidate'}
                        </p>
                        <p className="text-sm text-slate-500 mb-2">
                          {candidate.candidate_email || '—'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {candidate.matched_skills?.map((skill, i) => (
                            <span key={i}
                              className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {skill}
                            </span>
                          ))}
                          {candidate.skill_gaps?.map((skill, i) => (
                            <span key={i}
                              className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600 bg-purple-50 px-3 py-1 rounded-full text-xs font-medium border border-purple-100">
                        <Dna className="w-3 h-3" />
                        {candidate.dna_profile?.dominant_type?.toUpperCase() || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Edit Job Modal */}
{showEditModal && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-slate-800">Edit Job</h2>
        <button
          onClick={() => setShowEditModal(false)}
          className="text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleEditSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Job Title
            </label>
            <input
              required
              value={editForm.title}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company
            </label>
            <input
              required
              value={editForm.company}
              onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Job Description
          </label>
          <textarea
            required
            rows={4}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Required Skills
            <span className="text-slate-400 font-normal"> (comma separated)</span>
          </label>
          <input
            value={editForm.required_skills}
            onChange={(e) => setEditForm({ ...editForm, required_skills: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="Python, FastAPI, PostgreSQL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Experience Required (years)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={editForm.experience_years}
            onChange={(e) => setEditForm({ ...editForm, experience_years: e.target.value })}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={editSubmitting}
            className="flex-1 bg-primary-500 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {editSubmitting ? (
              <><Loader className="w-4 h-4 animate-spin" /> Saving...</>
            ) : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </div>
  );
}