import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://taskly-ecfs.onrender.com',
});


// Add a request interceptor to add the token to all requests
instance.interceptors.request.use(
  (config) => {
    // Get user object from localStorage and extract token
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;