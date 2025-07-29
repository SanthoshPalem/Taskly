// src/services/authService.js
import axios from '../utils/axios';

const API_URL = '/api/auth';

// Login
export const loginUser = async (email, password) => {
  const res = await axios.post(`${API_URL}/login`, { email, password });
  if (res.data.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
  }
  return res.data;
};

// Register
export const registerUser = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  return res.data;
};

// Get current user
export const getCurrentUser = async () => {
  const res = await axios.get(`${API_URL}/me`);
  return res.data;
};
