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
