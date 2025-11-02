import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  verify: () => api.get('/auth/verify'),
}

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  searchUsers: (query) => api.get(`/users/search?q=${query}`),
  updateStatus: (status) => api.put('/users/status', { status }),
}

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  updateFile: (id, data) => api.put(`/projects/${id}/files`, data),
  addCollaborator: (id, data) => api.post(`/projects/${id}/collaborators`, data),
}

// Chat API
export const chatAPI = {
  getAll: () => api.get('/chat'),
  getById: (id) => api.get(`/chat/${id}`),
  start: (data) => api.post('/chat/start', data),
  sendMessage: (id, data) => api.post(`/chat/${id}/messages`, data),
  markAsRead: (id) => api.put(`/chat/${id}/read`),
}

// AI API (through Socket.IO)
export const aiAPI = {
  // This will be handled through socket events
}

export default api