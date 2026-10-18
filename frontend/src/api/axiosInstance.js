import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 30000,

});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    // Handle 401 - redirect to login (let the auth slice handle state)
    if (error.response?.status === 401) {
      // Dispatch clearAuth from store if needed
      // We don't import store here to avoid circular deps
      // The components/routes will handle redirection via auth state
    }

    return Promise.reject({ ...error, message });
  }
);

export default api;
