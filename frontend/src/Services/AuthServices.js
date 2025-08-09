// src/services/authService.js
import axios from '../utils/axios';

const API_URL = '/api/auth';

// Login
export const loginUser = async (email, password) => {
  try {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const response = await axios.post(`${API_URL}/login`, { email, password });
    
    if (!response.data) {
      throw new Error('No response data received from server');
    }

    const { token, user } = response.data;
    
    if (!token) {
      throw new Error('No authentication token received');
    }

    // Set the authorization header for future requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Return both user and token for context
    return { user, token };
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        data: error.config?.data
      }
    });

    // Provide more specific error messages based on the response
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        throw new Error('Invalid email or password');
      } else if (error.response.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(`Server error (${error.response.status})`);
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'An error occurred during login');
    }
  }
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
