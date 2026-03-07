import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// Auto-attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);

// Jobs
export const createJob = (data) => api.post('/jobs/', data);
export const getJobs = () => api.get('/jobs/');
export const getJob = (id) => api.get(`/jobs/${id}`);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);

// Resumes
export const uploadResume = (formData) => api.post('/resumes/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getResumes = (jobId) => api.get('/resumes/', { params: { job_id: jobId } });

// Analysis
export const runAnalysis = (resumeId, jobId) =>
  api.post(`/analysis/run?resume_id=${resumeId}&job_id=${jobId}`);
export const getAnalysis = (id) => api.get(`/analysis/results/${id}`);
export const getRankings = (jobId) => api.get(`/analysis/rankings/${jobId}`);
export const getSharedAnalysis = (token) => api.get(`/analysis/share/${token}`);

export default api;