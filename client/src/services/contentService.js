import api from './api';

// Catalogue (hierarchical view)
export const getCatalogue = async () => {
  return await api.get('/catalogue');
};

// Papers
export const getPapers = async () => {
  return await api.get('/papers');
};

export const getPaperById = async (id) => {
  return await api.get(`/papers/${id}`);
};

export const createPaper = async (data) => {
  return await api.post('/papers', data);
};

export const updatePaper = async (id, data) => {
  return await api.put(`/papers/${id}`, data);
};

export const deletePaper = async (id) => {
  return await api.delete(`/papers/${id}`);
};

// Chapters
export const getChapters = async (paperId) => {
  const url = paperId ? `/chapters?paperId=${paperId}` : '/chapters';
  return await api.get(url);
};

export const createChapter = async (data) => {
  return await api.post('/chapters', data);
};

export const updateChapter = async (id, data) => {
  return await api.put(`/chapters/${id}`, data);
};

export const deleteChapter = async (id) => {
  return await api.delete(`/chapters/${id}`);
};

// Topics
export const getTopics = async (chapterId) => {
  const url = chapterId ? `/topics?chapterId=${chapterId}` : '/topics';
  return await api.get(url);
};

export const createTopic = async (data) => {
  return await api.post('/topics', data);
};

export const updateTopic = async (id, data) => {
  return await api.put(`/topics/${id}`, data);
};

export const deleteTopic = async (id) => {
  return await api.delete(`/topics/${id}`);
};

// Resources
export const getResources = async (topicId) => api.get(`/resources?topicId=${topicId}`);
export const createResource = async (data) => {
  if (data instanceof FormData) {
    return api.post('/resources', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.post('/resources', data);
};
export const updateResource = async (id, data) => {
  if (data instanceof FormData) {
    return api.put(`/resources/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return api.put(`/resources/${id}`, data);
};
export const deleteResource = async (id) => api.delete(`/resources/${id}`);

// Quizzes
export const getQuizzes = async (params) => api.get('/quizzes', { params });
export const createQuiz = async (data) => api.post('/quizzes', data);
export const updateQuiz = async (id, data) => api.put(`/quizzes/${id}`, data);
export const deleteQuiz = async (id) => api.delete(`/quizzes/${id}`);
export const startQuiz = async (quizId) => api.get(`/quizzes/${quizId}/start`);
export const submitQuiz = async (quizId, answers) => api.post(`/quizzes/${quizId}/submit`, { answers });
export const getMyQuizAttempt = async (quizId) => api.get(`/quizzes/${quizId}/attempts`);

// Questions
export const getQuestions = async (quizId) => api.get(`/questions?quizId=${quizId}`);
export const createQuestion = async (data) => api.post('/questions', data);
export const createBulkQuestions = async (quizId, questions) => api.post('/questions/bulk', { quiz_id: quizId, questions });
export const updateQuestion = async (id, data) => api.put(`/questions/${id}`, data);
export const deleteQuestion = async (id) => api.delete(`/questions/${id}`);

// Attempts
export const getAttemptDetail = async (attemptId) => api.get(`/attempts/${attemptId}`);
export const getMyAttempts = async () => api.get('/attempts/my');

// Weekly Challenges
export const getChallenges = async () => api.get('/challenges');
export const getChallengeById = async (id) => api.get(`/challenges/${id}`);
export const createChallenge = async (data) => api.post('/challenges', data);
export const updateChallenge = async (id, data) => api.put(`/challenges/${id}`, data);
export const deleteChallenge = async (id) => api.delete(`/challenges/${id}`);
export const startChallenge = async (id) => api.get(`/challenges/${id}/start`);
export const submitChallenge = async (id, answers) => api.post(`/challenges/${id}/submit`, { answers });

// Subscriptions
export const getMySubscription = async () => api.get('/subscriptions/my');
export const createSubscription = async (data) => api.post('/subscriptions', data);
export const getAllSubscriptions = async () => api.get('/subscriptions');

// Payments
export const initiatePayment = async (data) => api.post('/payments', data);
export const confirmDemoPayment = async (paymentId) => api.post(`/payments/${paymentId}/confirm-demo`);

// Helper to resolve static asset / uploaded file URLs
export const resolveFileUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/api\/?$/, '');
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};
