import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instances
export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API Service Classes
export class AuthService {
  static async login(email, password) {
    const response = await authAPI.post('/auth/login', { email, password });
    return response.data;
  }

  static async register(userData) {
    const response = await authAPI.post('/auth/register', userData);
    return response.data;
  }

  static async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }

  static async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  static async refreshToken(refreshToken) {
    const response = await authAPI.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  static async changePassword(currentPassword, newPassword) {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }
}

export const CourseService = {
  getCourses: (params) => api.get('/courses', { params }),
  getCourse: (id) => api.get(`/courses/${id}`),
  enrollInCourse: (id) => api.post(`/courses/${id}/enroll`),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
  uploadVideo: (data, config) => api.post('/courses/upload-video', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config
  }),
  getUploadStatus: (uploadId) => api.get(`/courses/upload-status/${uploadId}`),
  generateTranscription: (videoId) => api.post(`/courses/transcribe/${videoId}`),
  generateSummary: (courseId) => api.post(`/courses/${courseId}/generate-summary`),
  generateQuiz: (lessonId) => api.post(`/courses/lessons/${lessonId}/generate-quiz`),
  addReview: (id, reviewData) => api.post(`/courses/${id}/reviews`, reviewData),
};

export class UserService {
  static async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  }

  static async updateProfile(userData) {
    const response = await api.put('/users/profile', userData);
    return response.data;
  }

  static async getDashboard() {
    const response = await api.get('/users/dashboard');
    return response.data;
  }

  static async getLearningStats() {
    const response = await api.get('/users/learning-stats');
    return response.data;
  }

  static async addToWishlist(courseId) {
    const response = await api.post(`/users/wishlist/${courseId}`);
    return response.data;
  }

  static async removeFromWishlist(courseId) {
    const response = await api.delete(`/users/wishlist/${courseId}`);
    return response.data;
  }
}

export class ProgressService {
  static async getProgress(courseId) {
    const response = await api.get(`/progress/${courseId}`);
    return response.data;
  }

  static async completeLesson(courseId, lessonData) {
    const response = await api.post(`/progress/${courseId}/lesson-complete`, lessonData);
    return response.data;
  }

  static async updatePosition(courseId, positionData) {
    const response = await api.post(`/progress/${courseId}/update-position`, positionData);
    return response.data;
  }

  static async addNote(courseId, noteData) {
    const response = await api.post(`/progress/${courseId}/notes`, noteData);
    return response.data;
  }

  static async getNotes(courseId, lessonId) {
    const response = await api.get(`/progress/${courseId}/notes/${lessonId}`);
    return response.data;
  }

  static async deleteNote(courseId, noteId) {
    const response = await api.delete(`/progress/${courseId}/notes/${noteId}`);
    return response.data;
  }

  static async addBookmark(courseId, bookmarkData) {
    const response = await api.post(`/progress/${courseId}/bookmarks`, bookmarkData);
    return response.data;
  }

  static async getBookmarks(courseId) {
    const response = await api.get(`/progress/${courseId}/bookmarks`);
    return response.data;
  }

  static async deleteBookmark(courseId, bookmarkId) {
    const response = await api.delete(`/progress/${courseId}/bookmarks/${bookmarkId}`);
    return response.data;
  }
}

export class AIService {
  static async transcribeMedia(formData) {
    const response = await api.post('/ai/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 300000, // 5 minutes for large files
    });
    return response.data;
  }

  static async translateText(textData) {
    const response = await api.post('/ai/translate', textData);
    return response.data;
  }

  static async generateSummary(summaryData) {
    const response = await api.post('/ai/summarize', summaryData);
    return response.data;
  }

  static async generateQuiz(quizData) {
    const response = await api.post('/ai/generate-quiz', quizData);
    return response.data;
  }

  static async analyzePerformance() {
    const response = await api.post('/ai/analyze-performance');
    return response.data;
  }

  static async getSupportedLanguages() {
    const response = await api.get('/ai/supported-languages');
    return response.data;
  }
}

// Utility functions
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'An error occurred',
      status: error.response.status,
      details: error.response.data?.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      status: 0,
      details: null,
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: 0,
      details: null,
    };
  }
};

export const uploadFile = async (endpoint, file, onProgress = null) => {
  const formData = new FormData();
  formData.append('file', file);

  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  if (onProgress) {
    config.onUploadProgress = (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress(percentCompleted);
    };
  }

  const response = await api.post(endpoint, formData, config);
  return response.data;
};

// Export default api instance
export default api;
