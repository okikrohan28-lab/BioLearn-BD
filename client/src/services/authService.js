import api from './api';

export const register = async (userData) => {
  return await api.post('/auth/register', userData);
};

export const login = async (credentials) => {
  return await api.post('/auth/login', credentials);
};

export const adminLogin = async (credentials) => {
  return await api.post('/auth/admin/login', credentials);
};

export const getProfile = async () => {
  return await api.get('/auth/profile');
};

export const updateProfile = async (profileData) => {
  return await api.put('/auth/profile', profileData);
};
