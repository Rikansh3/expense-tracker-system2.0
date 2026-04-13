import axios from 'axios';

const api = axios.create({
    baseURL: 'https://expense-backend-1-3lsu.onrender.com', // Backend Node.js URL
    withCredentials: true // For cookies
});

// Since we are also sending JWT token via response, we can set header fallback just in case
api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercept 401s
api.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // We'll let the specific component handle redirect via AuthContext
    }
    return Promise.reject(error);
});

export default api;
