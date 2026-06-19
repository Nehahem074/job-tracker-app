import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || ''

const api = axios.create({ baseURL: BASE })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const registerUser  = (data) => api.post('/api/auth/register', data)
export const loginUser     = (data) => api.post('/api/auth/login', data)

// Jobs
export const getJobs       = ()     => api.get('/api/jobs')
export const createJob     = (data) => api.post('/api/jobs', data)
export const updateJob     = (id, data) => api.put(`/api/jobs/${id}`, data)
export const deleteJob     = (id)   => api.delete(`/api/jobs/${id}`)

// Resumes
export const uploadResume  = (formData) => api.post('/api/resume/upload', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
})
export const getResumes    = ()     => api.get('/api/resume')
export const deleteResume  = (id)   => api.delete(`/api/resume/${id}`)

// AI
export const generateCoverLetter = (data) => api.post('/api/ai/cover-letter', data)
export const scoreResume         = (data) => api.post('/api/ai/score-resume', data)

export default api