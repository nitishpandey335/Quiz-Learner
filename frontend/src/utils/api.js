import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

// Attach token from localStorage on every request
API.interceptors.request.use((config) => {
    const user = localStorage.getItem('quizUser');
    if (user) {
        const { token } = JSON.parse(user);
        if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Auth
export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Users (admin)
export const getAllUsers = () => API.get('/users');
export const createUserByAdmin = (data) => API.post('/users', data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const getPlatformAnalytics = () => API.get('/users/analytics');

// Quizzes
export const getPublishedQuizzes = (params) => API.get('/quizzes', { params });
export const getTeacherQuizzes = () => API.get('/quizzes/teacher');
export const getAllQuizzes = () => API.get('/quizzes/all');
export const getQuizById = (id) => API.get(`/quizzes/${id}`);
export const createQuiz = (data) => API.post('/quizzes', data);
export const updateQuiz = (id, data) => API.put(`/quizzes/${id}`, data);
export const deleteQuiz = (id) => API.delete(`/quizzes/${id}`);
export const getQuizAnalytics = (id) => API.get(`/quizzes/${id}/analytics`);

// Attempts
export const submitAttempt = (data) => API.post('/attempts', data);
export const getMyAttempts = () => API.get('/attempts/my');
export const getMyAnalytics = () => API.get('/attempts/my/analytics');
export const getAttemptById = (id) => API.get(`/attempts/${id}`);

// AI
export const generateAIQuestions = (data) => API.post('/ai/generate-questions', data);
export const suggestSubject = (data) => API.post('/ai/suggest-subject', data);
export const analyzePerformance = (data) => API.post('/ai/analyze-performance', data);

// Notes
export const getMyNotes = () => API.get('/notes');
export const getTeacherNotes = () => API.get('/notes/teacher');
export const createNote = (data) => API.post('/notes', data);
export const deleteNote = (id) => API.delete(`/notes/${id}`);
export const aiGenerateNote = (data) => API.post('/notes/ai-generate', data);
export const setStudentClass = (data) => API.put('/notes/set-class', data);
export const uploadPDFNote = (formData) => API.post('/notes/upload-pdf', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});
